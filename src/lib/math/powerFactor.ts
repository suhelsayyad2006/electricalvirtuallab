export function calculatePowerFactor(
    V_rms: number, // Line voltage (V)
    P_load: number, // Active Power (kW)
    initial_pf: number, // Initial Power Factor (e.g. 0.7 lagging)
    C_bank: number // Capacitor Bank size (kVAR)
  ) {
    // Original Load (S1 = P + jQ1)
    const P = P_load; // kW
    // P = S * cos(phi) => S = P / cos(phi)
    const S1 = P / initial_pf;
    const phi1 = Math.acos(initial_pf);
    const Q1 = P * Math.tan(phi1); // kVAR (inductive, so positive)
    
    // Capacitor Bank adds leading kVAR (negative)
    const Q_c = C_bank; // kVAR
    
    // New Load (S2 = P + jQ2)
    const Q2 = Q1 - Q_c; // New reactive power
    const S2 = Math.sqrt(P * P + Q2 * Q2);
    
    // New Power Factor
    const new_pf = P / S2;
    const isLeading = Q2 < 0;
    
    // Currents (Assuming Single Phase for visualization simplicity)
    const I1_mag = (S1 * 1000) / V_rms;
    const I2_mag = (S2 * 1000) / V_rms;
    const Ic_mag = (Q_c * 1000) / V_rms;
    
    // Calculate annual cost savings
    // Assume utility charges $0.10 per kVAh penalty if PF < 0.9
    // This is a simplified tariff for educational purposes
    const kva_penalty_rate = 0.15; // $/kVAh
    const hours_per_year = 8760;
    const penalty1 = initial_pf < 0.9 ? (S1 - P) * kva_penalty_rate * hours_per_year : 0;
    const penalty2 = new_pf < 0.9 && !isLeading ? (S2 - P) * kva_penalty_rate * hours_per_year : 0;
    
    // Overcorrection penalty (if leading)
    const overcorrect_penalty = isLeading ? Math.abs(Q2) * 0.20 * hours_per_year : 0;
    
    const total_savings = penalty1 - (penalty2 + overcorrect_penalty);
    
    // Generate Phasor Data for the Triangle
    // Base is Active Power (P)
    const phasors = [
       { name: 'Active Power (kW)', x: P, y: 0, color: '#16a34a' },
       { name: 'Initial Reactive (kVAR)', x: P, y: Q1, color: '#ef4444' },
       { name: 'New Reactive (kVAR)', x: P, y: Q2, color: '#3b82f6' },
       { name: 'Capacitor (kVAR)', x: P, y: Q2, yStart: Q1, color: '#eab308' } 
       // Note: UI will render these creatively
    ];
  
    return {
        P: Number(P.toFixed(1)),
        Q1: Number(Q1.toFixed(1)),
        S1: Number(S1.toFixed(1)),
        I1: Number(I1_mag.toFixed(1)),
        
        Q2: Number(Q2.toFixed(1)),
        S2: Number(S2.toFixed(1)),
        I2: Number(I2_mag.toFixed(1)),
        new_pf: Number(new_pf.toFixed(3)),
        isLeading,
        
        penalty1: Number(penalty1.toFixed(0)),
        penalty2: Number((penalty2 + overcorrect_penalty).toFixed(0)),
        total_savings: Number(total_savings.toFixed(0)),
        
        phasors
    };
  }
