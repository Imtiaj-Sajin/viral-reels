import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Mood, Gesture} from './Presenter';

/* Animated rig of the approved host (R1 "Layered"): side-part hair, defined face, light stubble,
   denim jacket over grey hoodie. Same API as Presenter so compositions can swap it in. */

const LINE = '#16110f';
const SKIN = {light: '#f2cfae', mid: '#e0ae8a', shadow: '#c48b65', deep: '#a9724f'};
const HAIR = '#17110f', HAIR_HI = '#5c4a42';
const DENIM = '#6d8bb0', DENIM_D = '#4b6688';
const FACE_D = 'M 184 290 Q 184 146 300 138 Q 416 146 416 290 L 414 352 Q 410 414 380 452 Q 348 494 300 502 Q 252 494 220 452 Q 190 414 186 352 Z';
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const BROWS: Record<Mood, [number, number, number]> = {
  neutral: [0, 0, 0], happy: [-6, -3, 3], shocked: [-20, -5, 5], smirk: [-2, 6, -12], worried: [-6, -12, 12],
};
const LIDS: Record<Mood, [number, number]> = {neutral: [0.13, 0.06], happy: [0.12, 0.32], shocked: [0.0, 0.0], smirk: [0.3, 0.08], worried: [0.12, 0.02]};

type Pose = {e: [number, number]; w: [number, number]};
const REST_R: Pose = {e: [560, 760], w: [560, 980]};
const REST_L: Pose = {e: [40, 760], w: [40, 980]};
const POSES_R: Record<Exclude<Gesture, 'none'>, Pose> = {
  point: {e: [650, 600], w: [612, 430]}, palm: {e: [640, 670], w: [596, 500]},
  hands: {e: [650, 620], w: [600, 452]}, wave: {e: [660, 590], w: [676, 410]},
};
const POSE_L_HANDS: Pose = {e: [-50, 620], w: [0, 452]};

