import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type Mood = 'neutral' | 'shocked' | 'smirk' | 'worried' | 'happy';
export type Gesture = 'none' | 'point' | 'palm' | 'hands' | 'wave';

const LINE = '#1c1512', RED = '#ff3d2e', RED_D = '#c9261a';
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// brow: [raise, leftTilt, rightTilt]; lids: [upperLidDrop 0..1, lowerLidRaise 0..1]
const BROWS: Record<Mood, [number, number, number]> = {
  neutral: [0, 0, 0], shocked: [-26, -6, 6], smirk: [-2, 7, -16], worried: [-8, -14, 14], happy: [-10, -4, 4],
};
const LIDS: Record<Mood, [number, number]> = {neutral: [0.12, 0], shocked: [0, 0], smirk: [0.3, 0.1], worried: [0.18, 0], happy: [0.15, 0.42]};

type Pose = {e: [number, number]; w: [number, number]};
const REST_R: Pose = {e: [560, 760], w: [560, 980]};
const REST_L: Pose = {e: [40, 760], w: [40, 980]};
const POSES_R: Record<Exclude<Gesture, 'none'>, Pose> = {
  point: {e: [650, 600], w: [612, 430]}, palm: {e: [640, 670], w: [596, 500]},
  hands: {e: [650, 620], w: [600, 452]}, wave: {e: [660, 590], w: [676, 410]},
};
const POSE_L_HANDS: Pose = {e: [-50, 620], w: [0, 452]};

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="skin" cx="45%" cy="38%" r="70%"><stop offset="0%" stopColor="#f8dcc6" /><stop offset="70%" stopColor="#efc3a3" /><stop offset="100%" stopColor="#e2a985" /></radialGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3a3038" /><stop offset="60%" stopColor="#1b161c" /><stop offset="100%" stopColor="#0f0c10" /></linearGradient>
    <linearGradient id="hood" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34343c" /><stop offset="100%" stopColor="#18181d" /></linearGradient>
    <linearGradient id="sleeve" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2c2c33" /><stop offset="100%" stopColor="#1a1a1f" /></linearGradient>
    <linearGradient id="cup" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff6a55" /><stop offset="55%" stopColor={RED} /><stop offset="100%" stopColor={RED_D} /></linearGradient>
    <radialGradient id="iris" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#6b4a32" /><stop offset="100%" stopColor="#2a1a10" /></radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" /></filter>
  </defs>
);

const Hand: React.FC<{kind: 'point' | 'palm' | 'fist'}> = ({kind}) => (
  <g>
    {kind === 'point' && <>
      <rect x={-13} y={-140} width={30} height={100} rx={15} fill="url(#skin)" stroke={LINE} strokeWidth={5} />
      <path d="M -30 -40 Q -46 -78 -24 -96 Q -4 -104 8 -88 L 12 -44 Z" fill="url(#skin)" stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={2} cy={-38} rx={38} ry={34} fill="url(#skin)" stroke={LINE} strokeWidth={5} />
      <path d="M -14 -50 Q 0 -44 14 -50" stroke={LINE} strokeWidth={3.5} fill="none" opacity={0.5} strokeLinecap="round" />
    </>}
    {kind === 'palm' && <>
      {[-27, -9, 9, 27].map((x, k) => <rect key={k} x={x - 9} y={-116 + Math.abs(x) * 0.7} width={19} height={74} rx={9.5} fill="url(#skin)" stroke={LINE} strokeWidth={4.5} />)}
      <path d="M -40 -36 Q -70 -56 -64 -78 Q -56 -90 -40 -76 L -24 -54 Z" fill="url(#skin)" stroke={LINE} strokeWidth={4.5} strokeLinejoin="round" />
      <ellipse cx={0} cy={-40} rx={40} ry={36} fill="url(#skin)" stroke={LINE} strokeWidth={5} />
    </>}
    {kind === 'fist' && <ellipse cx={0} cy={-36} rx={38} ry={34} fill="url(#skin)" stroke={LINE} strokeWidth={5} />}
  </g>
);

