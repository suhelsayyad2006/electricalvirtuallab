export function calculateRLCTransient(R: number, L: number, C: number, V: number, duration: number, points: number = 200) {
    // Convert to standard units just in case (assuming inputs are Ohms, mH, uF)
    const L_H = L * 1e-3;
    const C_F = C * 1e-6;
    
    const alpha = R / (2 * L_H);
    const w0 = 1 / Math.sqrt(L_H * C_F);
    
    const data = [];
    const dt = duration / points;
    
    for (let i = 0; i <= points; i++) {
        const t = i * dt;
        let vc = 0;
        let i_c = 0;
        
        if (alpha > w0) { // Overdamped
            const s1 = -alpha + Math.sqrt(alpha*alpha - w0*w0);
            const s2 = -alpha - Math.sqrt(alpha*alpha - w0*w0);
            const A1 = (V * s2) / (s1 - s2);
            const A2 = -(V * s1) / (s1 - s2);
            vc = V + A1 * Math.exp(s1 * t) + A2 * Math.exp(s2 * t);
            i_c = C_F * (A1 * s1 * Math.exp(s1 * t) + A2 * s2 * Math.exp(s2 * t));
        } else if (Math.abs(alpha - w0) < 1e-3) { // Critically damped
            vc = V - V * (1 + alpha * t) * Math.exp(-alpha * t);
            i_c = C_F * (V * alpha * alpha * t * Math.exp(-alpha * t));
        } else { // Underdamped
            const wd = Math.sqrt(w0*w0 - alpha*alpha);
            vc = V - V * Math.exp(-alpha * t) * (Math.cos(wd * t) + (alpha / wd) * Math.sin(wd * t));
            i_c = C_F * (V * Math.exp(-alpha * t) * ((alpha*alpha/wd + wd)*Math.sin(wd * t)));
        }
        
        data.push({
            time: Number(t.toFixed(5)),
            time_ms: Number((t * 1000).toFixed(2)),
            voltage: Number(vc.toFixed(4)),
            current: Number((i_c * 1000).toFixed(4)) // mA
        });
    }
    
    return data;
}

export function calculateRLCResonance(R: number, L: number, C: number, V: number) {
    const L_H = L * 1e-3;
    const C_F = C * 1e-6;
    
    const fr = 1 / (2 * Math.PI * Math.sqrt(L_H * C_F));
    const data = [];
    
    // Sweep from 0.1*fr to 3*fr
    const fStart = fr * 0.1;
    const fEnd = fr * 3;
    const points = 200;
    const df = (fEnd - fStart) / points;
    
    for (let i = 0; i <= points; i++) {
        const f = fStart + i * df;
        const w = 2 * Math.PI * f;
        const XL = w * L_H;
        const XC = 1 / (w * C_F);
        const Z = Math.sqrt(R*R + Math.pow(XL - XC, 2));
        const current = V / Z;
        const phase = (Math.atan2(XL - XC, R) * 180) / Math.PI;
        
        data.push({
            frequency: Number(f.toFixed(1)),
            current: Number((current * 1000).toFixed(2)), // mA
            impedance: Number(Z.toFixed(2)),
            phase: Number(phase.toFixed(2))
        });
    }
    
    return { fr, data };
}
