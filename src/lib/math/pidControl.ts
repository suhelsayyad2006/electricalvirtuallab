export function calculatePIDResponse(
    Kp: number, 
    Ki: number, 
    Kd: number, 
    setpoint: number, 
    disturbance: number
  ) {
    // DC Motor Plant Parameters (Simplified)
    const J = 0.01; // Inertia
    const b = 0.1; // Viscous friction
    const K = 0.01; // Electromotive force constant
    const R = 1.0; // Resistance
    const L = 0.5; // Inductance
    
    // Time step and simulation duration
    const dt = 0.01;
    const t_end = 5.0; // 5 seconds simulation
    
    let t = 0;
    
    // State variables
    let omega = 0; // angular velocity (rad/s)
    let i = 0; // armature current (A)
    
    // PID variables
    let integral = 0;
    let prev_error = 0;
    
    const response = [];
    
    // Metrics
    let max_overshoot = 0;
    let settling_time = t_end;
    let isSettled = false;
    
    while (t <= t_end) {
        // Calculate Error
        const error = setpoint - omega;
        
        // PID Control Law
        integral += error * dt;
        const derivative = (error - prev_error) / dt;
        
        // Anti-windup (limit integral)
        if (integral > 1000) integral = 1000;
        if (integral < -1000) integral = -1000;
        
        let V_app = Kp * error + Ki * integral + Kd * derivative;
        
        // Voltage limits (actuator saturation)
        if (V_app > 240) V_app = 240;
        if (V_app < -240) V_app = -240;
        
        // Motor Dynamics (Euler Integration)
        // di/dt = (V_app - R*i - K*omega) / L
        const di_dt = (V_app - R * i - K * omega) / L;
        i += di_dt * dt;
        
        // domega/dt = (K*i - b*omega - T_disturbance) / J
        // Disturbance kicks in at t=2.5s
        const T_dist = t >= 2.5 ? disturbance : 0;
        const domega_dt = (K * i - b * omega - T_dist) / J;
        omega += domega_dt * dt;
        
        // Track Overshoot
        if (omega > setpoint && (omega - setpoint) > max_overshoot) {
            max_overshoot = omega - setpoint;
        }
        
        // Check settling time (within 2% of setpoint)
        const margin = 0.02 * setpoint;
        if (Math.abs(omega - setpoint) <= margin) {
            if (!isSettled) {
                settling_time = t;
                isSettled = true;
            }
        } else {
            isSettled = false; // Came out of bounds
            settling_time = t_end;
        }
        
        prev_error = error;
        
        // Downsample for chart (every 0.05s)
        if (Math.abs(t % 0.05) < 0.001) {
            response.push({
                time: Number(t.toFixed(2)),
                speed: Number(omega.toFixed(1)),
                setpoint: setpoint
            });
        }
        
        t += dt;
    }
  
    const overshoot_percent = (max_overshoot / setpoint) * 100;
  
    return {
        response,
        overshoot_percent: Number(overshoot_percent.toFixed(1)),
        settling_time: Number(settling_time.toFixed(2)),
        steady_state_error: Number(Math.abs(setpoint - omega).toFixed(2))
    };
  }
