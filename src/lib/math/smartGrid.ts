export function calculateSmartGrid(
    solarGen: number, // kW
    windGen: number, // kW
    conventionalGen: number, // kW
    loadRes: number, // kW
    loadCom: number, // kW
    loadInd: number, // kW
    batteryCapacity: number, // kWh
    batterySOC: number // %
  ) {
    // Total Generation and Load
    const totalGen = solarGen + windGen + conventionalGen;
    const totalLoad = loadRes + loadCom + loadInd;
    
    // Power Balance
    const deltaP = totalGen - totalLoad;
    
    // Battery Logic
    let newSOC = batterySOC;
    let batteryFlow = 0; // + means charging, - means discharging
    let gridExport = 0; // + means exporting, - means importing / shortfall
    let status = "Stable";
    let f = 50.0;
    
    if (deltaP > 0) {
        // Surplus power
        if (batterySOC < 100) {
            // Charge battery first (assuming max charge rate is sufficient, say 500kW)
            const chargePower = Math.min(deltaP, 500); 
            batteryFlow = chargePower;
            gridExport = deltaP - chargePower;
            status = "Surplus - Charging Battery";
        } else {
            // Battery full, export to grid or curtail
            gridExport = deltaP;
            status = "Surplus - Exporting to Grid";
        }
        // Frequency rises slightly on surplus if not perfectly regulated
        f = 50.0 + (deltaP / 5000) * 0.5;
    } else if (deltaP < 0) {
        // Deficit power
        const deficit = Math.abs(deltaP);
        if (batterySOC > 5) { // 5% minimum reserve
            // Discharge battery (assuming max discharge rate, say 500kW)
            const dischargePower = Math.min(deficit, 500);
            batteryFlow = -dischargePower;
            const remainingDeficit = deficit - dischargePower;
            
            if (remainingDeficit > 0) {
                gridExport = -remainingDeficit; // Importing
                status = "Deficit - Discharging Battery & Importing";
                f = 50.0 - (remainingDeficit / 5000) * 0.5;
            } else {
                status = "Deficit - Discharging Battery";
                f = 50.0;
            }
        } else {
            // Battery empty
            gridExport = -deficit;
            status = "Deficit - Battery Low - Importing from Grid";
            f = 50.0 - (deficit / 5000) * 1.0;
        }
    } else {
         status = "Perfectly Balanced";
    }
    
    // If frequency drops too low, we have grid collapse / blackout risk
    if (f < 49.0) {
        status = "CRITICAL: Underfrequency (Load Shedding Required)";
    } else if (f > 51.0) {
        status = "CRITICAL: Overfrequency (Generation Curtailment Required)";
    }
  
    // Simulate battery SOC changing slightly over 1 'tick' for visual
    // SOC = SOC + (Power * time / Capacity) * 100
    // We'll just return the instantaneous rate of change so the UI can update it if it wants, 
    // or just return the static balance.
    const socRate = (batteryFlow / batteryCapacity) * 100; // % per hour
  
    return {
        totalGen: Number(totalGen.toFixed(1)),
        totalLoad: Number(totalLoad.toFixed(1)),
        batteryFlow: Number(batteryFlow.toFixed(1)),
        gridExport: Number(gridExport.toFixed(1)),
        frequency: Number(f.toFixed(2)),
        status,
        socRate: Number(socRate.toFixed(2))
    };
  }
