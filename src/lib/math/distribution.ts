export function calculateDistribution(
    V_source: number, // kV Line-to-Line
    length_km: number, // Total feeder length
    R_per_km: number, // Ohms/km
    X_per_km: number, // Ohms/km
    load1_kW: number, load1_pf: number, load1_dist: number, // km from source
    load2_kW: number, load2_pf: number, load2_dist: number,
    load3_kW: number, load3_pf: number, load3_dist: number
  ) {
    const V_phase = (V_source * 1000) / Math.sqrt(3);
    
    // Sort loads by distance
    const loads = [
        { id: 1, P: load1_kW * 1000, pf: load1_pf, dist: load1_dist },
        { id: 2, P: load2_kW * 1000, pf: load2_pf, dist: load2_dist },
        { id: 3, P: load3_kW * 1000, pf: load3_pf, dist: load3_dist }
    ].sort((a, b) => a.dist - b.dist);
    
    // Exact load flow on a radial feeder requires forward-backward sweep,
    // but for an educational visualizer, a single-pass approximation (assuming V ~ V_nominal at loads) is sufficient.
    
    // Calculate current drawn by each load (approx)
    const getI = (P: number, pf: number) => {
        if (P === 0) return { re: 0, im: 0 };
        const S = P / pf;
        const mag = S / (3 * V_phase);
        const theta = -Math.acos(pf); // Lagging
        return { re: mag * Math.cos(theta), im: mag * Math.sin(theta) };
    };
    
    loads.forEach(l => {
        const I = getI(l.P, l.pf);
        (l as any).I_re = I.re;
        (l as any).I_im = I.im;
    });
    
    // Calculate currents in sections
    // Section 1 (Source to Load 1)
    const I_sec1_re = loads[0]['I_re'] + loads[1]['I_re'] + loads[2]['I_re'];
    const I_sec1_im = loads[0]['I_im'] + loads[1]['I_im'] + loads[2]['I_im'];
    
    // Section 2 (Load 1 to Load 2)
    const I_sec2_re = loads[1]['I_re'] + loads[2]['I_re'];
    const I_sec2_im = loads[1]['I_im'] + loads[2]['I_im'];
    
    // Section 3 (Load 2 to Load 3)
    const I_sec3_re = loads[2]['I_re'];
    const I_sec3_im = loads[2]['I_im'];
    
    const sections = [
        { dist: loads[0].dist, I_re: I_sec1_re, I_im: I_sec1_im },
        { dist: loads[1].dist - loads[0].dist, I_re: I_sec2_re, I_im: I_sec2_im },
        { dist: loads[2].dist - loads[1].dist, I_re: I_sec3_re, I_im: I_sec3_im }
    ];
    
    let current_V_re = V_phase;
    let current_V_im = 0;
    let total_loss_W = 0;
    
    const profile = [{ distance: 0, voltage: V_source, node: 'Source' }];
    let accum_dist = 0;
    
    sections.forEach((sec, idx) => {
        if (sec.dist <= 0) return;
        
        const R = R_per_km * sec.dist;
        const X = X_per_km * sec.dist;
        
        // V_drop = I * Z = (I_re + j I_im) * (R + j X)
        const drop_re = sec.I_re * R - sec.I_im * X;
        const drop_im = sec.I_re * X + sec.I_im * R;
        
        current_V_re -= drop_re;
        current_V_im -= drop_im;
        
        const mag = Math.sqrt(current_V_re*current_V_re + current_V_im*current_V_im);
        const V_LL_kV = (mag * Math.sqrt(3)) / 1000;
        
        const I_mag = Math.sqrt(sec.I_re*sec.I_re + sec.I_im*sec.I_im);
        total_loss_W += 3 * I_mag * I_mag * R;
        
        accum_dist += sec.dist;
        profile.push({
            distance: Number(accum_dist.toFixed(1)),
            voltage: Number(V_LL_kV.toFixed(3)),
            node: `Load ${loads[idx].id}`
        });
    });
    
    // Check if end voltage is within limits (e.g. +/- 5%)
    const end_voltage = profile[profile.length - 1].voltage;
    const v_drop_percent = ((V_source - end_voltage) / V_source) * 100;
    const isCompliant = v_drop_percent <= 5.0;
  
    return {
        profile,
        total_loss_kW: Number((total_loss_W / 1000).toFixed(1)),
        v_drop_percent: Number(v_drop_percent.toFixed(2)),
        isCompliant,
        end_voltage: Number(end_voltage.toFixed(2))
    };
  }
