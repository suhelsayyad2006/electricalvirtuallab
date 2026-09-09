export function calculateDCMotorCharacteristics(
    Va: number, // Armature Voltage (V)
    Ra: number, // Armature Resistance (Ohms)
    If: number, // Field Current (A)
    Tl: number  // Load Torque (Nm)
  ) {
    // Motor constants
    const K_constant = 0.5; // Back EMF and Torque constant multiplier
    const kPhi = K_constant * If;
    
    // Prevent division by zero if field is lost
    if (kPhi <= 0) return { speed_rpm: 0, Ia: 0, Eb: 0, efficiency: 0, curve: [] };
  
    // Steady state calculations
    const Ia = Tl / kPhi; // Armature Current required to overcome Tl
    const Eb = Va - Ia * Ra; // Back EMF
    const omega = Eb / kPhi; // Angular velocity (rad/s)
    let speed_rpm = omega * (60 / (2 * Math.PI));
    
    // If torque is too high, motor stalls
    if (speed_rpm < 0) {
        speed_rpm = 0;
    }
  
    // Efficiency
    const P_out = Tl * Math.max(0, omega);
    const P_in = Va * Ia + 50; // Add 50W base mechanical loss so efficiency isn't 100% at 0 load
    let efficiency = P_in > 0 ? (P_out / P_in) * 100 : 0;
    if (efficiency < 0) efficiency = 0;
  
    // Generate Torque-Speed Curve for the current voltage/field settings
    const curve = [];
    const maxTorque = (Va / Ra) * kPhi; // Stall torque
    
    for (let t = 0; t <= maxTorque * 1.1; t += maxTorque / 20) {
        const i_t = t / kPhi;
        const e_t = Va - i_t * Ra;
        const w_t = e_t / kPhi;
        const rpm_t = Math.max(0, w_t * (60 / (2 * Math.PI)));
        const p_out_t = t * w_t;
        const p_in_t = Va * i_t + 50;
        const eff_t = p_in_t > 0 ? (p_out_t / p_in_t) * 100 : 0;
        
        if (rpm_t >= 0) {
            curve.push({
                torque: Number(t.toFixed(2)),
                speed: Number(rpm_t.toFixed(0)),
                current: Number(i_t.toFixed(2)),
                efficiency: Number(Math.max(0, eff_t).toFixed(1))
            });
        }
    }
  
    return {
        speed_rpm: Number(speed_rpm.toFixed(0)),
        Ia: Number(Ia.toFixed(2)),
        Eb: Number(Eb.toFixed(2)),
        efficiency: Number(efficiency.toFixed(1)),
        curve,
        maxTorque: Number(maxTorque.toFixed(2))
    };
  }
