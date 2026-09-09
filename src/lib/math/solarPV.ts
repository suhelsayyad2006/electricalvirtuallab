export function calculateSolarPV(
    G: number, // Irradiance (W/m2)
    T: number, // Temperature (°C)
    Ns: number, // Cells in series per panel
    Np: number, // Panels in parallel
    Ns_panels: number, // Panels in series
    V_load: number // Operating voltage set by load/MPPT
  ) {
    // Reference parameters at STC (G=1000 W/m2, T=25C) for a typical 250W panel
    const Isc_ref = 8.5; // A
    const Voc_ref = 37.5; // V
    const Imp_ref = 8.0; // A
    const Vmp_ref = 31.0; // V
    const Pmax_ref = 250; // W
    
    // Temperature coefficients
    const alpha_Isc = 0.005; // A/°C
    const beta_Voc = -0.12; // V/°C
    
    // Adjusted for environmental conditions
    const deltaT = T - 25;
    const Isc_panel = (G / 1000) * (Isc_ref + alpha_Isc * deltaT);
    // Open circuit voltage decreases with temp, but drops slightly at low irradiance
    const Voc_panel = Voc_ref + beta_Voc * deltaT + (G > 0 ? 0.025 * T * Math.log(G/1000) : 0);
    
    // Array totals
    const Isc = Math.max(0, Isc_panel * Np);
    const Voc = Math.max(0, Voc_panel * Ns_panels);
    
    // Simplified single diode equation approximation to generate the curve
    // I = Isc - C1 * (exp(V / (C2 * Voc)) - 1)
    // We calibrate C1 and C2 so it passes roughly through MPP
    
    const C2 = 0.1; // Ideality factor proxy
    const C1 = Isc / (Math.exp(1 / C2) - 1);
    
    const ivCurve = [];
    let Pmax = 0;
    let Vmp = 0;
    let Imp = 0;
    
    // Generate IV and PV curves
    if (Voc > 0 && Isc > 0) {
        for (let v = 0; v <= Voc * 1.05; v += Voc / 50) {
            let i = Isc - C1 * (Math.exp(v / (C2 * Voc)) - 1);
            if (i < 0) i = 0;
            const p = v * i;
            
            if (p > Pmax) {
                Pmax = p;
                Vmp = v;
                Imp = i;
            }
            
            ivCurve.push({
                voltage: Number(v.toFixed(2)),
                current: Number(i.toFixed(2)),
                power: Number(p.toFixed(1))
            });
        }
    }
    
    // Calculate current operating point
    let I_op = 0;
    if (V_load <= Voc && Isc > 0) {
        I_op = Isc - C1 * (Math.exp(V_load / (C2 * Voc)) - 1);
        if (I_op < 0) I_op = 0;
    }
    const P_op = V_load * I_op;
    
    const eff = P_op > 0 ? (P_op / (G * 1.6 * Np * Ns_panels)) * 100 : 0; // Assuming 1.6m^2 per panel
  
    return {
        Voc: Number(Voc.toFixed(2)),
        Isc: Number(Isc.toFixed(2)),
        Vmp: Number(Vmp.toFixed(2)),
        Imp: Number(Imp.toFixed(2)),
        Pmax: Number(Pmax.toFixed(2)),
        V_op: Number(V_load.toFixed(2)),
        I_op: Number(I_op.toFixed(2)),
        P_op: Number(P_op.toFixed(2)),
        efficiency: Number(Math.max(0, eff).toFixed(1)),
        curve: ivCurve
    };
  }