const Defs: React.FC<{p: string}> = ({p}) => (
  <defs>
    <radialGradient id={`${p}skin`} cx="46%" cy="38%" r="72%"><stop offset="0%" stopColor={SKIN.light} /><stop offset="62%" stopColor={SKIN.mid} /><stop offset="100%" stopColor={SKIN.shadow} /></radialGradient>
    <linearGradient id={`${p}hair`} x1="0" y1="0" x2="0.6" y2="1"><stop offset="0%" stopColor="#3a2d28" /><stop offset="50%" stopColor={HAIR} /><stop offset="100%" stopColor="#0a0706" /></linearGradient>
    <linearGradient id={`${p}fade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={HAIR} stopOpacity="0.95" /><stop offset="100%" stopColor={HAIR} stopOpacity="0.15" /></linearGradient>
    <radialGradient id={`${p}iris`} cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#5b3b25" /><stop offset="100%" stopColor="#1d1109" /></radialGradient>
    <linearGradient id={`${p}cloth`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={DENIM} /><stop offset="100%" stopColor={DENIM_D} /></linearGradient>
    <linearGradient id={`${p}sleeve`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#7896bb" /><stop offset="100%" stopColor={DENIM_D} /></linearGradient>
    <linearGradient id={`${p}beard`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a1e1a" stopOpacity="0" />
      <stop offset="40%" stopColor="#2a1e1a" stopOpacity={0.32} /><stop offset="100%" stopColor="#2a1e1a" stopOpacity={0.5} /></linearGradient>
  </defs>
);

const Hand: React.FC<{kind: 'point' | 'palm' | 'fist'; p: string}> = ({kind, p}) => {
  const skin = `url(#${p}skin)`;
  return (
    <g>
      {kind === 'point' && <>
        <rect x={-13} y={-140} width={30} height={100} rx={15} fill={skin} stroke={LINE} strokeWidth={5} />
        <path d="M -30 -40 Q -46 -78 -24 -96 Q -4 -104 8 -88 L 12 -44 Z" fill={skin} stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={2} cy={-38} rx={38} ry={34} fill={skin} stroke={LINE} strokeWidth={5} />
        <path d="M -14 -50 Q 0 -44 14 -50" stroke={SKIN.deep} strokeWidth={3.5} fill="none" opacity={0.6} strokeLinecap="round" />
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

const Arm: React.FC<{s: [number, number]; pose: Pose; hand: 'point' | 'palm' | 'fist'; flip?: boolean; wave?: number; p: string}> = ({s, pose, hand, flip, wave = 0, p}) => {
  const [ex, ey] = pose.e, [wx, wy] = pose.w;
  const ang = Math.atan2(wy - ey, wx - ex) * 180 / Math.PI + 90;
  const d = `M ${s[0]} ${s[1]} Q ${ex} ${ey} ${wx} ${wy}`;
  return (
    <g>
      <path d={d} stroke={LINE} strokeWidth={98} fill="none" strokeLinecap="round" />
      <path d={d} stroke={`url(#${p}sleeve)`} strokeWidth={86} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#f0d7a0" strokeWidth={2.5} strokeDasharray="8 7" fill="none" opacity={0.55} transform="translate(-18 4)" />
      <g transform={`translate(${wx} ${wy}) rotate(${ang + wave}) scale(${flip ? -1 : 1} 1)`}>
        <rect x={-44} y={-18} width={88} height={34} rx={10} fill="#5a7aa3" stroke={LINE} strokeWidth={5} />
        <rect x={-30} y={-26} width={60} height={14} rx={6} fill="#a1a4ab" stroke={LINE} strokeWidth={3.5} />
        <Hand kind={hand} p={p} />
      </g>
    </g>
  );
};

export const HostR1: React.FC<{mood: Mood; prevMood: Mood; moodAt: number; gesture: Gesture; gestureFrom: number; gestureTo: number;
  mouth: number[]; x?: number; y?: number; scale?: number; id?: string}> =
  ({mood, prevMood, moodAt, gesture, gestureFrom, gestureTo, mouth, x = 540, y = 1920, scale = 1.0, id = 'hr1'}) => {
    const f = useCurrentFrame();
    const {fps} = useVideoConfig();
    const t = f / fps;
    const p = id;
    const m = mouth[f] ?? 0;
    const mk = spring({frame: f - moodAt * fps, fps, config: {damping: 14, stiffness: 160}});
    const b0 = BROWS[prevMood], b1 = BROWS[mood], l0 = LIDS[prevMood], l1 = LIDS[mood];
    const by = lerp(b0[0], b1[0], mk), bl = lerp(b0[1], b1[1], mk), br = lerp(b0[2], b1[2], mk);
    const up = lerp(l0[0], l1[0], mk), low = lerp(l0[1], l1[1], mk);
    const bt = (t + 0.9) % 3.6;
    const blink = bt < 0.13 ? 1 - Math.abs(bt - 0.065) / 0.065 : 0;
    const wide = mood === 'shocked' ? lerp(1, 1.16, mk) : 1;
    const gin = gesture === 'none' ? 0 : spring({frame: f - gestureFrom * fps, fps, config: {damping: 13, stiffness: 150, mass: 0.8}});
    const gout = gesture === 'none' ? 0 : spring({frame: f - gestureTo * fps, fps, config: {damping: 16, stiffness: 140}});
    const g = Math.max(0, gin - gout);
    const lp = (a: Pose, b: Pose): Pose => ({e: [lerp(a.e[0], b.e[0], g), lerp(a.e[1], b.e[1], g)], w: [lerp(a.w[0], b.w[0], g), lerp(a.w[1], b.w[1], g)]});
    const pr = gesture === 'none' ? REST_R : lp(REST_R, POSES_R[gesture]);
    const pl = gesture === 'hands' ? lp(REST_L, POSE_L_HANDS) : REST_L;
    const wave = gesture === 'wave' ? Math.sin(t * 11) * 16 * g : 0;
    const breathe = Math.sin(t * 2.1) * 4;
    const tilt = Math.sin(t * 1.3) * 1.4 + (m - 0.3) * 2 + (mood === 'smirk' ? 3 * mk : 0);
    const look = Math.sin(t * 0.55) * 3 + (gesture === 'point' ? 4 * g : 0);
    const skin = `url(#${p}skin)`;

    const Eye: React.FC<{cx: number; side: number}> = ({cx, side}) => {
      const cy = 300, rx = 26 * wide, ry = 21 * wide;
      const extra = mood === 'smirk' && side > 0 ? 0.1 * mk : 0;
      const top = cy - ry + Math.min(1, up + extra + blink * 1.05) * ry * 2;
      const bot = cy + ry - low * ry * 1.1;
      return (
        <g>
          <clipPath id={`${p}e${side}`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fbf8f3" />
          <g clipPath={`url(#${p}e${side})`}>
            <circle cx={cx + 2 + look} cy={cy + 3} r={mood === 'shocked' ? 12 : 14} fill={`url(#${p}iris)`} />
            <circle cx={cx + 2 + look} cy={cy + 3} r={mood === 'shocked' ? 5.5 : 6.5} fill="#0a0605" />
            <circle cx={cx + 7 + look} cy={cy - 2} r={4} fill="#fff" />
            <rect x={cx - rx - 2} y={cy - ry - 4} width={rx * 2 + 4} height={Math.max(0, top - (cy - ry - 4))} fill={skin} />
            <rect x={cx - rx - 2} y={bot} width={rx * 2 + 4} height={ry * 2} fill={skin} />
          </g>
          <path d={`M ${cx - rx - 3} ${top + 4} Q ${cx} ${top - 8} ${cx + rx + 3} ${top + 4}`} stroke={LINE} strokeWidth={6.5} fill="none" strokeLinecap="round" />
          <path d={`M ${cx - rx + 6} ${bot + 2} Q ${cx} ${bot + 7} ${cx + rx - 6} ${bot + 2}`} stroke={SKIN.deep} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
      );
    };
    const brow = (left: boolean) => {
      const th = 14;
      return left
        ? `M 208 ${268 + by} Q 244 ${252 + by} 280 ${260 + by} L 279 ${260 + th + by} Q 244 ${254 + th + by} 210 ${268 + th + by} Z`
        : `M 320 ${260 + by} Q 356 ${252 + by} 392 ${268 + by} L 390 ${268 + th + by} Q 356 ${254 + th + by} 321 ${260 + th + by} Z`;
    };

    // mouth
    const MY = 412;
    let mouthEl: React.ReactNode;
    if (m < 0.08) {
      const d = mood === 'happy' ? `M 264 ${MY - 6} Q 300 ${MY + 24} 336 ${MY - 6}` : mood === 'smirk' ? `M 274 ${MY + 4} Q 304 ${MY + 12} 334 ${MY - 8}`
        : mood === 'worried' ? `M 274 ${MY + 8} Q 300 ${MY - 4} 326 ${MY + 8}` : `M 270 ${MY - 2} Q 300 ${MY + 16} 330 ${MY - 2}`;
      mouthEl = mood === 'shocked'
        ? <ellipse cx={300} cy={MY + 4} rx={15} ry={20} fill="#4a1a1c" stroke={LINE} strokeWidth={5} />
        : <><path d={d} stroke="#8a4a3a" strokeWidth={10} fill="none" strokeLinecap="round" /><path d={d} stroke={LINE} strokeWidth={5} fill="none" strokeLinecap="round" />
          {mood === 'happy' && <path d={`M 274 ${MY} Q 300 ${MY + 16} 326 ${MY - 1} Q 312 ${MY + 7} 300 ${MY + 7} Q 288 ${MY + 7} 274 ${MY} Z`} fill="#fbf7f2" />}</>;
    } else {
      const w = mood === 'shocked' ? 18 + 8 * m : mood === 'happy' ? 34 + 6 * m : 26 + 8 * m, h = 6 + 28 * m;
      const cx = mood === 'smirk' ? 306 : 300;
      const shape = `M ${cx - w} ${MY} Q ${cx} ${MY - h * 0.5} ${cx + w} ${MY} Q ${cx + w * 0.9} ${MY + h} ${cx} ${MY + h * 1.05} Q ${cx - w * 0.9} ${MY + h} ${cx - w} ${MY} Z`;
      mouthEl = (
        <g>
          <clipPath id={`${p}mc`}><path d={shape} /></clipPath>
          <g clipPath={`url(#${p}mc)`}>
            <rect x={cx - w} y={MY - h} width={w * 2} height={h * 2.2} fill="#4a1a1c" />
            {m > 0.22 && <rect x={cx - w} y={MY - h} width={w * 2} height={h * 0.5 + 4} fill="#fbf7f2" />}
            {m > 0.35 && <ellipse cx={cx} cy={MY + h * 0.95} rx={w * 0.62} ry={h * 0.5} fill="#d9646b" />}
          </g>
          <path d={shape} fill="none" stroke="#8a4a3a" strokeWidth={5} strokeLinejoin="round" />
          <path d={shape} fill="none" stroke={LINE} strokeWidth={4} strokeLinejoin="round" />
        </g>
      );
    }

    return (
      <div style={{position: 'absolute', left: x - 360 * scale, top: y - 830 * scale + breathe, width: 720 * scale, height: 900 * scale}}>
        <svg viewBox="-60 0 720 900" width={720 * scale} height={900 * scale} style={{overflow: 'visible'}}>
          <Defs p={p} />
          {/* body: denim jacket over grey hoodie */}
          <path d="M 20 900 L 34 650 Q 48 548 176 520 L 424 520 Q 552 548 566 650 L 580 900 Z" fill={`url(#${p}cloth)`} stroke={LINE} strokeWidth={6} />
          <path d="M 180 534 C 190 474 238 456 300 460 C 362 456 410 474 420 534 C 380 566 220 566 180 534 Z" fill="#8d9097" stroke={LINE} strokeWidth={6} />
          <path d="M 120 900 Q 128 770 150 700 M 480 900 Q 472 770 450 700" stroke="#000" strokeWidth={7} opacity={0.14} fill="none" strokeLinecap="round" />
          <Arm s={[100, 620]} pose={pl} hand="palm" flip p={p} />
          <g transform={`rotate(${tilt} 300 480)`}>
            <path d="M 262 430 L 262 540 Q 300 562 338 540 L 338 430 Z" fill={SKIN.shadow} stroke={LINE} strokeWidth={6} />
            <path d="M 266 500 Q 300 528 334 500" stroke={SKIN.deep} strokeWidth={14} opacity={0.4} fill="none" />
          </g>
          {/* hoodie front + jacket collar */}
          <path d="M 276 560 L 270 700 M 324 560 L 330 700" stroke="#ece6da" strokeWidth={7} strokeLinecap="round" />
          <path d="M 214 528 Q 300 600 386 528 Q 380 576 300 596 Q 220 576 214 528 Z" fill="#a1a4ab" stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 210 520 L 170 600 L 236 660 L 262 600 Z" fill={DENIM} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 390 520 L 430 600 L 364 660 L 338 600 Z" fill={DENIM} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 250 640 L 240 900 M 350 640 L 360 900" stroke={LINE} strokeWidth={5} />
          <path d="M 136 700 L 236 700 M 364 700 L 464 700" stroke="#f0d7a0" strokeWidth={3} strokeDasharray="8 6" />
          {/* head */}
          <g transform={`rotate(${tilt} 300 480)`}>
            <ellipse cx={186} cy={322} rx={24} ry={34} fill={skin} stroke={LINE} strokeWidth={6} />
            <ellipse cx={414} cy={322} rx={24} ry={34} fill={skin} stroke={LINE} strokeWidth={6} />
            <path d="M 184 306 Q 176 322 186 338 M 416 306 Q 424 322 414 338" stroke={SKIN.deep} strokeWidth={5} fill="none" strokeLinecap="round" />
            <path d={FACE_D} fill={skin} stroke={LINE} strokeWidth={7} />
            <clipPath id={`${p}fc`}><path d={FACE_D} /></clipPath>
            <g clipPath={`url(#${p}fc)`}>
              <path d="M 178 320 Q 180 420 224 460 Q 262 490 300 492 Q 338 490 376 460 Q 420 420 422 320 Q 410 388 378 420 Q 342 446 300 448 Q 258 446 222 420 Q 190 388 178 320 Z" fill={`url(#${p}beard)`} />
              <path d="M 266 398 Q 300 388 334 398" stroke="#2a1e1a" strokeWidth={9} opacity={0.25} fill="none" strokeLinecap="round" />
            </g>
            {mouthEl}
            <path d="M 306 300 Q 308 334 292 352 Q 298 366 314 364 Q 326 362 328 352" stroke={SKIN.deep} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx={220} cy={356} rx={24} ry={12} fill="#de7d6c" opacity={mood === 'happy' ? 0.32 : 0.24} />
            <ellipse cx={380} cy={356} rx={24} ry={12} fill="#de7d6c" opacity={mood === 'happy' ? 0.32 : 0.24} />
            <path d={brow(true)} fill="#140e0b" transform={`rotate(${bl} 244 ${262 + by})`} />
            <path d={brow(false)} fill="#140e0b" transform={`rotate(${br} 356 ${262 + by})`} />
            <Eye cx={246} side={-1} />
            <Eye cx={354} side={1} />
            {/* hair: side part */}
            <path d="M 172 258 L 168 304 C 170 312 178 314 184 304 L 192 256 Z" fill={`url(#${p}fade)`} />
            <path d="M 428 258 L 432 304 C 430 312 422 314 416 304 L 408 256 Z" fill={`url(#${p}fade)`} />
            <path d={`M 172 272 C 160 220 172 164 210 132 C 244 104 298 90 348 94 C 404 98 446 130 454 184 C 460 220 452 252 432 272
              C 426 246 414 230 396 222 C 360 206 300 202 262 212 C 248 196 246 172 256 150 C 240 170 234 196 238 216
              C 218 226 202 238 192 252 C 186 260 178 268 172 272 Z`} fill={`url(#${p}hair)`} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
            {['M 262 150 C 316 116 392 118 440 170', 'M 266 182 C 324 150 398 156 446 206', 'M 300 104 C 350 96 404 110 434 140', 'M 210 160 C 220 140 236 126 254 118', 'M 214 214 C 214 190 222 170 236 156']
              .map((d, k) => <path key={k} d={d} stroke={HAIR_HI} strokeWidth={k === 0 ? 7 : 5} fill="none" strokeLinecap="round" opacity={0.75} />)}
          </g>
          <Arm s={[500, 620]} pose={pr} hand={gesture === 'point' ? 'point' : gesture === 'none' ? 'fist' : 'palm'} wave={wave} p={p} />
        </svg>
      </div>
    );
  };
