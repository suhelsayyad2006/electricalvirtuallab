export function calculateRelay(
    I_fault: number, // Primary fault current (A)
    CT_primary: number, // CT Primary (e.g. 400)
    CT_secondary: number, // CT Secondary (e.g. 5)
    PS: number, // Plug Setting (e.g. 50% to 200%)
    TMS: number, // Time Multiplier Setting (0.1 to 1.0)
    curveType: 'standard' | 'very' | 'extremely'
  ) {
    // Current Transformer Ratio
    const CTR = CT_primary / CT_secondary;
    
    // Relay fault current
    const I_relay = I_fault / CTR;
    
    // Pickup current
    const I_pickup = CT_secondary * (PS / 100);
    
    // Plug Setting Multiplier
    const PSM = I_relay / I_pickup;
    
    // Calculate Trip Time based on IEC 60255 formulas
    let t_trip = -1; // -1 means no trip
    if (PSM > 1) {
        if (curveType === 'standard') {
            t_trip = TMS * (0.14 / (Math.pow(PSM, 0.02) - 1));
        } else if (curveType === 'very') {
            t_trip = TMS * (13.5 / (PSM - 1));
        } else if (curveType === 'extremely') {
            t_trip = TMS * (80 / (Math.pow(PSM, 2) - 1));
        }
    }
  
    // Generate IDMT Curve data for the graph (Trip Time vs. PSM)
    const curve = [];
    for (let p = 1.1; p <= 20; p += 0.5) {
        let t = 0;
        if (curveType === 'standard') t = TMS * (0.14 / (Math.pow(p, 0.02) - 1));
        if (curveType === 'very') t = TMS * (13.5 / (p - 1));
        if (curveType === 'extremely') t = TMS * (80 / (Math.pow(p, 2) - 1));
        
        curve.push({
            psm: Number(p.toFixed(1)),
            time: Number(t.toFixed(2))
        });
    }
  
    return {
        I_relay: Number(I_relay.toFixed(2)),
        I_pickup: Number(I_pickup.toFixed(2)),
        PSM: Number(PSM.toFixed(2)),
        t_trip: t_trip > 0 ? Number(t_trip.toFixed(3)) : 'No Trip',
        curve
    };
  }
