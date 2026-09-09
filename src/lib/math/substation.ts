export function calculateSubstationGrounding(
    If_kA: number, // Fault current in kA
    tc: number, // Fault clearing time (seconds)
    rho: number, // Soil resistivity (Ohm-m)
    rho_s: number, // Surface layer resistivity (Ohm-m), e.g. crushed rock
    hs: number, // Surface layer thickness (m)
    L_grid: number, // Grid length (m)
    W_grid: number, // Grid width (m)
    n_conductors_L: number // Number of parallel conductors in length direction
  ) {
    const If = If_kA * 1000;
    
    // IEEE 80 simplified calculations
    const A = L_grid * W_grid;
    // Assuming square-ish grid, total buried conductor length:
    const n_W = Math.round(W_grid / (L_grid / n_conductors_L)); // conductors in width direction
    const Lc = (n_conductors_L * W_grid) + (n_W * L_grid);
    
    // Reflection factor K
    const K = (rho - rho_s) / (rho + rho_s);
    
    // Surface layer derating factor Cs
    // Simplified approximation for standard crushed rock
    let Cs = 1;
    if (hs > 0) {
        Cs = 1 - (0.09 * (1 - rho/rho_s)) / (2 * hs + 0.09);
    }
    
    // Tolerable Touch and Step Voltages (for 70kg person)
    // Etouch50 = (1000 + 1.5 * Cs * rho_s) * 0.157 / sqrt(tc)
    const E_touch_tol = (1000 + 1.5 * Cs * rho_s) * 0.157 / Math.sqrt(tc);
    
    // Estep50 = (1000 + 6 * Cs * rho_s) * 0.157 / sqrt(tc)
    const E_step_tol = (1000 + 6 * Cs * rho_s) * 0.157 / Math.sqrt(tc);
    
    // Grid Resistance (Laurent and Niemann equation)
    const h = 0.5; // burial depth (m)
    const R_grid = rho * (1 / Lc + 1 / Math.sqrt(20 * A)) * (1 + 1 / (1 + h * Math.sqrt(20 / A)));
    
    // Grid Potential Rise (GPR)
    const GPR = If * R_grid;
    
    // Actual Mesh (Touch) and Step Voltages (Simplified approximations)
    // Mesh voltage Em = rho * K_m * K_i * Ig / L_c
    // Using crude empirical constants for educational visualizer
    const Km = 0.25 * Math.log((W_grid * W_grid)/(16 * h * 0.01)) + 0.1; 
    const Ki = 0.644 + 0.148 * n_conductors_L;
    
    const E_mesh = (rho * Km * Ki * If) / Lc;
    
    // Step voltage Es = rho * K_s * K_i * Ig / L_c
    const Ks = (1 / (2 * h)) + (1 / (W_grid + h)) + (1 / W_grid);
    const E_step = (rho * Ks * Ki * If) / Lc;
    
    const isSafe = E_mesh <= E_touch_tol && E_step <= E_step_tol;
  
    // Generate data for visualization bar chart
    const data = [
        { name: 'Touch Voltage', Actual: Number(E_mesh.toFixed(0)), Tolerable: Number(E_touch_tol.toFixed(0)) },
        { name: 'Step Voltage', Actual: Number(E_step.toFixed(0)), Tolerable: Number(E_step_tol.toFixed(0)) }
    ];
  
    return {
        R_grid: Number(R_grid.toFixed(2)),
        GPR: Number(GPR.toFixed(0)),
        E_touch_tol: Number(E_touch_tol.toFixed(0)),
        E_step_tol: Number(E_step_tol.toFixed(0)),
        E_mesh: Number(E_mesh.toFixed(0)),
        E_step: Number(E_step.toFixed(0)),
        isSafe,
        Lc,
        data
    };
  }
