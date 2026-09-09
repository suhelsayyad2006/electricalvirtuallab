export function calculateWindEnergy(
    v: number, // Wind speed (m/s)
    pitch: number, // Blade pitch angle (degrees)
    R: number, // Turbine radius (m)
    generatorLoad: number // Requested load power (kW)
  ) {
    const rho = 1.225; // Air density (kg/m3)
    const A = Math.PI * R * R; // Swept area (m2)
    
    // Total available power in the wind
    const P_wind = 0.5 * rho * A * Math.pow(v, 3); 
    
    // Calculate Cp (Power Coefficient) based on standard empirical model
    // Assuming a fixed optimal Tip Speed Ratio (lambda) for max power tracking (MPPT)
    const lambda_opt = 8.1;
    let lambda = lambda_opt;
    
    // If wind speed is very low, lambda changes
    if (v < 3) lambda = 0;
    
    const c1 = 0.5176;
    const c2 = 116;
    const c3 = 0.4;
    const c4 = 5;
    const c5 = 21;
    const c6 = 0.0068;

    // Calculate Cp using empirical formula
    let Cp = 0;
    if (lambda > 0) {
        const lambda_i = 1 / ((1 / (lambda + 0.08 * pitch)) - (0.035 / (Math.pow(pitch, 3) + 1)));
        Cp = c1 * (c2 / lambda_i - c3 * pitch - c4) * Math.exp(-c5 / lambda_i) + c6 * lambda;
    }
    
    // Theoretical limit (Betz limit is ~0.59)
    if (Cp > 0.59) Cp = 0.59;
    if (Cp < 0) Cp = 0;
  
    // Mechanical power extracted by turbine
    let P_mech = P_wind * Cp;
    
    // Wind turbine states
    let state = "Operating normally";
    if (v < 3) {
        state = "Cut-in speed not reached";
        P_mech = 0;
    } else if (v > 25) {
        state = "Cut-out speed exceeded (Braked)";
        P_mech = 0;
        Cp = 0;
    }
    
    // Generator efficiency (simplified curve)
    const gen_eff = 0.95;
    let P_elec = P_mech * gen_eff;
    
    // Load matching
    const load_W = generatorLoad * 1000;
    if (P_elec > load_W && load_W > 0) {
        // If we generate more than load demands (and load isn't 0 which implies grid tie), 
        // we assume pitch control limits it.
        P_elec = load_W;
        P_mech = P_elec / gen_eff;
        Cp = P_mech / P_wind;
        state = "Power limited by pitch control (Load matching)";
    }
    
    // Calculate RPM and Torque
    let omega = (lambda * v) / R; // rad/s
    if (P_mech === 0) omega = 0;
    
    const rpm = omega * (60 / (2 * Math.PI));
    const torque = omega > 0 ? P_mech / omega : 0;
    
    // Generate Power vs Wind Speed curve for current pitch
    const curve = [];
    for (let wind = 0; wind <= 30; wind += 1) {
        if (wind < 3 || wind > 25) {
             curve.push({ wind, power: 0 });
             continue;
        }
        
        const Pw = 0.5 * rho * A * Math.pow(wind, 3);
        const l_i = 1 / ((1 / (lambda_opt + 0.08 * pitch)) - (0.035 / (Math.pow(pitch, 3) + 1)));
        let cp_curve = c1 * (c2 / l_i - c3 * pitch - c4) * Math.exp(-c5 / l_i) + c6 * lambda_opt;
        if (cp_curve > 0.59) cp_curve = 0.59;
        if (cp_curve < 0) cp_curve = 0;
        
        curve.push({ 
            wind, 
            power: Number(((Pw * cp_curve * gen_eff) / 1000).toFixed(1)) // kW
        });
    }
  
    return {
        P_wind: Number((P_wind / 1000).toFixed(2)), // kW
        P_mech: Number((P_mech / 1000).toFixed(2)), // kW
        P_elec: Number((P_elec / 1000).toFixed(2)), // kW
        Cp: Number(Cp.toFixed(3)),
        rpm: Number(rpm.toFixed(1)),
        torque: Number((torque / 1000).toFixed(2)), // kNm
        state,
        curve
    };
  }
