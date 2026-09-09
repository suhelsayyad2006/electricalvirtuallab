export function calculateStability(
    Pm: number, // Mechanical Power Input (pu)
    H: number, // Generator Inertia Constant (MJ/MVA or sec)
    tc: number // Fault clearing time (sec)
  ) {
    const f = 50; // Hz
    // Pmax for Pre-fault, During-fault, Post-fault
    const Pmax_pre = 2.0; 
    const Pmax_during = 0.5; // Severe voltage drop during fault limits power transfer
    const Pmax_post = 1.5; // Post fault line might have higher impedance
    
    // Check if steady state is even possible
    if (Pm > Pmax_post) {
        return {
            delta_0: 0, delta_c: 0, delta_max: 0, tc_crit: 0,
            isStable: false, curves: []
        };
    }
    
    // Initial load angle (delta 0) in radians
    const delta_0 = Math.asin(Pm / Pmax_pre);
    
    // Max angle (delta max) in radians
    const delta_max = Math.PI - Math.asin(Pm / Pmax_post);
    
    // Equal Area Criterion
    // A1 = Integral from delta_0 to delta_c of (Pm - Pmax_during * sin(delta))
    // A2 = Integral from delta_c to delta_max of (Pmax_post * sin(delta) - Pm)
    // Critical clearing angle delta_cr is when A1 = A2 for delta_max
    
    const cos_delta_cr = (Pm * (delta_max - delta_0) - Pmax_pre * Math.cos(delta_0) + Pmax_post * Math.cos(delta_max)) / (Pmax_post - Pmax_during);
    
    let tc_crit = 0;
    let isStable = false;
    
    if (cos_delta_cr >= -1 && cos_delta_cr <= 1) {
        const delta_cr = Math.acos(cos_delta_cr);
        
        // Approximate critical clearing time using simplified Swing Equation
        // M = H / (pi * f)
        const M = H / (Math.PI * f);
        // delta(t) = delta_0 + 0.5 * (Pm - Pmax_during * sin(delta_0))/M * t^2
        // Assuming P_during is roughly constant for small t:
        const P_accel = Pm - Pmax_during * Math.sin(delta_0);
        tc_crit = Math.sqrt((2 * M * (delta_cr - delta_0)) / P_accel);
        
        isStable = tc <= tc_crit;
    }
  
    // Generate Power-Angle Curves
    const curves = [];
    for (let d = 0; d <= 180; d += 2) {
        const rad = (d * Math.PI) / 180;
        curves.push({
            delta: d,
            P_pre: Number((Pmax_pre * Math.sin(rad)).toFixed(2)),
            P_during: Number((Pmax_during * Math.sin(rad)).toFixed(2)),
            P_post: Number((Pmax_post * Math.sin(rad)).toFixed(2)),
            Pm: Pm
        });
    }
  
    return {
        delta_0: Number((delta_0 * 180 / Math.PI).toFixed(1)),
        delta_max: Number((delta_max * 180 / Math.PI).toFixed(1)),
        tc_crit: Number(tc_crit.toFixed(3)),
        isStable,
        curves
    };
  }