const Arm: React.FC<{s: [number, number]; p: Pose; hand: 'point' | 'palm' | 'fist'; flip?: boolean; wave?: number}> = ({s, p, hand, flip, wave = 0}) => {
  const [ex, ey] = p.e, [wx, wy] = p.w;
  const ang = Math.atan2(wy - ey, wx - ex) * 180 / Math.PI + 90;
  const d = `M ${s[0]} ${s[1]} Q ${ex} ${ey} ${wx} ${wy}`;
  return (
    <g>
      <path d={d} stroke={LINE} strokeWidth={96} fill="none" strokeLinecap="round" />
      <path d={d} stroke="url(#sleeve)" strokeWidth={84} fill="none" strokeLinecap="round" />
      <g transform={`translate(${wx} ${wy}) rotate(${ang + wave}) scale(${flip ? -1 : 1} 1)`}>
        <rect x={-40} y={-16} width={80} height={30} rx={14} fill="#3a3a42" stroke={LINE} strokeWidth={5} />
        <Hand kind={hand} />
      </g>
    </g>
  );
};

export const Presenter: React.FC<{mood: Mood; prevMood: Mood; moodAt: number; gesture: Gesture; gestureFrom: number; gestureTo: number;
  mouth: number[]; x?: number; y?: number; scale?: number}> = ({mood, prevMood, moodAt, gesture, gestureFrom, gestureTo, mouth, x = 540, y = 1920, scale = 1.1}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const m = mouth[f] ?? 0;
  const mk = spring({frame: f - moodAt * fps, fps, config: {damping: 14, stiffness: 160}});
  const b0 = BROWS[prevMood], b1 = BROWS[mood], l0 = LIDS[prevMood], l1 = LIDS[mood];
  const by = lerp(b0[0], b1[0], mk), bl = lerp(b0[1], b1[1], mk), br = lerp(b0[2], b1[2], mk);
  const up = lerp(l0[0], l1[0], mk), low = lerp(l0[1], l1[1], mk);
  const bt = (t + 0.7) % 3.4;
  const blink = bt < 0.13 ? 1 - Math.abs(bt - 0.065) / 0.065 : 0;
  const wide = mood === 'shocked' ? lerp(1, 1.14, mk) : 1;
  const gin = gesture === 'none' ? 0 : spring({frame: f - gestureFrom * fps, fps, config: {damping: 13, stiffness: 150, mass: 0.8}});
  const gout = gesture === 'none' ? 0 : spring({frame: f - gestureTo * fps, fps, config: {damping: 16, stiffness: 140}});
  const g = Math.max(0, gin - gout);
  const lp = (a: Pose, b: Pose): Pose => ({e: [lerp(a.e[0], b.e[0], g), lerp(a.e[1], b.e[1], g)], w: [lerp(a.w[0], b.w[0], g), lerp(a.w[1], b.w[1], g)]});
  const pr = gesture === 'none' ? REST_R : lp(REST_R, POSES_R[gesture]);
  const pl = gesture === 'hands' ? lp(REST_L, POSE_L_HANDS) : REST_L;
  const wave = gesture === 'wave' ? Math.sin(t * 11) * 16 * g : 0;
  const breathe = Math.sin(t * 2.1) * 4;
  const tilt = Math.sin(t * 1.3) * 1.5 + (m - 0.3) * 2 + (mood === 'smirk' ? 3 * mk : 0);
  const look = Math.sin(t * 0.55) * 3;

  const Eye: React.FC<{cx: number; side: number}> = ({cx, side}) => {
    const rx = 30 * wide, ry = 34 * wide;
    const sm = mood === 'smirk' && side > 0 ? 0.25 : 0;
    const upper = Math.min(1, up + sm + blink * 1.1), lower = low;
    const top = 300 - ry + upper * ry * 2 * 0.95, bot = 300 + ry - lower * ry * 1.1;
    return (
      <g>
        <clipPath id={`eye${side}`}><ellipse cx={cx} cy={300} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={300} rx={rx} ry={ry} fill="#fff" />
        <g clipPath={`url(#eye${side})`}>
          <circle cx={cx + look} cy={304} r={mood === 'shocked' ? 13 : 17} fill="url(#iris)" />
          <circle cx={cx + look} cy={304} r={mood === 'shocked' ? 6 : 8} fill="#0d0907" />
          <circle cx={cx + look + 6} cy={296} r={5} fill="#fff" />
          <rect x={cx - rx - 2} y={300 - ry - 4} width={rx * 2 + 4} height={Math.max(0, top - (300 - ry - 4))} fill="url(#skin)" />
          <rect x={cx - rx - 2} y={bot} width={rx * 2 + 4} height={ry * 2} fill="url(#skin)" />
        </g>
        <path d={`M ${cx - rx} ${top + 2} Q ${cx} ${top - 10 + upper * 6} ${cx + rx} ${top + 2}`} stroke={LINE} strokeWidth={6} fill="none" strokeLinecap="round" />
        {lower > 0.05 && <path d={`M ${cx - rx + 4} ${bot} Q ${cx} ${bot + 6} ${cx + rx - 4} ${bot}`} stroke={LINE} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />}
      </g>
    );
  };

  const open = m;
  let mouthEl: React.ReactNode;
  if (open < 0.08) {
    const d = mood === 'smirk' ? 'M 268 404 Q 306 416 344 390' : mood === 'worried' ? 'M 270 410 Q 300 398 330 410'
      : mood === 'happy' ? 'M 256 392 Q 300 438 344 392' : 'M 268 402 Q 300 420 332 402';
    mouthEl = mood === 'shocked'
      ? <ellipse cx={300} cy={406} rx={18} ry={24} fill="#4a1a1c" stroke={LINE} strokeWidth={5} />
      : <path d={d} stroke={LINE} strokeWidth={7} fill="none" strokeLinecap="round" />;
  } else {
    const w = mood === 'shocked' ? 22 + 8 * open : mood === 'happy' ? 38 + 6 * open : 30 + 8 * open, h = 8 + 32 * open;
    const cx = mood === 'smirk' ? 308 : 300;
    mouthEl = (
      <g>
        <clipPath id="mclip"><path d={`M ${cx - w} 400 Q ${cx} ${400 - h * 0.55} ${cx + w} 400 Q ${cx + w * 0.9} ${400 + h} ${cx} ${400 + h * 1.05} Q ${cx - w * 0.9} ${400 + h} ${cx - w} 400 Z`} /></clipPath>
        <g clipPath="url(#mclip)">
          <rect x={cx - w} y={400 - h} width={w * 2} height={h * 2.2} fill="#4a1a1c" />
          {open > 0.22 && <rect x={cx - w} y={400 - h} width={w * 2} height={h * 0.55 + 4} fill="#fbf7f2" />}
          {open > 0.35 && <ellipse cx={cx} cy={400 + h * 0.95} rx={w * 0.62} ry={h * 0.5} fill="#e46d73" />}
        </g>
        <path d={`M ${cx - w} 400 Q ${cx} ${400 - h * 0.55} ${cx + w} 400 Q ${cx + w * 0.9} ${400 + h} ${cx} ${400 + h * 1.05} Q ${cx - w * 0.9} ${400 + h} ${cx - w} 400 Z`}
          fill="none" stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
      </g>
    );
  }

  return (
    <div style={{position: 'absolute', left: x - 360 * scale, top: y - 830 * scale + breathe, width: 720 * scale, height: 900 * scale}}>
      <svg viewBox="-60 0 720 900" width={720 * scale} height={900 * scale} style={{overflow: 'visible'}}>
        <Defs />
        {/* shadow on background */}
        <ellipse cx={300} cy={880} rx={330} ry={60} fill="#000" opacity={0.12} filter="url(#soft)" />
        {/* body + hood */}
        <path d="M 20 900 L 34 650 Q 48 545 175 516 L 425 516 Q 552 545 566 650 L 580 900 Z" fill="url(#hood)" stroke={LINE} strokeWidth={6} />
        <path d="M 120 900 Q 128 760 150 690" stroke="#000" strokeWidth={8} opacity={0.18} fill="none" strokeLinecap="round" />
        <path d="M 480 900 Q 472 760 450 690" stroke="#000" strokeWidth={8} opacity={0.18} fill="none" strokeLinecap="round" />
        <path d="M 172 520 Q 300 640 428 520 Q 410 584 300 606 Q 190 584 172 520 Z" fill="#2e2e36" stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 274 600 L 266 720 M 326 600 L 334 720" stroke="#efe9df" strokeWidth={9} strokeLinecap="round" />
        <rect x={258} y={716} width={16} height={26} rx={5} fill="#c9c3b8" stroke={LINE} strokeWidth={3} />
        <rect x={326} y={716} width={16} height={26} rx={5} fill="#c9c3b8" stroke={LINE} strokeWidth={3} />
        <Arm s={[100, 620]} p={pl} hand="palm" flip />
        <g transform={`rotate(${tilt} 300 480)`}>
          {/* neck */}
          <path d="M 256 410 L 256 540 Q 300 566 344 540 L 344 410 Z" fill="#e4ad8b" stroke={LINE} strokeWidth={6} />
          <path d="M 258 470 Q 300 500 342 470" stroke="#c98c6a" strokeWidth={14} opacity={0.5} fill="none" />
          {/* headphones resting on collar: band behind neck + cups */}
          <path d="M 190 520 Q 300 470 410 520" stroke="#2b2b31" strokeWidth={18} fill="none" strokeLinecap="round" />
          <g transform="rotate(-14 205 540)"><ellipse cx={205} cy={540} rx={44} ry={56} fill="url(#cup)" stroke={LINE} strokeWidth={6} />
            <ellipse cx={213} cy={540} rx={24} ry={34} fill={RED_D} opacity={0.6} /><ellipse cx={193} cy={520} rx={10} ry={16} fill="#fff" opacity={0.35} /></g>
          <g transform="rotate(14 395 540)"><ellipse cx={395} cy={540} rx={44} ry={56} fill="url(#cup)" stroke={LINE} strokeWidth={6} />
            <ellipse cx={387} cy={540} rx={24} ry={34} fill={RED_D} opacity={0.6} /><ellipse cx={383} cy={520} rx={10} ry={16} fill="#fff" opacity={0.35} /></g>
          {/* ears */}
          <ellipse cx={152} cy={318} rx={28} ry={38} fill="url(#skin)" stroke={LINE} strokeWidth={6} />
          <ellipse cx={448} cy={318} rx={28} ry={38} fill="url(#skin)" stroke={LINE} strokeWidth={6} />
          <path d="M 150 302 Q 140 318 152 336" stroke="#c98c6a" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 450 302 Q 460 318 448 336" stroke="#c98c6a" strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* face */}
          <path d="M 156 296 Q 158 138 300 130 Q 442 138 444 296 Q 448 462 300 476 Q 152 462 156 296 Z" fill="url(#skin)" stroke={LINE} strokeWidth={7} />
          <ellipse cx={212} cy={376} rx={30} ry={15} fill="#ef8f86" opacity={0.38} />
          <ellipse cx={388} cy={376} rx={30} ry={15} fill="#ef8f86" opacity={0.38} />
          {/* hair: side-swept quiff */}
          <path d="M 146 300 Q 128 176 196 126 Q 262 84 344 92 Q 430 104 458 178 Q 474 230 456 296 Q 446 250 424 226
                   Q 430 196 404 180 Q 372 214 318 206 Q 340 186 326 168 Q 286 206 222 214 Q 236 196 228 184 Q 180 214 166 250 Q 152 270 146 300 Z"
            fill="url(#hair)" stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 236 128 Q 300 104 372 120" stroke="#6b5c69" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.6} />
          <path d="M 400 140 Q 430 160 440 194" stroke="#6b5c69" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.45} />
          {/* brows (tapered) */}
          <path d={`M 206 ${258 + by} Q 240 ${242 + by} 276 ${250 + by} L 274 ${262 + by} Q 240 ${256 + by} 210 ${268 + by} Z`} fill="#1b161c"
            transform={`rotate(${bl} 241 ${255 + by})`} />
          <path d={`M 324 ${250 + by} Q 360 ${242 + by} 394 ${258 + by} L 390 ${268 + by} Q 360 ${256 + by} 326 ${262 + by} Z`} fill="#1b161c"
            transform={`rotate(${br} 359 ${255 + by})`} />
          <Eye cx={243} side={-1} />
          <Eye cx={357} side={1} />
          {/* nose */}
          <path d="M 304 318 Q 296 346 290 356 Q 300 366 316 358" stroke="#b97a58" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {mouthEl}
        </g>
        <Arm s={[500, 620]} p={pr} hand={gesture === 'point' ? 'point' : gesture === 'none' ? 'fist' : 'palm'} wave={wave} />
      </svg>
    </div>
  );
};
