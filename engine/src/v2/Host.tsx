import React from 'react';

/* The host: cartoon version of the channel owner.
   Big wavy black hair, full beard + mustache, warm brown skin, thick brows,
   blue/white pinstripe collared shirt. Pure SVG, static props (animate by changing props). */

export type HMood = 'neutral' | 'shocked' | 'smirk' | 'worried' | 'happy';
export type HGesture = 'none' | 'point' | 'palm' | 'hands' | 'wave';

const LINE = '#1a1210';
export const HOST_COLORS = {
  skin: '#c88a62', skinLight: '#dda57e', skinShadow: '#a56b46', hair: '#16100e', hairHi: '#3e2d27',
  beard: '#1b1311', shirt: '#b8cdea', stripe: '#f5f8fd', stripeDark: '#7d9dd0', iris: '#3a2416',
};
const C = HOST_COLORS;

const BROWS: Record<HMood, [number, number, number]> = {
  neutral: [0, 0, 0], shocked: [-24, -6, 6], smirk: [-2, 7, -15], worried: [-8, -14, 14], happy: [-9, -4, 4],
};
const LIDS: Record<HMood, [number, number]> = {neutral: [0.2, 0], shocked: [0, 0], smirk: [0.36, 0.1], worried: [0.24, 0], happy: [0.2, 0.42]};

type Pose = {e: [number, number]; w: [number, number]};
const REST_R: Pose = {e: [560, 760], w: [560, 980]};
const REST_L: Pose = {e: [40, 760], w: [40, 980]};
const POSES_R: Record<Exclude<HGesture, 'none'>, Pose> = {
  point: {e: [650, 600], w: [612, 430]}, palm: {e: [640, 670], w: [596, 500]},
  hands: {e: [650, 620], w: [600, 452]}, wave: {e: [660, 590], w: [676, 410]},
};
const POSE_L_HANDS: Pose = {e: [-50, 620], w: [0, 452]};

const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); };

