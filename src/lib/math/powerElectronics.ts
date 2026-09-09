export function calculateConverter(
    Vin: number, 
    D: number, // Duty cycle 0 to 1
    f_sw: number, // Switching frequency (kHz)
    R_load: number, 
    L: number, // mH
    C: number, // uF
    type: 'buck' | 'boost' | 'buck-boost'
  ) {
    const f = f_sw * 1000;
    const T = 1 / f;
    const L_H = L * 1e-3;
    const C_F = C * 1e-6;
  
    let Vout = 0;
    let Iout = 0;
    let Iin = 0;
    
    // Ideal output voltage calculations
    if (type === 'buck') {
        Vout = Vin * D;
    } else if (type === 'boost') {
        Vout = D >= 1 ? 0 : Vin / (1 - D); 
    } else { // buck-boost
        Vout = D >= 1 ? 0 : -Vin * (D / (1 - D));
    }
    
    Iout = Vout / R_load;
    
    // Power balance (ideal) Pin = Pout -> Vin * Iin = Vout^2 / R
    const Pout = Math.pow(Vout, 2) / R_load;
    Iin = Pout / Vin;
  
    // Ripple calculations (approximate, Continuous Conduction Mode)
    let delta_iL = 0;
    let delta_Vc = 0;
  
    if (type === 'buck') {
        delta_iL = ((Vin - Vout) * D * T) / L_H;
        delta_Vc = delta_iL / (8 * f * C_F);
    } else if (type === 'boost') {
        delta_iL = (Vin * D * T) / L_H;
        delta_Vc = (Iout * D * T) / C_F;
    } else { // buck-boost
        delta_iL = (Vin * D * T) / L_H;
        delta_Vc = (Iout * D * T) / C_F; // Magnitude
        delta_Vc = Math.abs(delta_Vc);
    }
  
    // Check if Continuous Conduction Mode (CCM) holds
    let IL_avg = 0;
    if (type === 'buck') IL_avg = Iout;
    else if (type === 'boost') IL_avg = Iin;
    else IL_avg = Iin + Math.abs(Iout);
    
    const isCCM = IL_avg > (delta_iL / 2);
  
    // Generate waveforms for 3 switching cycles
    const waveforms = [];
    const points = 100;
    const dt = (3 * T) / points;
  
    for (let i = 0; i <= points; i++) {
        const t = i * dt;
        const cycleTime = t % T;
        const isSwitchOn = cycleTime < (D * T);
        
        let pwm = isSwitchOn ? 1 : 0;
        
        // Approximate triangular inductor current
        let iL_t = IL_avg;
        if (isCCM) {
             const halfDelta = delta_iL / 2;
             if (isSwitchOn) {
                 iL_t = (IL_avg - halfDelta) + (delta_iL / (D * T)) * cycleTime;
             } else {
                 iL_t = (IL_avg + halfDelta) - (delta_iL / ((1-D) * T)) * (cycleTime - D * T);
             }
        } else {
             // DCM approximation (simplified for visual)
             iL_t = isSwitchOn ? (delta_iL / (D * T)) * cycleTime : Math.max(0, delta_iL - (delta_iL / ((1-D)*T)) * (cycleTime - D*T));
        }
  
        // Approximate output voltage with ripple
        let vOut_t = Vout;
        if (isCCM) {
             if (isSwitchOn) {
                 vOut_t = Vout - (delta_Vc / 2) + (delta_Vc / (D * T)) * cycleTime;
             } else {
                 vOut_t = Vout + (delta_Vc / 2) - (delta_Vc / ((1-D) * T)) * (cycleTime - D * T);
             }
        }
  
        waveforms.push({
            time: Number((t * 1e6).toFixed(1)), // us
            pwm: pwm,
            Vout: Number(vOut_t.toFixed(2)),
            IL: Number(iL_t.toFixed(2))
        });
    }
  
    // Calculate efficiency assuming some practical losses
    const diodeDrop = 0.7;
    const switchDrop = 0.5;
    const P_loss = (type === 'buck' ? Iout : Iin) * switchDrop * D + (type === 'buck' ? Iout : IL_avg) * diodeDrop * (1 - D);
    const eff = Pout > 0 ? (Pout / (Pout + P_loss)) * 100 : 0;
  
    return {
        Vout: Number(Vout.toFixed(2)),
        Iout: Number(Iout.toFixed(2)),
        Iin: Number(Iin.toFixed(2)),
        rippleV: Number(Math.abs(delta_Vc).toFixed(3)),
        rippleI: Number(delta_iL.toFixed(2)),
        isCCM,
        eff: Number(eff.toFixed(1)),
        waveforms
    };
  }
