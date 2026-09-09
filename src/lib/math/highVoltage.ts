export function calculatePaschensLaw(
    gasType: 'Air' | 'SF6',
    pressure_atm: number, // Pressure in atmospheres
    gap_mm: number // Gap distance in mm
  ) {
    // Convert to standard Paschen units: p in Torr, d in cm
    const p_torr = pressure_atm * 760;
    const d_cm = gap_mm / 10;
    const pd = p_torr * d_cm; // Torr-cm
    
    // Townsend Empirical Constants
    let A = 0, B = 0, gamma = 0.01; // gamma is secondary electron emission coefficient
    
    if (gasType === 'Air') {
        A = 15; // 1/(cm.Torr)
        B = 365; // V/(cm.Torr)
        gamma = 0.01;
    } else if (gasType === 'SF6') {
        // SF6 is highly electronegative, much higher breakdown strength
        A = 12; // approx
        B = 600; // approx
        gamma = 0.005;
    }
    
    const ln_gamma = Math.log(1 + 1 / gamma);
    
    // Vb = B * pd / (ln(A * pd) - ln(ln_gamma))
    // Calculate Breakdown voltage (Vb)
    let Vb = 0;
    const denominator = Math.log(A * pd) - Math.log(ln_gamma);
    if (denominator > 0) {
        Vb = (B * pd) / denominator;
    } else {
        Vb = Infinity; // Below Paschen minimum mathematically
    }
    
    // Generate Paschen Curve (Vb vs pd)
    const curve = [];
    const min_pd = (2.718 * ln_gamma) / A; // Approximate theoretical minimum
    
    for (let current_pd = min_pd * 1.1; current_pd <= 1000; current_pd *= 1.2) {
        const den = Math.log(A * current_pd) - Math.log(ln_gamma);
        let v = (B * current_pd) / den;
        if (v > 0 && v < 500000) { // Limit to 500kV for chart clarity
           curve.push({
               pd: Number(current_pd.toFixed(1)),
               Vb_kV: Number((v / 1000).toFixed(2))
           });
        }
    }
  
    return {
        pd: Number(pd.toFixed(1)),
        Vb_kV: Vb === Infinity ? Infinity : Number((Vb / 1000).toFixed(2)),
        curve
    };
  }
