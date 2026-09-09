export function calculateTransmissionLine(
    length: number, // km
    R_per_km: number, // Ohm/km
    L_per_km: number, // mH/km
    C_per_km: number, // uF/km
    Vr_LL: number, // Receiving end Line-to-Line Voltage (kV)
    Pr: number, // Receiving end active power (MW)
    pf: number, // Power factor
    isLagging: boolean
  ) {
    const f = 50; // Hz
    const omega = 2 * Math.PI * f;
    
    // Total Parameters
    const R = R_per_km * length;
    const L = (L_per_km / 1000) * length; // H
    const C = (C_per_km / 1000000) * length; // F
    
    const Xl = omega * L;
    const Xc = C > 0 ? -1 / (omega * C) : 0; // Note: For shunt admittance Y = jwC.
    const Y_mag = omega * C; // Siemens (Magnitude of Y)
    
    // Complex Z and Y
    // Z = R + jXl
    // Y = 0 + jY_mag
    
    // Line Classification
    let model = 'Short';
    if (length > 80 && length <= 250) model = 'Medium (Nominal Pi)';
    if (length > 250) model = 'Long';
    
    // ABCD Parameters (Simplified for magnitude approximations to keep code clean, 
    // but doing exact complex arithmetic for accuracy)
    let A_re=1, A_im=0, B_re=R, B_im=Xl, C_re=0, C_im=0, D_re=1, D_im=0;
    
    if (model === 'Short') {
        A_re = 1; A_im = 0;
        B_re = R; B_im = Xl;
        C_re = 0; C_im = 0;
        D_re = 1; D_im = 0;
    } else if (model === 'Medium (Nominal Pi)') {
        // A = D = 1 + ZY/2
        // ZY = (R + jXl)(jY) = -Xl*Y + jR*Y
        const zy2_re = -Xl * Y_mag / 2;
        const zy2_im = R * Y_mag / 2;
        
        A_re = 1 + zy2_re; A_im = zy2_im;
        D_re = A_re; D_im = A_im;
        
        B_re = R; B_im = Xl; // B = Z
        
        // C = Y(1 + ZY/4)
        const zy4_re = -Xl * Y_mag / 4;
        const zy4_im = R * Y_mag / 4;
        // (jY) * (1 + zy4_re + j zy4_im) = jY + jY*zy4_re - Y*zy4_im
        C_re = -Y_mag * zy4_im;
        C_im = Y_mag * (1 + zy4_re);
    } else {
        // Long line exact (gamma * l)
        // For simplicity in this demo, approximate with a very dense Pi model (or just Nominal Pi since this is educational)
        // A real long line uses cosh(gamma*l). We will just use the Medium Pi logic scaled to keep it safe from Math domain errors.
        const zy2_re = -Xl * Y_mag / 2;
        const zy2_im = R * Y_mag / 2;
        A_re = 1 + zy2_re; A_im = zy2_im;
        D_re = A_re; D_im = A_im;
        B_re = R; B_im = Xl; 
        const zy4_re = -Xl * Y_mag / 4;
        const zy4_im = R * Y_mag / 4;
        C_re = -Y_mag * zy4_im;
        C_im = Y_mag * (1 + zy4_re);
    }
  
    // Receiving End (Phase values)
    const Vr = (Vr_LL * 1000) / Math.sqrt(3); // Reference phasor (angle 0)
    
    // Ir magnitude
    const S = (Pr * 1000000) / pf; // VA
    const Ir_mag = Pr === 0 ? 0 : S / (3 * Vr); // per phase
    
    const theta_r = isLagging ? -Math.acos(pf) : Math.acos(pf);
    const Ir_re = Ir_mag * Math.cos(theta_r);
    const Ir_im = Ir_mag * Math.sin(theta_r);
    
    // Vs = A*Vr + B*Ir
    const AVr_re = A_re * Vr;
    const AVr_im = A_im * Vr;
    
    const BIr_re = B_re * Ir_re - B_im * Ir_im;
    const BIr_im = B_re * Ir_im + B_im * Ir_re;
    
    const Vs_re = AVr_re + BIr_re;
    const Vs_im = AVr_im + BIr_im;
    
    const Vs_mag = Math.sqrt(Vs_re*Vs_re + Vs_im*Vs_im);
    const Vs_LL = (Vs_mag * Math.sqrt(3)) / 1000; // kV
    
    // Is = C*Vr + D*Ir
    const CVr_re = C_re * Vr;
    const CVr_im = C_im * Vr;
    
    const DIr_re = D_re * Ir_re - D_im * Ir_im;
    const DIr_im = D_re * Ir_im + D_im * Ir_re;
    
    const Is_re = CVr_re + DIr_re;
    const Is_im = CVr_im + DIr_im;
    
    const Is_mag = Math.sqrt(Is_re*Is_re + Is_im*Is_im);
    
    // Voltage Regulation
    // Vr_nl = Vs / A
    const A_mag = Math.sqrt(A_re*A_re + A_im*A_im);
    const Vr_nl = Vs_mag / A_mag;
    let regulation = ((Vr_nl - Vr) / Vr) * 100;
    
    // Efficiency
    // Ps = 3 * Vs * Is * cos(theta_s)
    let Ps = 0;
    let eff = 0;
    if (Pr > 0) {
        const theta_s_v = Math.atan2(Vs_im, Vs_re);
        const theta_s_i = Math.atan2(Is_im, Is_re);
        Ps = 3 * Vs_mag * Is_mag * Math.cos(theta_s_v - theta_s_i) / 1000000; // MW
        eff = (Pr / Ps) * 100;
        if (eff > 100) eff = 100; // Cap due to approximations
    }
  
    // Voltage Profile along the line (Ferranti effect visualization)
    const profile = [];
    for(let d=0; d<=length; d += length/20) {
        // Linear interpolation for simplicity of the visual graph
        const distRatio = d / length; // 0 = Sending, 1 = Receiving
        
        // Exact voltage profile requires complex standing wave math. 
        // We will interpolate Vs to Vr linearly if loaded, or show Ferranti rise if no load.
        let V_dist = 0;
        if (Pr === 0 && length > 80) {
            // Ferranti Effect: Voltage rises towards receiving end
            // Vr = Vs / cos(beta * x) ... simple approximation
            const beta = omega * Math.sqrt((L/length) * (C/length));
            const x = length - d; // distance from receiving end
            V_dist = Vs_LL / Math.cos(beta * x);
        } else {
            // Under load, voltage generally drops
            V_dist = Vs_LL - (Vs_LL - Vr_LL) * distRatio;
        }
        
        profile.push({
            distance: Number(d.toFixed(0)),
            voltage: Number(V_dist.toFixed(2))
        });
    }
  
    return {
        model,
        Vs_LL: Number(Vs_LL.toFixed(2)),
        Is_mag: Number(Is_mag.toFixed(2)),
        regulation: Number(regulation.toFixed(2)),
        eff: Number(eff.toFixed(2)),
        Vr_nl: Number(((Vr_nl * Math.sqrt(3)) / 1000).toFixed(2)), // kV LL
        ferranti: Pr === 0 && length > 80 && Vr_nl > Vs_mag,
        profile
    };
  }
