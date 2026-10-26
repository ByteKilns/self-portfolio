export interface BitState {
  x: number;
  y: number;
  vy: number;
  vx: number;
  sq: number;
  ground: boolean;
  nextBlink: number;
  blinkAt: number;
  happyUntil: number;
  lastMove: number;
  asleep: boolean;
  line: number;
  px: number | null;
  py: number;
  s: number;
  mode: 'perch' | 'travel' | 'chute' | 'ground' | null;
  perchEl?: Element | null;
  from?: { x: number; y: number };
  t0?: number;
  dur?: number;
  arc?: number;
  flying?: boolean;
  hopT?: number;
  chuteOff?: number;
  clip?: string;
  landX?: number;
  said: Set<string>;
}

export interface Perch {
  el: Element | null;
  x: number;
  y: number;
  m: string;
  say?: string;
  score: number;
}

export interface BitEnv {
  vw: number;
  vh: number;
  W: number;
  narrow: boolean;
  motion: boolean;
  ptr: { x: number; y: number };
  floorRect: DOMRect | null;
  emailRect: DOMRect | null;
  perchEls: Element[];
  lure: boolean;
  cursor: boolean;
  hover: boolean;
  say: (text: string, ms: number) => void;
}

export interface BitFrame {
  wrap: string;
  scale: string;
  bubbleBottom: string;
  chuteOpacity: string;
  chuteTransform: string;
  clip: string;
  body: string;
  sprout: string;
  armL: string;
  armR: string;
  pupilL: string;
  pupilR: string;
  eyes: string;
  eyesOpacity: string;
  happy: string;
  mouth: string;
  mouthO: string;
  cheek: string;
  shadowRx: string;
  shadowOpacity: string;
}

export function createBit(): BitState {
  return {
    x: 0,
    y: 0,
    vy: 0,
    vx: 0,
    sq: 0,
    ground: true,
    nextBlink: 0,
    blinkAt: -1,
    happyUntil: 0,
    lastMove: 0,
    asleep: false,
    line: 0,
    px: null,
    py: 0,
    s: 0,
    mode: null,
    said: new Set()
  };
}

export const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

export function perches(H: number, vw: number, vh: number, els: Element[]): Perch[] {
  const out: Perch[] = [];
  els.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const m = (el as HTMLElement).dataset.perch ?? '';
    const f = parseFloat((el as HTMLElement).dataset.px || '0.85');
    const x = m === 'side' ? r.right + H * 0.55 : r.left + r.width * f;
    const y = m === 'side' ? r.bottom : r.top + (m === 'peek' ? H * 0.42 : 0);
    if (x < H * 0.5 || x > vw - H * 0.5 || y - H < 64 || y > vh - 24) return;
    out.push({
      el,
      x,
      y,
      m,
      say: (el as HTMLElement).dataset.say,
      score: Math.abs(y - vh * 0.42) + Math.abs(x - vw * 0.5) * 0.35
    });
  });
  return out;
}

