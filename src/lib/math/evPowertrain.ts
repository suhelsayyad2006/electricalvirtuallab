export function calculateEVPowertrain(
    throttle: number, // 0 to 100%
    incline: number, // degrees (-10 to +20)
    battCap: number, // kWh
    mass: number, // kg
    v_kmh: number // current speed km/h (for iteration in state if needed, but we'll approximate steady state)
  ) {
    const g = 9.81;
    const Crr = 0.015; // Rolling resistance coefficient
    const Cd = 0.3; // Drag coefficient
    const A = 2.2; // Frontal area m2
    const rho = 1.225; // Air density kg/m3
    
    const v_ms = v_kmh / 3.6; // m/s
    
    // Forces
    const F_roll = mass * g * Crr * Math.cos(incline * Math.PI / 180);
    const F_grade = mass * g * Math.sin(incline * Math.PI / 180);
    const F_aero = 0.5 * rho * Cd * A * (v_ms * v_ms);
    
    const F_resist = F_roll + F_grade + F_aero;
    
    // Motor specs
    const MaxPower = 150000; // 150 kW
    const MaxTorque = 300; // Nm
    const WheelRadius = 0.33; // m
    const GearRatio = 9.0; 
    
    // Requested power by throttle
    const P_req = (throttle / 100) * MaxPower; // Watts
    
    // Motor torque and force applied to wheels
    let F_traction = 0;
    if (v_ms > 0) {
        F_traction = P_req / v_ms;
        // Limit by Max Torque
        const maxF = (MaxTorque * GearRatio) / WheelRadius;
        if (F_traction > maxF) F_traction = maxF;
    } else if (throttle > 0) {
        F_traction = (MaxTorque * GearRatio) / WheelRadius;
    }
    
    // Net force
    const F_net = F_traction - F_resist;
    const acceleration = F_net / mass; // m/s2
    
    // Power consumption from battery
    const motor_eff = 0.9;
    const inv_eff = 0.95;
    let P_batt = (F_traction * v_ms) / (motor_eff * inv_eff);
    
    // Regenerative braking (negative throttle or coasting down steep hill)
    let isRegen = false;
    if (F_net < 0 && throttle === 0 && F_resist < 0) { // e.g. rolling down hill
        // Gravity is pushing us faster, apply regen
        const P_regen = Math.abs(F_resist) * v_ms * motor_eff * inv_eff;
        P_batt = -P_regen; // Battery is charging
        isRegen = true;
    }
    
    // Compute Estimated Range at this steady state speed
    let range_est = 0;
    if (P_batt > 0) {
        // hours to drain = (battCap * 1000) / P_batt
        const hours = (battCap * 1000) / P_batt;
        range_est = hours * v_kmh;
    } else if (P_batt <= 0 && v_kmh > 0) {
        range_est = 999; // Infinite range / recharging
    }
    
    // Drive Cycle Simulation Data for graphs (Simulate a 0-100km/h run)
    const run_data = [];
    let sim_v = 0;
    for(let t=0; t<=20; t+=1) {
        const f_a = 0.5 * rho * Cd * A * sim_v * sim_v;
        const f_r = F_roll + F_grade + f_a;
        
        let f_t = 0;
        if (throttle > 0) {
            f_t = (throttle/100 * MaxPower) / (sim_v || 0.1);
            const mF = (MaxTorque * GearRatio) / WheelRadius;
            if (f_t > mF) f_t = mF;
        }
        
        const f_n = f_t - f_r;
        let acc = f_n / mass;
        if (acc < -9.8) acc = -9.8; // max braking
        
        sim_v += acc * 1; // dt = 1s
        if (sim_v < 0) sim_v = 0;
        
        let p_kw = (f_t * sim_v) / (motor_eff * inv_eff) / 1000;
        if (p_kw < 0) p_kw = 0;
        
        run_data.push({
            time: t,
            speed: Number((sim_v * 3.6).toFixed(1)),
            power: Number(p_kw.toFixed(1))
        });
    }
  
    return {
        acceleration: Number(acceleration.toFixed(2)),
        F_resist: Number(F_resist.toFixed(0)),
        F_traction: Number(F_traction.toFixed(0)),
        P_batt_kW: Number((P_batt / 1000).toFixed(1)),
        range_est: Number(range_est.toFixed(0)),
        isRegen,
        run_data
    };
  }
