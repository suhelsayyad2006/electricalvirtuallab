export interface Phasor {
  mag: number;
  ang: number; // in degrees
}

export interface Complex {
  re: number;
  im: number;
}

// Utility to convert polar to rectangular
export function p2r(p: Phasor): Complex {
  const rad = p.ang * (Math.PI / 180);
  return {
    re: p.mag * Math.cos(rad),
    im: p.mag * Math.sin(rad)
  };
}

// Utility to convert rectangular to polar
export function r2p(c: Complex): Phasor {
  return {
    mag: Math.sqrt(c.re * c.re + c.im * c.im),
    ang: Math.atan2(c.im, c.re) * (180 / Math.PI)
  };
}

// Complex arithmetic
export function add(a: Complex, b: Complex): Complex { return { re: a.re + b.re, im: a.im + b.im }; }
export function sub(a: Complex, b: Complex): Complex { return { re: a.re - b.re, im: a.im - b.im }; }
export function mul(a: Complex, b: Complex): Complex { 
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; 
}
export function div(a: Complex, b: Complex): Complex {
  const den = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / den, im: (a.im * b.re - a.re * b.im) / den };
}
export function conj(a: Complex): Complex { return { re: a.re, im: -a.im }; }

export function calculateThreePhase(
  Vll: number,
  f: number,
  loads: { Z: number, pf: number }[] // array of 3 loads (mag, power factor)
) {
  // Phase voltages (Line-to-Neutral)
  const Vln = Vll / Math.sqrt(3);
  const Va: Phasor = { mag: Vln, ang: 0 };
  const Vb: Phasor = { mag: Vln, ang: -120 };
  const Vc: Phasor = { mag: Vln, ang: 120 };

  const Va_c = p2r(Va);
  const Vb_c = p2r(Vb);
  const Vc_c = p2r(Vc);

  // Load impedances
  const Z_c = loads.map(l => {
    // Assuming lagging power factor (+ angle for impedance)
    const angle = Math.acos(l.pf) * (180 / Math.PI);
    return p2r({ mag: l.Z, ang: angle });
  });

  // Calculate Currents (I = V / Z)
  const Ia_c = Z_c[0].re === 0 && Z_c[0].im === 0 ? {re: 0, im: 0} : div(Va_c, Z_c[0]);
  const Ib_c = Z_c[1].re === 0 && Z_c[1].im === 0 ? {re: 0, im: 0} : div(Vb_c, Z_c[1]);
  const Ic_c = Z_c[2].re === 0 && Z_c[2].im === 0 ? {re: 0, im: 0} : div(Vc_c, Z_c[2]);
  
  // Neutral current In = Ia + Ib + Ic
  const In_c = add(add(Ia_c, Ib_c), Ic_c);

  const Ia = r2p(Ia_c);
  const Ib = r2p(Ib_c);
  const Ic = r2p(Ic_c);
  const In = r2p(In_c);

  // Power calculations (S = V * I*)
  const S_a = mul(Va_c, conj(Ia_c));
  const S_b = mul(Vb_c, conj(Ib_c));
  const S_c = mul(Vc_c, conj(Ic_c));
  const S_total = add(add(S_a, S_b), S_c);

  // Time domain waveforms
  const waveforms = [];
  const points = 150;
  const t_max = (1 / f) * 2; // 2 cycles
  const dt = t_max / points;
  const w = 2 * Math.PI * f;

  for(let i=0; i<=points; i++) {
    const t = i * dt;
    // v(t) = sqrt(2) * Vrms * cos(wt + theta)
    const v_a = Math.SQRT2 * Va.mag * Math.cos(w*t + Va.ang*(Math.PI/180));
    const v_b = Math.SQRT2 * Vb.mag * Math.cos(w*t + Vb.ang*(Math.PI/180));
    const v_c = Math.SQRT2 * Vc.mag * Math.cos(w*t + Vc.ang*(Math.PI/180));
    
    const i_a = Math.SQRT2 * Ia.mag * Math.cos(w*t + Ia.ang*(Math.PI/180));
    const i_b = Math.SQRT2 * Ib.mag * Math.cos(w*t + Ib.ang*(Math.PI/180));
    const i_c = Math.SQRT2 * Ic.mag * Math.cos(w*t + Ic.ang*(Math.PI/180));
    
    waveforms.push({
      time: Number((t * 1000).toFixed(2)),
      va: Number(v_a.toFixed(2)),
      vb: Number(v_b.toFixed(2)),
      vc: Number(v_c.toFixed(2)),
      ia: Number(i_a.toFixed(2)),
      ib: Number(i_b.toFixed(2)),
      ic: Number(i_c.toFixed(2))
    });
  }

  return {
    waveforms,
    phasors: { Va, Vb, Vc, Ia, Ib, Ic, In },
    power: {
      Pa: S_a.re, Qa: S_a.im,
      Pb: S_b.re, Qb: S_b.im,
      Pc: S_c.re, Qc: S_c.im,
      P_tot: S_total.re, Q_tot: S_total.im, S_tot: Math.sqrt(S_total.re**2 + S_total.im**2)
    }
  };
}
