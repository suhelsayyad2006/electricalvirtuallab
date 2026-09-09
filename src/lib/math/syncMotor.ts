export function calculateSyncMotor(
    P_out: number, // Mechanical Load (kW)
    E_f: number, // Field Excitation Voltage (Line-to-Neutral kV)
    V_t: number // Terminal Voltage (Line-to-Neutral kV)
  ) {
    // Motor Parameters (assume a standard large motor)
    const X_s = 5.0; // Synchronous Reactance (Ohms/phase)
    const R_a = 0.1; // Armature Resistance (Ohms/phase) - minimal for large machines
    
    // Convert power to per-phase Watts
    const P_phase = (P_out * 1000) / 3;
    const V_phase = V_t * 1000;
    const E_phase = E_f * 1000;
    
    // Check if machine has lost synchronism
    // Max power = (V*E)/Xs
    const P_max = (V_phase * E_phase) / X_s;
    const lostSync = P_phase > P_max;
    
    // Calculate load angle (delta) in radians
    const delta = lostSync ? Math.PI / 2 : Math.asin(P_phase / P_max);
    
    // Calculate Armature Current (Ia) Phasor: I_a = (V - E_f < -delta) / (R_a + jX_s)
    // Motor convention: V = E + Ia*Zs
    // Ia = (V - E)/Zs
    // Er_real = E * cos(-delta), Er_imag = E * sin(-delta)
    const Er_real = E_phase * Math.cos(-delta);
    const Er_imag = E_phase * Math.sin(-delta);
    
    const V_drop_real = V_phase - Er_real;
    const V_drop_imag = 0 - Er_imag;
    
    // Zs = Ra + jXs
    // I = V_drop / Zs = (V_drop_real + j V_drop_imag) / (R_a + j X_s)
    const Z_sq = R_a * R_a + X_s * X_s;
    const Ia_real = (V_drop_real * R_a + V_drop_imag * X_s) / Z_sq;
    const Ia_imag = (V_drop_imag * R_a - V_drop_real * X_s) / Z_sq;
    
    const Ia_mag = Math.sqrt(Ia_real * Ia_real + Ia_imag * Ia_imag);
    let pf_angle = Math.atan2(Ia_imag, Ia_real); // Angle relative to V (which is at 0 deg)
    let pf = Math.cos(pf_angle);
    
    // Determine leading/lagging
    const pf_type = pf_angle > 0 ? "Leading" : (pf_angle < 0 ? "Lagging" : "Unity");
    
    // Generate V-Curve and Inverted V-Curve data points for current load
    const curves = [];
    // E_f from 0.5 * V to 2.0 * V
    for (let e = V_phase * 0.5; e <= V_phase * 2.0; e += 200) {
        const p_max_curve = (V_phase * e) / X_s;
        if (P_phase > p_max_curve) continue; // Skip points where it loses synchronism
        
        const d_curve = Math.asin(P_phase / p_max_curve);
        const er_re = e * Math.cos(-d_curve);
        const er_im = e * Math.sin(-d_curve);
        
        const vd_re = V_phase - er_re;
        const vd_im = 0 - er_im;
        
        const ia_re = (vd_re * R_a + vd_im * X_s) / Z_sq;
        const ia_im = (vd_im * R_a - vd_re * X_s) / Z_sq;
        
        const ia_m = Math.sqrt(ia_re * ia_re + ia_im * ia_im);
        const pfa = Math.cos(Math.atan2(ia_im, ia_re));
        
        curves.push({
            Ef: Number((e / 1000).toFixed(2)),
            Ia: Number(ia_m.toFixed(1)),
            PF: Number(pfa.toFixed(3))
        });
    }
  
    return {
        Ia: Number(Ia_mag.toFixed(1)),
        pf: Number(pf.toFixed(3)),
        pf_type,
        delta: Number((delta * 180 / Math.PI).toFixed(1)),
        lostSync,
        curves
    };
  }
