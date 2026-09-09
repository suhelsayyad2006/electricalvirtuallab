export function calculateInductionMotor(
    V_line: number, // Line voltage (V)
    f: number, // Frequency (Hz)
    poles: number, 
    Tl: number // Load Torque (Nm)
  ) {
    // Standard equivalent circuit parameters (typical 3HP motor)
    const R1 = 0.5;
    const X1 = 1.0;
    const R2 = 0.4;
    const X2 = 1.0;
    const Xm = 30.0;
  
    const V_phase = V_line / Math.sqrt(3);
    const Ns = (120 * f) / poles; // Synchronous speed in RPM
    const w_s = (2 * Math.PI * Ns) / 60; // rad/s
  
    // Thevenin equivalent (looking into rotor)
    // Vth approx = V_phase * (Xm / (X1 + Xm))
    const Vth = V_phase * (Xm / Math.sqrt(R1*R1 + (X1 + Xm)*(X1 + Xm)));
    const Rth = R1 * (Xm / (X1 + Xm)) * (Xm / (X1 + Xm));
    const Xth = X1; // Approx
  
    // Calculate Torque-Speed Curve
    const curve = [];
    let maxTorque = 0;
    let maxTorqueSlip = 0;
  
    for (let s = 1.0; s > 0.001; s -= 0.01) {
        const I2 = Vth / Math.sqrt(Math.pow(Rth + R2/s, 2) + Math.pow(Xth + X2, 2));
        const Td = (3 * I2 * I2 * R2 / s) / w_s;
        
        if (Td > maxTorque) {
            maxTorque = Td;
            maxTorqueSlip = s;
        }
        
        const rpm = Ns * (1 - s);
        curve.push({
            slip: Number(s.toFixed(3)),
            speed: Number(rpm.toFixed(0)),
            torque: Number(Td.toFixed(2)),
            current: Number(I2.toFixed(2))
        });
    }
  
    // Find operating point based on Load Torque (Tl)
    // Search the stable region of the curve (slip between 0 and maxTorqueSlip)
    let operatingSlip = 0;
    let operatingSpeed = Ns; // Default to synch speed if no load
    let I1 = 0;
    let pf = 0;
  
    if (Tl > maxTorque) {
        // Motor stalls
        operatingSlip = 1.0;
        operatingSpeed = 0;
    } else if (Tl > 0) {
        // Simple search for intersection
        for (let s = 0.001; s <= maxTorqueSlip; s += 0.001) {
            const I2 = Vth / Math.sqrt(Math.pow(Rth + R2/s, 2) + Math.pow(Xth + X2, 2));
            const Td = (3 * I2 * I2 * R2 / s) / w_s;
            if (Td >= Tl) {
                operatingSlip = s;
                operatingSpeed = Ns * (1 - s);
                break;
            }
        }
    }
  
    // Calculate final operating point details
    if (operatingSlip === 0) operatingSlip = 0.0001;
    const Z2_real = R2 / operatingSlip;
    const Z2_imag = X2;
    // Parallel with Xm
    const den_real = Z2_real;
    const den_imag = Z2_imag + Xm;
    const den_mag2 = den_real*den_real + den_imag*den_imag;
    
    const Zp_real = (Z2_real*0 - Z2_imag*Xm * -den_imag) / den_mag2; // Approx 
    // Wait, let's do exact complex math for Ztotal
    // Ztotal = R1 + jX1 + ( (jXm) || (R2/s + jX2) )
    const num_re = Xm * X2; // Actually jXm * (R2/s + jX2) = jXm*R2/s - Xm*X2
    const z2_r = R2 / operatingSlip;
    const z2_i = X2;
    // jXm * (z2_r + j z2_i) = -Xm*z2_i + j Xm*z2_r
    const p_num_r = -Xm * z2_i;
    const p_num_i = Xm * z2_r;
    const p_den_r = z2_r;
    const p_den_i = z2_i + Xm;
    const p_den_mag2 = p_den_r*p_den_r + p_den_i*p_den_i;
    
    const p_res_r = (p_num_r*p_den_r + p_num_i*p_den_i) / p_den_mag2;
    const p_res_i = (p_num_i*p_den_r - p_num_r*p_den_i) / p_den_mag2;
    
    const Ztot_r = R1 + p_res_r;
    const Ztot_i = X1 + p_res_i;
    const Ztot_mag = Math.sqrt(Ztot_r*Ztot_r + Ztot_i*Ztot_i);
    
    I1 = V_phase / Ztot_mag;
    pf = Ztot_r / Ztot_mag;
  
    return {
        Ns: Number(Ns.toFixed(0)),
        speed: Number(operatingSpeed.toFixed(0)),
        slip: Number(operatingSlip.toFixed(4)),
        I1: Number(I1.toFixed(2)),
        pf: Number(pf.toFixed(3)),
        maxTorque: Number(maxTorque.toFixed(2)),
        curve
    };
  }
