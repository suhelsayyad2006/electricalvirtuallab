export function calculateTransformer(
    V1: number, // Primary voltage (V)
    f: number, // Frequency (Hz)
    a: number, // Turns ratio (N1/N2)
    loadS: number, // Load Apparent Power (VA)
    loadPf: number, // Load Power Factor
    mode: 'open_circuit' | 'short_circuit' | 'load'
  ) {
    // Transformer Equivalent Circuit Parameters (Referred to Primary)
    const R1 = 0.5; // Ohms
    const X1 = 1.2; // Ohms
    const R2_prime = 0.45; // Ohms
    const X2_prime = 1.1; // Ohms
    const Rc = 5000; // Core loss resistance (Ohms)
    const Xm = 2000; // Magnetizing reactance (Ohms)
  
    // Equivalent series impedance
    const Req = R1 + R2_prime;
    const Xeq = X1 + X2_prime;
    const Zeq = Math.sqrt(Req*Req + Xeq*Xeq);
  
    let I1 = 0;
    let I2 = 0;
    let V2 = 0;
    let P_core = 0;
    let P_cu = 0;
    let efficiency = 0;
    let regulation = 0;
    
    // Core losses (approx constant based on V1)
    P_core = (V1 * V1) / Rc;
    const Im = V1 / Xm;
    const Ic = V1 / Rc;
    const I0 = Math.sqrt(Im*Im + Ic*Ic); // No-load current
  
    if (mode === 'open_circuit') {
        I1 = I0;
        I2 = 0;
        V2 = V1 / a;
        P_cu = I1 * I1 * R1; // Only primary copper loss
        efficiency = 0;
        regulation = 0;
    } 
    else if (mode === 'short_circuit') {
        // Short circuit on secondary, usually apply low voltage, but we simulate full V1 shorting
        // Wait, standard SC test applies reduced voltage to get rated current. 
        // For the simulation, we'll just calculate what happens if we apply V1 (huge current) or 
        // we scale it. Let's assume V1 is the "reduced" voltage they dial in for the test.
        I1 = V1 / Zeq;
        I2 = I1 * a;
        V2 = 0;
        P_cu = I1 * I1 * Req;
        P_core = 0; // Negligible at low voltage
        efficiency = 0;
        regulation = 0;
    }
    else {
        // Load Test
        const V2_rated = V1 / a;
        
        // Load current (Secondary side)
        I2 = loadS / V2_rated; // Approx
        const I2_prime = I2 / a;
        
        // Voltage drop across series impedance
        // V1 = V2' + I2'(Req + jXeq) -> Approximation: Vdrop = I2'(Req * cosPhi + Xeq * sinPhi)
        const sinPhi = Math.sin(Math.acos(loadPf));
        const Vdrop = I2_prime * (Req * loadPf + Xeq * sinPhi);
        
        const V2_prime = V1 - Vdrop;
        V2 = V2_prime / a;
        
        I1 = Math.sqrt(Math.pow(I2_prime * loadPf + Ic, 2) + Math.pow(I2_prime * sinPhi + Im, 2));
        
        P_cu = I2_prime * I2_prime * Req;
        const P_out = V2 * I2 * loadPf;
        const P_in = P_out + P_cu + P_core;
        
        efficiency = P_out > 0 ? (P_out / P_in) * 100 : 0;
        regulation = ((V2_rated - V2) / V2_rated) * 100;
    }
  
    return {
        I1: Number(I1.toFixed(2)),
        I2: Number(I2.toFixed(2)),
        V2: Number(V2.toFixed(2)),
        P_core: Number(P_core.toFixed(2)),
        P_cu: Number(P_cu.toFixed(2)),
        efficiency: Number(efficiency.toFixed(2)),
        regulation: Number(regulation.toFixed(2))
    };
  }
