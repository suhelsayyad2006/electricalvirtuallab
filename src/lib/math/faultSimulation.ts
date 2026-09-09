export function calculateFault(
    faultType: 'SLG' | 'LL' | 'DLG' | 'LLL',
    faultLocation: number, // % of line length
    lineLength: number, // km
    baseV: number // kV Line-to-Line
  ) {
    // System Parameters
    const Z_source1 = 0.5; // Ohms
    const Z_source2 = 0.5;
    const Z_source0 = 1.0;
    
    // Line parameters per km
    const z1_km = 0.1;
    const z2_km = 0.1;
    const z0_km = 0.3;
    
    // Fault resistance
    const Zf = 0.05; // Ohms
    
    // Fault location impedances
    const L = lineLength * (faultLocation / 100);
    const Z1 = Z_source1 + L * z1_km;
    const Z2 = Z_source2 + L * z2_km;
    const Z0 = Z_source0 + L * z0_km;
    
    const V_phase = (baseV * 1000) / Math.sqrt(3); // Line-to-Neutral in Volts
    
    let Ia_mag = 0, Ib_mag = 0, Ic_mag = 0;
    let Va_mag = V_phase, Vb_mag = V_phase, Vc_mag = V_phase;
    
    // Sequence Networks Calculation (Simplified purely resistive/reactive magnitude approach)
    if (faultType === 'LLL') {
        // Balanced 3-phase fault
        const I_fault = V_phase / (Z1 + Zf);
        Ia_mag = I_fault;
        Ib_mag = I_fault;
        Ic_mag = I_fault;
        Va_mag = I_fault * Zf;
        Vb_mag = I_fault * Zf;
        Vc_mag = I_fault * Zf;
    } 
    else if (faultType === 'SLG') {
        // Single Line to Ground (Assume Phase A)
        const I_seq = V_phase / (Z1 + Z2 + Z0 + 3*Zf);
        Ia_mag = 3 * I_seq;
        Ib_mag = 0; // Nominal load ignored for simplicity
        Ic_mag = 0;
        Va_mag = Ia_mag * Zf; 
        // Vb and Vc remain close to normal or rise slightly depending on grounding, 
        // simplified to nominal for visual effect.
    }
    else if (faultType === 'LL') {
        // Line to Line (Assume Phase B & C)
        const I_seq = V_phase / (Z1 + Z2 + Zf);
        Ia_mag = 0;
        Ib_mag = Math.sqrt(3) * I_seq;
        Ic_mag = Math.sqrt(3) * I_seq;
        // Va nominal
        Vb_mag = V_phase / 2; // Approximations for visual display
        Vc_mag = V_phase / 2;
    }
    else if (faultType === 'DLG') {
        // Double Line to Ground (Assume Phase B & C to ground)
        const I1 = V_phase / (Z1 + ((Z2 * (Z0 + 3*Zf)) / (Z2 + Z0 + 3*Zf)));
        // Complex to get exact phase currents, but we'll use a magnitude approximation
        const I_fault = I1 * 2; // rough proxy for severe fault
        Ia_mag = 0;
        Ib_mag = I_fault;
        Ic_mag = I_fault;
        Vb_mag = I_fault * Zf;
        Vc_mag = I_fault * Zf;
    }
    
    // Convert to kA
    Ia_mag = Ia_mag / 1000;
    Ib_mag = Ib_mag / 1000;
    Ic_mag = Ic_mag / 1000;
  
    // Generate Oscilloscope data (Pre-fault -> Fault -> Clear)
    const waveforms = [];
    const f = 50;
    const w = 2 * Math.PI * f;
    const dt = 1 / (f * 40); // 40 points per cycle
    
    const pre_fault_cycles = 2;
    const fault_cycles = 3;
    const post_fault_cycles = 2;
    const total_points = (pre_fault_cycles + fault_cycles + post_fault_cycles) * 40;
    
    // Normal load current (kA)
    const I_load = 0.5; 
    
    for(let i=0; i<total_points; i++) {
        const t = i * dt;
        let isFault = i >= (pre_fault_cycles * 40) && i < ((pre_fault_cycles + fault_cycles) * 40);
        let isCleared = i >= ((pre_fault_cycles + fault_cycles) * 40);
        
        let a_cur = I_load; let b_cur = I_load; let c_cur = I_load;
        let a_vol = V_phase; let b_vol = V_phase; let c_vol = V_phase;
        
        if (isFault) {
            if (Ia_mag > 0) a_cur = Ia_mag;
            if (Ib_mag > 0) b_cur = Ib_mag;
            if (Ic_mag > 0) c_cur = Ic_mag;
            a_vol = Va_mag; b_vol = Vb_mag; c_vol = Vc_mag;
        } else if (isCleared) {
            // Breaker open
            a_cur = 0; b_cur = 0; c_cur = 0;
            // Voltage restored on source side
            a_vol = V_phase; b_vol = V_phase; c_vol = V_phase;
        }
        
        // Instantaneous values
        const ia = Math.SQRT2 * a_cur * Math.cos(w*t);
        const ib = Math.SQRT2 * b_cur * Math.cos(w*t - (120 * Math.PI/180));
        const ic = Math.SQRT2 * c_cur * Math.cos(w*t + (120 * Math.PI/180));
        
        const va = Math.SQRT2 * (a_vol/1000) * Math.cos(w*t); // kV
        const vb = Math.SQRT2 * (b_vol/1000) * Math.cos(w*t - (120 * Math.PI/180));
        const vc = Math.SQRT2 * (c_vol/1000) * Math.cos(w*t + (120 * Math.PI/180));
        
        waveforms.push({
            time: Number((t * 1000).toFixed(2)),
            ia: Number(ia.toFixed(2)),
            ib: Number(ib.toFixed(2)),
            ic: Number(ic.toFixed(2)),
            va: Number(va.toFixed(2)),
            vb: Number(vb.toFixed(2)),
            vc: Number(vc.toFixed(2))
        });
    }
  
    return {
        waveforms,
        Ia: Number(Ia_mag.toFixed(2)),
        Ib: Number(Ib_mag.toFixed(2)),
        Ic: Number(Ic_mag.toFixed(2)),
        tripTime: Number(((fault_cycles / f) * 1000).toFixed(0)) // ms
    };
  }