const Defs: React.FC<{id: string}> = ({id}) => (
  <defs>
    <radialGradient id={`${id}skin`} cx="45%" cy="36%" r="72%"><stop offset="0%" stopColor={C.skinLight} /><stop offset="65%" stopColor={C.skin} /><stop offset="100%" stopColor={C.skinShadow} /></radialGradient>
    <linearGradient id={`${id}hair`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2c211d" /><stop offset="55%" stopColor={C.hair} /><stop offset="100%" stopColor="#0b0807" /></linearGradient>
    <radialGradient id={`${id}iris`} cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#5a3a24" /><stop offset="100%" stopColor="#1e120a" /></radialGradient>
    <pattern id={`${id}stripes`} width="15" height="12" patternUnits="userSpaceOnUse">
      <rect width="15" height="12" fill={C.shirt} /><rect x="0" width="4.5" height="12" fill={C.stripe} /><rect x="9.5" width="1.6" height="12" fill={C.stripeDark} />
    </pattern>
    <linearGradient id={`${id}shade`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#000" stopOpacity="0.22" /><stop offset="25%" stopColor="#000" stopOpacity="0" />
      <stop offset="75%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.22" /></linearGradient>
  </defs>
);

const Hand: React.FC<{kind: 'point' | 'palm' | 'fist'; id: string}> = ({kind, id}) => {
  const skin = `url(#${id}skin)`;
  return (
    <g>
      {kind === 'point' && <>
        <rect x={-13} y={-140} width={30} height={100} rx={15} fill={skin} stroke={LINE} strokeWidth={5} />
        <path d="M -30 -40 Q -46 -78 -24 -96 Q -4 -104 8 -88 L 12 -44 Z" fill={skin} stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={2} cy={-38} rx={38} ry={34} fill={skin} stroke={LINE} strokeWidth={5} />
      </>}
      {kind === 'palm' && <>
        {[-27, -9, 9, 27].map((x, k) => <rect key={k} x={x - 9} y={-116 + Math.abs(x) * 0.7} width={19} height={74} rx={9.5} fill={skin} stroke={LINE} strokeWidth={4.5} />)}
        <path d="M -40 -36 Q -70 -56 -64 -78 Q -56 -90 -40 -76 L -24 -54 Z" fill={skin} stroke={LINE} strokeWidth={4.5} strokeLinejoin="round" />
        <ellipse cx={0} cy={-40} rx={40} ry={36} fill={skin} stroke={LINE} strokeWidth={5} />
      </>}
      {kind === 'fist' && <ellipse cx={0} cy={-36} rx={38} ry={34} fill={skin} stroke={LINE} strokeWidth={5} />}
    </g>
  );
};

const Arm: React.FC<{s: [number, number]; p: Pose; hand: 'point' | 'palm' | 'fist'; flip?: boolean; wave?: number; id: string}> = ({s, p, hand, flip, wave = 0, id}) => {
  const [ex, ey] = p.e, [wx, wy] = p.w;
  const ang = Math.atan2(wy - ey, wx - ex) * 180 / Math.PI + 90;
  const d = `M ${s[0]} ${s[1]} Q ${ex} ${ey} ${wx} ${wy}`;
  return (
    <g>
      <path d={d} stroke={LINE} strokeWidth={96} fill="none" strokeLinecap="round" />
      <path d={d} stroke={`url(#${id}stripes)`} strokeWidth={84} fill="none" strokeLinecap="round" />
      <g transform={`translate(${wx} ${wy}) rotate(${ang + wave}) scale(${flip ? -1 : 1} 1)`}>
        <rect x={-42} y={-18} width={84} height={34} rx={10} fill={C.stripe} stroke={LINE} strokeWidth={5} />
        <circle cx={22} cy={0} r={5} fill="#cfd8e6" stroke={LINE} strokeWidth={2} />
        <Hand kind={hand} id={id} />
      </g>
    </g>
  );
};

export type HostProps = {mood?: HMood; mouth?: number; gesture?: HGesture; g?: number; blink?: number; look?: number; tilt?: number;
  viewBox?: string; width?: number; height?: number; id?: string; wave?: number; clip?: boolean};

export const HostArt: React.FC<HostProps> = ({mood = 'neutral', mouth = 0, gesture = 'none', g = 1, blink = 0, look = 0, tilt = 0,
  viewBox = '-80 0 760 900', width = 760, height = 900, id = 'h', wave = 0, clip = false}) => {
  const [by, bl, br] = BROWS[mood];
  const [up, low] = LIDS[mood];
  const skin = `url(#${id}skin)`;
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const lp = (a: Pose, b: Pose): Pose => ({e: [lerp(a.e[0], b.e[0], g), lerp(a.e[1], b.e[1], g)], w: [lerp(a.w[0], b.w[0], g), lerp(a.w[1], b.w[1], g)]});
  const pr = gesture === 'none' ? REST_R : lp(REST_R, POSES_R[gesture]);
  const pl = gesture === 'hands' ? lp(REST_L, POSE_L_HANDS) : REST_L;
  const wide = mood === 'shocked' ? 1.12 : 1;

  const Eye: React.FC<{cx: number; side: number}> = ({cx, side}) => {
    const rx = 28 * wide, ry = 30 * wide, cy = 298;
    const sm = mood === 'smirk' && side > 0 ? 0.22 : 0;
    const upper = Math.min(1, up + sm + blink * 1.1);
    const top = cy - ry + upper * ry * 2 * 0.95, bot = cy + ry - low * ry * 1.1;
    return (
      <g>
        <clipPath id={`${id}eye${side}`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fbf8f4" />
        <g clipPath={`url(#${id}eye${side})`}>
          <circle cx={cx + look} cy={cy + 4} r={mood === 'shocked' ? 13 : 17} fill={`url(#${id}iris)`} />
          <circle cx={cx + look} cy={cy + 4} r={mood === 'shocked' ? 6 : 8} fill="#0a0605" />
          <circle cx={cx + look + 6} cy={cy - 4} r={5} fill="#fff" />
          <rect x={cx - rx - 2} y={cy - ry - 4} width={rx * 2 + 4} height={Math.max(0, top - (cy - ry - 4))} fill={skin} />
          <rect x={cx - rx - 2} y={bot} width={rx * 2 + 4} height={ry * 2} fill={skin} />
        </g>
        <path d={`M ${cx - rx - 2} ${top + 3} Q ${cx} ${top - 12 + upper * 6} ${cx + rx + 2} ${top + 3}`} stroke={LINE} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M ${cx + side * (rx - 2)} ${top + 2} l ${side * 10} -6`} stroke={LINE} strokeWidth={5} strokeLinecap="round" />
        {low > 0.05 && <path d={`M ${cx - rx + 4} ${bot} Q ${cx} ${bot + 6} ${cx + rx - 4} ${bot}`} stroke={LINE} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />}
        <path d={`M ${cx - rx + 6} ${cy + ry + 8} Q ${cx} ${cy + ry + 14} ${cx + rx - 6} ${cy + ry + 8}`} stroke={C.skinShadow} strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />
      </g>
    );
  };

  // mouth (sits inside the beard)
  const MY = 416;
  let mouthEl: React.ReactNode;
  if (mouth < 0.08) {
    const d = mood === 'smirk' ? `M 272 ${MY} Q 306 ${MY + 10} 338 ${MY - 12}` : mood === 'worried' ? `M 274 ${MY + 6} Q 300 ${MY - 6} 326 ${MY + 6}`
      : mood === 'happy' ? `M 262 ${MY - 6} Q 300 ${MY + 30} 338 ${MY - 6}` : `M 272 ${MY} Q 300 ${MY + 12} 328 ${MY}`;
    mouthEl = mood === 'shocked'
      ? <ellipse cx={300} cy={MY + 4} rx={16} ry={22} fill="#3e1416" stroke={LINE} strokeWidth={5} />
      : <><path d={d} stroke="#8c4b3b" strokeWidth={12} fill="none" strokeLinecap="round" /><path d={d} stroke={LINE} strokeWidth={6} fill="none" strokeLinecap="round" /></>;
  } else {
    const w = mood === 'shocked' ? 20 + 8 * mouth : mood === 'happy' ? 36 + 6 * mouth : 28 + 8 * mouth, h = 8 + 30 * mouth;
    const cx = mood === 'smirk' ? 306 : 300;
    const shape = `M ${cx - w} ${MY} Q ${cx} ${MY - h * 0.5} ${cx + w} ${MY} Q ${cx + w * 0.9} ${MY + h} ${cx} ${MY + h * 1.05} Q ${cx - w * 0.9} ${MY + h} ${cx - w} ${MY} Z`;
    mouthEl = (
      <g>
        <clipPath id={`${id}mclip`}><path d={shape} /></clipPath>
        <g clipPath={`url(#${id}mclip)`}>
          <rect x={cx - w} y={MY - h} width={w * 2} height={h * 2.2} fill="#3e1416" />
          {mouth > 0.22 && <rect x={cx - w} y={MY - h} width={w * 2} height={h * 0.5 + 4} fill="#fbf7f2" />}
          {mouth > 0.35 && <ellipse cx={cx} cy={MY + h * 0.95} rx={w * 0.62} ry={h * 0.5} fill="#d9646b" />}
        </g>
        <path d={shape} fill="none" stroke="#8c4b3b" strokeWidth={6} strokeLinejoin="round" />
        <path d={shape} fill="none" stroke={LINE} strokeWidth={4} strokeLinejoin="round" />
      </g>
    );
  }

  // beard shape: jaw + cheeks + mustache, mouth window left open by drawing mouth on top
  const beard = `M 160 330 C 162 420 196 478 240 504 C 270 522 330 522 360 504 C 404 478 438 420 440 330
    L 424 332 C 420 372 398 398 360 404 C 336 392 316 388 300 394 C 284 388 264 392 240 404 C 202 398 180 372 176 332 Z`;
  const tufts = Array.from({length: 5}).map((_, k) => {
    const a = Math.PI * (0.36 + 0.28 * (k / 4));
    const x = 300 - Math.cos(a) * 150, y = 336 + Math.sin(a) * 180;
    return `M ${x - 7} ${y - 6} L ${x} ${y + 9} L ${x + 7} ${y - 6}`;
  }).join(' ');

  return (
    <svg viewBox={viewBox} width={width} height={height} style={{overflow: clip ? 'hidden' : 'visible', display: 'block'}}>
      <Defs id={id} />
      {/* body / shirt */}
      <path d="M 20 900 L 34 650 Q 48 548 176 520 L 424 520 Q 552 548 566 650 L 580 900 Z" fill={`url(#${id}stripes)`} stroke={LINE} strokeWidth={6} />
      <path d="M 20 900 L 34 650 Q 48 548 176 520 L 424 520 Q 552 548 566 650 L 580 900 Z" fill={`url(#${id}shade)`} />
      <path d="M 300 610 L 300 900" stroke="#8fa9d6" strokeWidth={5} />
      {[700, 790, 880].map((y) => <circle key={y} cx={300} cy={y} r={8} fill="#eef2f8" stroke={LINE} strokeWidth={3} />)}
      <Arm s={[100, 620]} p={pl} hand="palm" flip id={id} />
      <g transform={`rotate(${tilt} 300 480)`}>
        {/* neck + open collar */}
        <path d="M 256 420 L 256 540 L 300 610 L 344 540 L 344 420 Z" fill={C.skinShadow} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 262 506 Q 300 534 338 506" stroke="#8a5536" strokeWidth={14} opacity={0.45} fill="none" />
        <path d="M 240 506 Q 300 540 360 506 L 366 526 Q 300 566 234 526 Z" fill={`url(#${id}stripes)`} stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 246 504 L 196 552 L 250 626 L 292 568 Z" fill={C.stripe} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 354 504 L 404 552 L 350 626 L 308 568 Z" fill={C.stripe} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 218 556 L 252 604 M 382 556 L 348 604" stroke={C.stripeDark} strokeWidth={3} opacity={0.6} />
        {/* ears */}
        <ellipse cx={156} cy={320} rx={27} ry={37} fill={skin} stroke={LINE} strokeWidth={6} />
        <ellipse cx={444} cy={320} rx={27} ry={37} fill={skin} stroke={LINE} strokeWidth={6} />
        <path d="M 154 304 Q 144 320 156 338" stroke="#8a5536" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M 446 304 Q 456 320 444 338" stroke="#8a5536" strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* face */}
        <path d="M 162 292 Q 164 142 300 134 Q 436 142 438 292 Q 442 430 380 470 Q 340 494 300 496 Q 260 494 220 470 Q 158 430 162 292 Z" fill={skin} stroke={LINE} strokeWidth={7} />
        {/* beard */}
        <path d="M 158 286 L 160 336 L 178 336 L 176 288 Z" fill={C.beard} />
        <path d="M 442 286 L 440 336 L 422 336 L 424 288 Z" fill={C.beard} />
        <path d={beard} fill={C.beard} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
        <path d={tufts} fill={C.beard} stroke={LINE} strokeWidth={4} strokeLinejoin="round" />
        {Array.from({length: 46}).map((_, k) => {
          const a = rnd(k) * Math.PI, rr = 0.7 + rnd(k + 50) * 0.28;
          const x = 300 - Math.cos(a) * 140 * rr, y = 338 + Math.sin(a) * 166 * rr;
          if (y < 405 || (y < 440 && Math.abs(x - 300) < 60)) return null;
          return <path key={k} d={`M ${x} ${y} l ${(rnd(k + 9) - 0.5) * 6} 13`} stroke="#3d2c25" strokeWidth={3} strokeLinecap="round" opacity={0.75} />;
        })}
        <path d="M 262 396 C 276 384 290 384 300 390 C 310 384 324 384 338 396" stroke="#3d2c25" strokeWidth={3} fill="none" opacity={0.8} />
        {/* lower lip hint + mouth */}
        {mouthEl}
        <path d={`M 286 ${MY + 22 + mouth * 30} Q 300 ${MY + 28 + mouth * 30} 314 ${MY + 22 + mouth * 30}`} stroke="#8c4b3b" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />
        {/* nose */}
        <path d="M 312 292 Q 310 330 292 354 Q 296 372 314 370 Q 328 368 332 356" stroke="#8a5536" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx={318} cy={362} rx={7} ry={4} fill="#7a4428" opacity={0.6} />
        {/* cheeks */}
        <ellipse cx={214} cy={350} rx={22} ry={11} fill="#c9604e" opacity={0.18} />
        <ellipse cx={386} cy={350} rx={22} ry={11} fill="#c9604e" opacity={0.18} />
        {/* brows (thick) */}
        <path d={`M 204 ${258 + by} Q 240 ${236 + by} 278 ${248 + by} L 276 ${264 + by} Q 240 ${256 + by} 208 ${272 + by} Z`} fill="#120c0a"
          transform={`rotate(${bl} 241 ${255 + by})`} />
        <path d={`M 322 ${248 + by} Q 360 ${236 + by} 396 ${258 + by} L 392 ${272 + by} Q 360 ${256 + by} 324 ${264 + by} Z`} fill="#120c0a"
          transform={`rotate(${br} 359 ${255 + by})`} />
        <Eye cx={243} side={-1} />
        <Eye cx={357} side={1} />
        {/* hair: wavy volume swept up and back, shorter sides */}
        <path d="M 156 302 C 146 264 144 228 154 198 C 146 150 172 110 212 96 C 222 68 256 52 288 58 C 304 36 342 32 366 50 C 396 38 436 56 450 92
                 C 488 106 504 148 488 184 C 500 216 488 258 452 302 C 446 264 436 240 418 226 C 404 202 378 194 352 200
                 C 330 188 300 190 282 204 C 258 198 232 208 220 226 C 196 234 176 252 168 274 C 162 286 158 294 156 302 Z"
          fill={`url(#${id}hair)`} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
        {['M 190 160 C 236 104 320 94 384 122 C 424 140 450 170 456 204', 'M 232 120 C 274 84 344 80 396 104',
          'M 168 206 C 186 176 214 164 244 166', 'M 420 98 C 456 98 478 122 476 150', 'M 262 92 C 286 74 316 70 340 76'].map((d, k) => (
          <path key={k} d={d} stroke={C.hairHi} strokeWidth={k === 0 ? 10 : 8} fill="none" strokeLinecap="round" opacity={0.85} />
        ))}
        <path d="M 470 130 C 494 124 506 140 500 158" stroke={C.hair} strokeWidth={9} fill="none" strokeLinecap="round" />
        {/* loose strands on the forehead */}
        <path d="M 300 200 Q 288 220 294 240" stroke={C.hair} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M 318 200 Q 316 214 326 226" stroke={C.hair} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      </g>
      <Arm s={[500, 620]} p={pr} hand={gesture === 'point' ? 'point' : gesture === 'none' ? 'fist' : 'palm'} wave={wave} id={id} />
    </svg>
  );
};