export function step(b: BitState, t: number, env: BitEnv): BitFrame {
  const { vw, vh, W, motion } = env;
  const ps = env.narrow ? 0.55 : 0.66;
  const Hp = W * ps;
  if (b.px == null) {
    b.px = vw - Hp;
    b.py = vh + Hp * 1.2;
    b.s = ps;
    b.mode = 'perch';
    b.perchEl = undefined;
    b.nextBlink = t + 1500;
  }
  const idle = t - b.lastMove;
  if (!b.asleep && idle > 9000 && !env.hover) {
    b.asleep = true;
    env.say('z z z', 0);
  }
  if (b.asleep && idle < 200) {
    b.asleep = false;
    env.say('oh! hi!', 1400);
  }
  const fr = env.floorRect;
  if (b.mode === 'chute' || b.mode === 'ground') {
    if (!fr || !fr.width || fr.bottom > vh + 40) {
      b.mode = 'perch';
      b.perchEl = undefined;
      b.flying = true;
      env.lure = false;
      b.chuteOff = 0;
    }
  } else if (fr && fr.width && fr.bottom < vh * 0.9 && fr.bottom > 0) {
    b.mode = 'chute';
    b.from = { x: b.px, y: b.py };
    b.t0 = t;
    b.dur = motion ? 2600 : 0;
    b.landX = fr.width * 0.78;
    b.flying = false;
    b.chuteOff = 0;
  }
  let sT = ps;
  let air = 0;
  let tilt = 0;
  let swing = 0;
  let chute = 0;
  let clip = 'none';
  let shadow = 0;
  let shK = 1;
  let stretch = 0;
  if (b.mode === 'perch' || b.mode === 'travel') {
    const list = perches(Hp, vw, vh, env.perchEls);
    const cur = list.find((p) => p.el === b.perchEl);
    let best: Perch | null = null;
    for (const p of list) if (!best || p.score < best.score) best = p;
    let pick: Perch = cur && (!best || best.score > cur.score - 160) ? cur : best!;
    if (!pick) pick = { el: null, x: vw - Hp * 0.9, y: vh + Hp * 0.36, m: 'corner', score: 0 };
    if (pick.el !== b.perchEl) {
      const d = Math.hypot(pick.x - b.px, pick.y - b.py);
      b.perchEl = pick.el;
      b.mode = 'travel';
      b.from = { x: b.px, y: b.py };
      b.t0 = t;
      b.dur = motion ? Math.min(b.flying ? 1300 : 1000, Math.max(420, d * 0.8)) : 0;
      b.arc = Math.min(170, 40 + d * 0.22);
    }
    if (b.mode === 'travel') {
      const k = b.dur ? Math.min(1, (t - b.t0!) / b.dur) : 1;
      const e = ease(k);
      b.px = b.from!.x + (pick.x - b.from!.x) * e;
      b.py = b.from!.y + (pick.y - b.from!.y) * e - b.arc! * Math.sin(Math.PI * k);
      air = Math.sin(Math.PI * k);
      tilt = Math.sign(pick.x - b.from!.x) * 9 * air;
      if (k >= 1) {
        b.mode = 'perch';
        b.sq = 0.2;
        b.flying = false;
        if (pick.say && !b.said.has(pick.say)) {
          b.said.add(pick.say);
          env.say(pick.say, 1700);
        }
      }
    } else {
      b.px = pick.x;
      b.py = pick.y;
      if (pick.m === 'peek') clip = 'inset(0 0 42% 0)';
      else if (pick.m !== 'corner') shadow = 0.16;
    }
    if (b.hopT && motion) {
      const hk = (t - b.hopT) / 420;
      if (hk < 1) {
        b.py -= 26 * Math.sin(Math.PI * hk);
        air = Math.max(air, Math.sin(Math.PI * hk));
      }
    }
    stretch = air * 0.1;
  } else if (b.mode === 'chute') {
    const rect = fr!;
    const tx = rect.left + b.landX!;
    const ty = rect.bottom;
    const k = b.dur ? Math.min(1, (t - b.t0!) / b.dur) : 1;
    const upY = Math.max(W * 1.5, Math.min(b.from!.y, vh * 0.6) - 110);
    if (k < 0.14) {
      const u = 1 - Math.pow(1 - k / 0.14, 2);
      b.px = b.from!.x;
      b.py = b.from!.y + (upY - b.from!.y) * u;
      air = 1;
      stretch = 0.1;
    } else {
      const u = (k - 0.14) / 0.86;
      const e = ease(u);
      const f = 1 - u;
      b.px = b.from!.x + (tx - b.from!.x) * e + Math.sin(u * Math.PI * 3) * 36 * f;
      b.py = upY + (ty - upY) * e;
      swing = Math.cos(u * Math.PI * 3) * 9 * f;
      chute = Math.min(1, (k - 0.14) / 0.07);
      sT = ps + (1 - ps) * Math.min(1, u * 1.4);
    }
    if (k >= 1) {
      b.mode = 'ground';
      b.x = b.landX!;
      b.y = 0;
      b.vx = 0;
      b.vy = 0;
      b.ground = true;
      b.sq = 0.26;
      b.chuteOff = t;
      chute = 1;
      sT = 1;
      env.say('made it!', 1500);
    }
  } else {
    const rect = fr!;
    const fw = rect.width;
    sT = 1;
    let tx = b.x;
    if (env.lure && env.emailRect) tx = env.emailRect.right - rect.left + W * 0.7;
    else if (env.cursor && !b.asleep) tx = env.ptr.x - rect.left;
    tx = Math.max(W / 2, Math.min(fw - W / 2, tx));
    const dx = tx - b.x;
    if (motion) {
      if (b.ground && Math.abs(dx) > W * 0.3 && !b.asleep && !env.hover) {
        b.vy = -5.2;
        b.vx = Math.sign(dx) * Math.min(4.2, Math.abs(dx) * 0.04 + 1.6);
        b.ground = false;
      }
      if (!b.ground) {
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.42;
        if (b.y >= 0) {
          b.y = 0;
          b.ground = true;
          b.sq = Math.min(0.22, 0.08 + Math.abs(b.vy) * 0.02);
          b.vy = 0;
        }
      }
    } else b.x = tx;
    b.px = rect.left + b.x;
    b.py = rect.bottom + b.y;
    air = b.ground ? 0 : 1;
    stretch = !b.ground ? Math.min(0.12, -b.vy * 0.02) : 0;
    tilt = !b.ground ? b.vx * 2.2 : 0;
    shK = Math.max(0.5, 1 + b.y / 70);
    shadow = 0.22 * shK;
    if (b.chuteOff) {
      const cc = 1 - (t - b.chuteOff) / 450;
      chute = Math.max(0, cc);
      if (cc <= 0) b.chuteOff = 0;
    }
  }
  b.s = b.mode === 'chute' || !motion ? sT : b.s + (sT - b.s) * 0.15;
  if (motion) b.sq *= 0.86;
  else b.sq = 0;
  const S = W * b.s;
  const wrap = `translate3d(${(b.px! - W / 2).toFixed(1)}px,${(b.py - W + S * 0.05).toFixed(1)}px,0) rotate(${swing.toFixed(2)}deg)`;
  const scale = `scale(${b.s.toFixed(3)})`;
  const bubbleBottom = `${(S * 0.95 + 4).toFixed(1)}px`;
  const chuteOpacity = chute.toFixed(2);
  const chuteTransform = `scale(${(0.4 + 0.6 * chute).toFixed(3)},${chute.toFixed(3)})`;
  const breath = motion ? Math.sin(t * (b.asleep ? 0.0018 : 0.0034)) * 0.022 : 0;
  const sx = 1 + b.sq * 0.9 - stretch * 0.5 - breath * 0.5;
  const sy = 1 - b.sq + stretch + breath;
  const body = `translate(60 110) rotate(${tilt.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-60 -110)`;
  const shadowRx = (30 * shK).toFixed(1);
  const shadowOpacity = shadow.toFixed(2);
  const sway = motion ? Math.sin(t * 0.003) * 7 - tilt * 0.45 - swing + (b.asleep ? 18 : 0) : 0;
  const sprout = `rotate(${sway.toFixed(2)} 60 36)`;
  const happy = env.hover || t < b.happyUntil;
  const excited = !!env.lure && b.mode === 'ground';
  let armL = motion ? Math.sin(t * 0.004) * 6 : 0;
  let armR = -armL;
  if (air > 0.05) {
    armL = 40;
    armR = -40;
  }
  if (b.flying && b.mode === 'travel' && motion) {
    armL = 70 + Math.sin(t * 0.05) * 45;
    armR = -armL;
  }
  if (b.mode === 'chute' && chute > 0.3) {
    armL = 150;
    armR = -150;
  }
  if (excited && motion) armR = -70 + Math.sin(t * 0.022) * 32;
  if (happy && motion && b.mode !== 'chute') {
    armL = 30 + Math.sin(t * 0.03) * 14;
    armR = -armL;
  }
  const armLTransform = `rotate(${armL.toFixed(1)} 23 72)`;
  const armRTransform = `rotate(${armR.toFixed(1)} 97 72)`;
  const ex = b.px!;
  const ey = b.py - S * 0.5;
  let lx = env.ptr.x;
  let ly = env.ptr.y;
  if (excited && env.emailRect) {
    const er = env.emailRect;
    lx = er.left + er.width / 2;
    ly = er.top + er.height / 2;
  }
  const ang = Math.atan2(ly - ey, lx - ex);
  const dist = Math.min(1, Math.hypot(lx - ex, ly - ey) / 200);
  const px = Math.cos(ang) * 4.2 * dist;
  const py = Math.sin(ang) * 3.6 * dist;
  const pupil = `translate(${px.toFixed(2)} ${py.toFixed(2)})`;
  if (t > b.nextBlink) {
    b.blinkAt = t;
    b.nextBlink = t + 2200 + Math.random() * 3200;
  }
  let lid = 1;
  const bp = (t - b.blinkAt) / 150;
  if (bp >= 0 && bp < 1) lid = 1 - Math.sin(bp * Math.PI) * 0.92;
  if (b.asleep) lid = 0.08;
  if (excited) lid = 1.08;
  const eyes = `translate(60 66) scale(1 ${lid.toFixed(3)}) translate(-60 -66)`;
  const eyesOpacity = happy ? '0' : '1';
  const happyOpacity = happy ? '1' : '0';
  const oMouth = happy || excited || b.mode === 'chute';
  const mouth = oMouth ? '0' : '1';
  const mouthO = oMouth ? '1' : '0';
  const cheek = happy ? '.9' : excited ? '.75' : '.5';
  return {
    wrap,
    scale,
    bubbleBottom,
    chuteOpacity,
    chuteTransform,
    clip,
    body,
    sprout,
    armL: armLTransform,
    armR: armRTransform,
    pupilL: pupil,
    pupilR: pupil,
    eyes,
    eyesOpacity,
    happy: happyOpacity,
    mouth,
    mouthO,
    cheek,
    shadowRx,
    shadowOpacity
  };
}
