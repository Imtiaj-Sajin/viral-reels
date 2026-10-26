import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INTER, SERIF, MONO} from './Explainer';

/* Bitmoji-style avatar (original art): big head, thick black outline, flat colours,
   almond eyes with shine, chunky hair locks with grey highlights. */

const OL = '#141414';
const SK = {base: '#efbd95', shade: '#dea47c', line: '#8a5038', lip: '#d98b78', neck: '#e0a880'};
const HC = {base: '#1d1d21', lock: '#0f0f11', hi1: '#55555c', hi2: '#7e7e86'};

type Pt = [number, number, number?];
type HairDef = {outer: Pt[]; hl: [number, number, number, number, number][]; lines?: [number, number, number, number][]; extra?: string};

/* closed path through points; k>0 makes concave scallops (pointed tips), k<0 rounded bulges */
const lockPath = (pts: Pt[]) => {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1], b = pts[i % pts.length];
    const k = (i < pts.length ? b[2] : 0.02) ?? 0.0;
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len; // inward normal for clockwise (screen) order
    const cx = (a[0] + b[0]) / 2 + nx * k * len, cy = (a[1] + b[1]) / 2 + ny * k * len;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0]} ${b[1]}`;
  }
  return d + ' Z';
};
const leaf = (ax: number, ay: number, bx: number, by: number, w: number) => {
  const mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l, ny = dx / l;
  return `M ${ax} ${ay} Q ${mx + nx * w} ${my + ny * w} ${bx} ${by} Q ${mx - nx * w * 0.35} ${my - ny * w * 0.35} ${ax} ${ay} Z`;
};

const HAIRS: Record<string, HairDef> = {
  quiff: { // pushed up & back to one side, short sides (closest to the mirror photo)
    outer: [[186, 330], [170, 262, -0.04], [174, 198, -0.08], [202, 142, -0.12], [252, 102, -0.1], [318, 76, -0.08], [392, 58, 0.06], [442, 78, -0.14],
      [468, 126, -0.12], [458, 192, -0.08], [446, 238, -0.04], [440, 328, -0.02], [426, 324, 0], [422, 250, 0.04], [400, 216, 0.1], [350, 208, -0.12],
      [300, 212, -0.06], [256, 224, -0.08], [220, 240, -0.06], [198, 264, 0.04], [196, 328, 0.02]],
    hl: [[232, 194, 330, 104, 10], [282, 202, 392, 84, 10], [352, 198, 442, 108, 8], [404, 208, 458, 164, 6], [206, 230, 230, 160, 6]],
    lines: [[260, 222, 316, 120], [318, 210, 380, 100], [378, 212, 430, 120]],
    extra: 'M 318 214 C 306 236 308 254 320 266',
  },
  fringe: { // swept fringe with pointed tips over the forehead
    outer: [[180, 330], [162, 262, -0.06], [166, 196, -0.1], [198, 134, -0.12], [258, 94, -0.1], [328, 80, -0.08], [396, 94, -0.1], [442, 138, -0.12],
      [454, 212, -0.08], [442, 324, -0.05], [428, 322, 0], [424, 252, 0.02], [398, 222, 0.1], [354, 240, 0.28], [334, 212, 0.1], [286, 254, 0.28],
      [270, 222, 0.1], [224, 274, 0.28], [212, 242, 0.1], [192, 270, 0.2], [188, 330, 0.02]],
    hl: [[414, 122, 304, 150, 11], [384, 104, 250, 152, 10], [334, 98, 222, 184, 8], [444, 172, 362, 192, 7], [300, 134, 252, 212, 6]],
    lines: [[354, 240, 396, 160], [286, 254, 338, 150], [224, 274, 272, 168]],
  },
  spiky: { // textured spikes pointing up/right
    outer: [[184, 330], [166, 262, -0.05], [170, 198, -0.06], [180, 150, 0.08], [206, 110, 0.1], [228, 128, 0.12], [250, 70, 0.1], [276, 94, 0.12],
      [304, 50, 0.1], [330, 82, 0.12], [366, 46, 0.1], [384, 86, 0.12], [424, 64, 0.1], [430, 106, 0.12], [468, 106, 0.1], [452, 148, 0.12],
      [476, 172, 0.1], [454, 208, 0.06], [446, 324, -0.04], [430, 322, 0], [426, 248, 0.02], [396, 216, 0.12], [364, 228, 0.18], [338, 208, 0.08],
      [300, 224, 0.18], [272, 206, 0.08], [240, 228, 0.18], [214, 216, 0.08], [194, 246, 0.15], [192, 330, 0.02]],
    hl: [[242, 192, 250, 104, 8], [292, 182, 304, 82, 9], [342, 172, 364, 82, 9], [392, 172, 420, 96, 8], [422, 194, 460, 132, 7], [212, 212, 208, 144, 6]],
    lines: [[270, 206, 276, 120], [334, 206, 334, 110], [388, 210, 400, 120]],
  },
  wavy: { // voluminous, wavy locks falling forward
    outer: [[182, 342], [150, 280, -0.12], [148, 208, -0.15], [172, 146, -0.22], [226, 98, -0.22], [296, 80, -0.22], [368, 88, -0.22], [428, 124, -0.22],
      [460, 186, -0.18], [460, 264, -0.12], [444, 342, -0.06], [430, 334, 0], [428, 262, 0.04], [408, 226, 0.12], [384, 272, 0.3], [362, 228, 0.1],
      [330, 264, 0.3], [308, 222, 0.1], [270, 256, 0.3], [252, 224, 0.1], [218, 254, 0.28], [200, 236, 0.08], [186, 272, 0.12], [188, 342, 0.02]],
    hl: [[196, 176, 282, 118, 10], [300, 110, 384, 122, 10], [384, 150, 444, 206, 8], [232, 212, 286, 174, 6], [332, 204, 384, 184, 6], [166, 222, 176, 286, 5]],
    lines: [[270, 256, 300, 160], [330, 264, 360, 170], [218, 254, 240, 170], [384, 272, 410, 190]],
  },
  fringeTall: { // swept fringe with more height on top
    outer: [[180, 330], [162, 262, -0.06], [164, 190, -0.1], [190, 120, -0.12], [246, 74, -0.1], [322, 56, -0.08], [396, 70, -0.1], [446, 118, -0.12],
      [458, 200, -0.08], [442, 324, -0.05], [428, 322, 0], [424, 252, 0.02], [398, 222, 0.1], [354, 240, 0.28], [334, 212, 0.1], [286, 254, 0.28],
      [270, 222, 0.1], [224, 274, 0.28], [212, 242, 0.1], [192, 270, 0.2], [188, 330, 0.02]],
    hl: [[418, 104, 300, 136, 12], [386, 82, 246, 140, 10], [334, 74, 214, 178, 9], [448, 160, 362, 186, 7], [300, 120, 252, 210, 6]],
    lines: [[354, 240, 400, 150], [286, 254, 340, 136], [224, 274, 274, 158]],
  },
  quiffTall: { // front lifts on the left, sweeps back to the right (user's sketch)
    outer: [[186, 330], [170, 262, -0.04], [172, 196, -0.08], [178, 146, -0.08], [196, 100, -0.1], [214, 80, 0.12], [238, 60, -0.1], [300, 54, -0.06],
      [372, 64, -0.08], [428, 82, -0.1], [464, 122, -0.12], [466, 186, -0.08], [448, 238, -0.04], [440, 328, -0.02], [426, 324, 0], [422, 250, 0.04],
      [400, 218, 0.1], [352, 208, -0.12], [300, 212, -0.06], [256, 224, -0.08], [220, 240, -0.06], [198, 264, 0.04], [196, 328, 0.02]],
    hl: [[208, 200, 236, 98, 9], [240, 210, 328, 72, 11], [292, 206, 400, 80, 10], [352, 204, 440, 112, 8], [404, 212, 462, 160, 6]],
    lines: [[242, 222, 296, 100], [302, 212, 370, 86], [366, 212, 432, 112]],
  },
  neat: { // tidy side part, rounded top
    outer: [[186, 326], [166, 262, -0.05], [168, 196, -0.1], [200, 140, -0.14], [262, 104, -0.12], [340, 98, -0.12], [408, 118, -0.12], [446, 166, -0.12],
      [452, 232, -0.06], [440, 326, -0.04], [426, 322, 0], [424, 254, 0.03], [400, 222, 0.05], [330, 210, -0.12], [262, 222, -0.08], [214, 240, -0.05],
      [198, 268, 0.03], [198, 326, 0.02]],
    hl: [[262, 150, 420, 172, 11], [264, 186, 412, 212, 8], [250, 150, 200, 194, 7], [300, 118, 400, 132, 6]],
    lines: [[246, 210, 240, 116]],
  },
  curtain: { // middle part, falling to both sides
    outer: [[180, 352], [154, 286, -0.1], [154, 210, -0.14], [180, 148, -0.18], [236, 108, -0.16], [300, 96, -0.14], [364, 108, -0.16], [420, 148, -0.18],
      [446, 210, -0.14], [446, 286, -0.1], [420, 352, -0.06], [418, 346, 0], [420, 280, 0.03], [404, 234, 0.06], [360, 210, -0.08], [318, 204, -0.05],
      [300, 228, 0.15], [282, 204, 0.15], [240, 210, -0.05], [196, 234, -0.08], [180, 280, 0.06], [182, 352, 0.03]],
    hl: [[304, 120, 422, 202, 10], [296, 120, 178, 202, 10], [332, 152, 404, 232, 6], [268, 152, 196, 232, 6]],
    lines: [[300, 104, 300, 226]],
  },
};

export type ToonLook = {
  id: string; hair: keyof typeof HAIRS; fh: 'clean' | 'stubble' | 'soft'; mood: 'smile' | 'grin' | 'gentle' | 'smirk';
  outfit: 'tee' | 'hoodie' | 'flannel' | 'sweater' | 'denim' | 'overshirt' | 'oxford'; c1: string; c2: string; c3?: string; glasses?: boolean; gc?: string; jaw?: 'narrow';
};

const Eye: React.FC<{cx: number; cy: number; side: number; mood: ToonLook['mood']; p: string}> = ({cx, cy, side, mood, p}) => {
  const squint = mood === 'grin' ? 6 : mood === 'gentle' ? 3 : 0;
  const almond = `M ${cx - 40} ${cy + 4} C ${cx - 27} ${cy - 31 + squint} ${cx + 27} ${cy - 33 + squint} ${cx + 40} ${cy - 2} C ${cx + 28} ${cy + 25 - squint} ${cx - 28} ${cy + 27 - squint} ${cx - 40} ${cy + 4} Z`;
  const ox = side < 0 ? cx - 42 : cx + 42;
  return (
    <g>
      <clipPath id={`${p}eye${side}`}><path d={almond} /></clipPath>
      <path d={`M ${cx - 28} ${cy - 37} Q ${cx} ${cy - 50} ${cx + 28} ${cy - 39}`} stroke={SK.shade} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={almond} fill="#ffffff" />
      <g clipPath={`url(#${p}eye${side})`}>
        <circle cx={cx + 2} cy={cy + 1} r={22} fill="#6e4126" />
        <circle cx={cx + 2} cy={cy + 1} r={22} fill="none" stroke="#3a2114" strokeWidth={3} />
        <circle cx={cx + 2} cy={cy + 1} r={10} fill="#111" />
        <circle cx={cx + 10} cy={cy - 7} r={7} fill="#fff" />
        <circle cx={cx - 4} cy={cy + 8} r={2.5} fill="#fff" opacity={0.8} />
      </g>
      <path d={`M ${cx - 42} ${cy + 5} C ${cx - 27} ${cy - 32 + squint} ${cx + 27} ${cy - 34 + squint} ${cx + 42} ${cy - 3}`} stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={`M ${ox} ${side < 0 ? cy + 3 : cy - 3} l ${side * 8} -5`} stroke={OL} strokeWidth={5} strokeLinecap="round" />
      <path d={`M ${cx + side * 10} ${cy + 24 - squint} Q ${cx + side * 28} ${cy + 20 - squint} ${cx + side * 38} ${cy + 6}`} stroke={OL} strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.6} />
    </g>
  );
};

const Brow: React.FC<{side: number; lift?: number}> = ({side, lift = 0}) => {
  const m = (x: number) => (side < 0 ? x : 600 - x);
  const y = (v: number) => v - lift;
  return <path d={`M ${m(272)} ${y(286)} L ${m(272)} ${y(271)} Q ${m(236)} ${y(248)} ${m(198)} ${y(264)} Q ${m(188)} ${y(270)} ${m(182)} ${y(282)} Q ${m(212)} ${y(270)} ${m(240)} ${y(274)} Q ${m(260)} ${y(278)} ${m(272)} ${y(286)} Z`}
    fill="#22160f" />;
};

const Mouth: React.FC<{mood: ToonLook['mood']}> = ({mood}) => {
  if (mood === 'grin') return (
    <g>
      <path d="M 252 448 Q 300 500 348 448 Q 300 466 252 448 Z" fill="#5a1f1c" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 262 454 Q 300 468 338 454 L 334 464 Q 300 474 266 464 Z" fill="#fff" />
      <path d="M 280 482 Q 300 488 320 482" stroke={SK.lip} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
  const d = mood === 'smirk' ? 'M 262 458 Q 304 472 346 446' : mood === 'gentle' ? 'M 266 454 Q 300 472 334 454' : 'M 256 450 Q 300 480 344 450';
  return (
    <g>
      <path d={d} stroke={OL} strokeWidth={5.5} fill="none" strokeLinecap="round" />
      <path d={mood === 'smirk' ? 'M 288 474 Q 304 480 320 472' : 'M 284 472 Q 300 480 316 472'} stroke={SK.lip} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
};

const Hair: React.FC<{h: HairDef; p: string}> = ({h, p}) => (
  <g>
    <path d={lockPath(h.outer)} fill={HC.base} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    {h.lines?.map(([a, b, c, d], k) => <path key={k} d={`M ${a} ${b} Q ${(a + c) / 2 + 10} ${(b + d) / 2} ${c} ${d}`} stroke={HC.lock} strokeWidth={4} fill="none" strokeLinecap="round" />)}
    {h.hl.map(([a, b, c, d, w], k) => <path key={k} d={leaf(a, b, c, d, w)} fill={k % 2 ? HC.hi1 : HC.hi2} opacity={k % 2 ? 0.95 : 0.9} />)}
    {h.extra && <><path d={h.extra} stroke={OL} strokeWidth={12} fill="none" strokeLinecap="round" /><path d={h.extra} stroke={HC.base} strokeWidth={6} fill="none" strokeLinecap="round" /></>}
  </g>
);

const Outfit: React.FC<{L: ToonLook; p: string; under?: boolean}> = ({L, p, under}) => {
  const torso = 'M 104 780 C 106 690 138 632 206 608 C 238 598 264 592 300 592 C 336 592 362 598 394 608 C 462 632 494 690 496 780 Z';
  if (under) {
    if (L.outfit === 'hoodie') return <path d="M 200 618 C 204 566 246 548 300 548 C 354 548 396 566 400 618 C 360 640 240 640 200 618 Z" fill={L.c2} stroke={OL} strokeWidth={6} />;
    return null;
  }
  const fill = L.outfit === 'flannel' ? `url(#${p}plaid)` : L.c1;
  return (
    <g>
      <path d={torso} fill={fill} stroke={OL} strokeWidth={6} />
      {L.outfit === 'tee' && <path d="M 250 594 Q 300 640 350 594" fill="none" stroke={L.c2} strokeWidth={10} />}
      {L.outfit === 'tee' && <path d="M 246 594 Q 300 646 354 594" fill="none" stroke={OL} strokeWidth={4} />}
      {L.outfit === 'oxford' && <>
        <path d="M 246 594 L 300 676 L 354 594 Q 300 610 246 594 Z" fill="#f2f6fb" stroke={OL} strokeWidth={4} />
        <path d="M 236 600 L 300 700 L 364 600" fill="none" stroke={L.c2} strokeWidth={14} />
        <path d="M 236 600 L 300 700 L 364 600" fill="none" stroke={OL} strokeWidth={4} />
        <path d="M 254 584 L 222 622 L 270 660 L 294 626 Z" fill="#f2f6fb" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 346 584 L 378 622 L 330 660 L 306 626 Z" fill="#f2f6fb" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      </>}
      {L.outfit === 'sweater' && <><path d="M 244 596 Q 300 652 356 596 L 362 616 Q 300 676 238 616 Z" fill={L.c2} stroke={OL} strokeWidth={5} />
        {[256, 272, 288, 300, 312, 328, 344].map((x) => <path key={x} d={`M ${x} ${606 + Math.abs(x - 300) * -0.4 + 20} l 0 16`} stroke="#000" strokeWidth={2} opacity={0.18} />)}</>}
      {L.outfit === 'hoodie' && <>
        <path d="M 252 600 L 266 780 L 334 780 L 348 600 Q 300 630 252 600 Z" fill={L.c3} stroke={OL} strokeWidth={5} />
        <path d="M 250 600 L 258 780 M 350 600 L 342 780" stroke={OL} strokeWidth={6} />
        <path d="M 214 612 Q 300 676 386 612 Q 378 650 300 664 Q 222 650 214 612 Z" fill={L.c2} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 274 664 L 270 742 M 326 664 L 330 742" stroke="#e8e2d6" strokeWidth={6} strokeLinecap="round" />
      </>}
      {(L.outfit === 'flannel' || L.outfit === 'denim' || L.outfit === 'overshirt') && <>
        <path d="M 250 598 L 278 780 L 322 780 L 350 598 Q 300 626 250 598 Z" fill={L.c3} stroke={OL} strokeWidth={5} />
        <path d="M 246 594 L 206 632 L 250 690 L 278 640 Z" fill={L.outfit === 'flannel' ? `url(#${p}plaid)` : L.c2} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 354 594 L 394 632 L 350 690 L 322 640 Z" fill={L.outfit === 'flannel' ? `url(#${p}plaid)` : L.c2} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 278 640 L 268 780 M 322 640 L 332 780" stroke={OL} strokeWidth={5} />
        {L.outfit === 'denim' && <path d="M 150 700 L 248 700 M 352 700 L 450 700" stroke="#e9cf94" strokeWidth={3} strokeDasharray="8 6" />}
        {L.outfit === 'overshirt' && <><rect x={178} y={680} width={56} height={44} rx={6} fill="none" stroke={OL} strokeWidth={4} opacity={0.6} /><rect x={366} y={680} width={56} height={44} rx={6} fill="none" stroke={OL} strokeWidth={4} opacity={0.6} /></>}
      </>}
    </g>
  );
};

export const ToonAvatar: React.FC<{L: ToonLook; width: number; height: number; viewBox?: string}> = ({L, width, height, viewBox = '80 40 440 640'}) => {
  const p = L.id;
  const H = HAIRS[L.hair];
  return (
    <svg viewBox={viewBox} width={width} height={height} style={{display: 'block', overflow: 'hidden'}}>
      <defs>
        <pattern id={`${p}plaid`} width="56" height="56" patternUnits="userSpaceOnUse">
          <rect width="56" height="56" fill={L.c1} /><rect width="56" height="20" y="18" fill={L.c2} opacity="0.85" /><rect width="20" height="56" x="18" fill={L.c2} opacity="0.65" />
          <rect width="56" height="3" y="27" fill="#111" opacity="0.6" /><rect width="3" height="56" x="27" fill="#111" opacity="0.6" />
          <rect width="56" height="2" y="6" fill="#fff" opacity="0.5" /><rect width="2" height="56" x="6" fill="#fff" opacity="0.5" />
        </pattern>
      </defs>
      <g transform="translate(0 -48)"><Outfit L={L} p={p} under /></g>
      {/* neck */}
      <path d="M 264 470 L 262 556 Q 300 574 338 556 L 336 470 Z" fill={SK.neck} stroke={OL} strokeWidth={6} />
      <path d="M 262 500 Q 300 540 338 500 L 338 470 L 262 470 Z" fill={SK.shade} opacity={0.8} />
      <g transform="translate(0 -48)"><Outfit L={L} p={p} /></g>
      {/* ears */}
      {[-1, 1].map((s) => {
        const m = (x: number) => (s < 0 ? x : 600 - x);
        return <g key={s}>
          <path d={`M ${m(176)} ${318} C ${m(140)} ${300} ${m(124)} ${344} ${m(140)} ${376} C ${m(150)} ${396} ${m(168)} ${402} ${m(180)} ${390}`} fill={SK.base} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${m(166)} ${334} C ${m(150)} ${336} ${m(148)} ${362} ${m(162)} ${374}`} stroke={SK.line} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>;
      })}
      {/* face */}
      <path d={L.jaw === 'narrow'
        ? 'M 176 300 C 174 214 216 158 300 156 C 384 158 426 214 424 300 C 424 370 408 424 374 464 C 348 494 322 506 300 506 C 278 506 252 494 226 464 C 192 424 176 370 176 300 Z'
        : 'M 172 300 C 170 214 214 158 300 156 C 386 158 430 214 428 300 C 428 382 406 440 366 476 C 342 496 320 502 300 502 C 280 502 258 496 234 476 C 194 440 172 382 172 300 Z'}
        fill={SK.base} stroke={OL} strokeWidth={6.5} />
      {/* facial hair */}
      {L.fh !== 'clean' && <>
        <path d="M 180 356 C 186 428 228 490 300 502 C 372 490 414 428 420 356 C 412 404 390 438 362 448 C 346 434 326 428 300 430 C 274 428 254 434 238 448 C 210 438 188 404 180 356 Z"
          fill="#3a302c" opacity={L.fh === 'soft' ? 0.55 : 0.22} />
        <path d="M 254 438 C 270 424 290 428 300 432 C 310 428 330 424 346 438 C 330 444 314 444 300 441 C 286 444 270 444 254 438 Z" fill="#3a2a22" opacity={L.fh === 'soft' ? 0.75 : 0.42} />
        {L.fh === 'soft' && <path d="M 262 484 Q 300 500 338 484 Q 330 472 300 474 Q 270 472 262 484 Z" fill="#2a221f" opacity={0.55} />}
      </>}
      {/* nose */}
      <path d="M 290 344 Q 292 380 278 402" stroke={SK.line} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M 272 404 Q 278 418 300 418 Q 322 418 328 404" stroke={SK.line} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M 284 408 q 6 4 10 0 M 306 408 q 4 4 10 0" stroke={SK.line} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
      <Mouth mood={L.mood} />
      <ellipse cx={212} cy={404} rx={22} ry={11} fill="#e8846f" opacity={0.16} />
      <ellipse cx={388} cy={404} rx={22} ry={11} fill="#e8846f" opacity={0.16} />
      <Brow side={-1} lift={L.mood === 'smirk' ? 0 : 0} />
      <Brow side={1} lift={L.mood === 'smirk' ? 8 : 0} />
      <Eye cx={238} cy={338} side={-1} mood={L.mood} p={p} />
      <Eye cx={362} cy={338} side={1} mood={L.mood} p={p} />
      {L.glasses && <g>
        <rect x={186} y={306} width={104} height={66} rx={18} fill="rgba(255,255,255,0.08)" stroke={L.gc ?? '#c9a463'} strokeWidth={L.gc ? 6 : 4.5} />
        <rect x={310} y={306} width={104} height={66} rx={18} fill="rgba(255,255,255,0.08)" stroke={L.gc ?? '#c9a463'} strokeWidth={L.gc ? 6 : 4.5} />
        <path d="M 290 330 Q 300 322 310 330 M 186 326 L 166 322 M 414 326 L 434 322" stroke={L.gc ?? '#c9a463'} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M 200 318 l 18 -6 M 324 318 l 18 -6" stroke="#fff" strokeWidth={4} opacity={0.7} strokeLinecap="round" />
      </g>}
      <Hair h={H} p={p} />
    </svg>
  );
};

export const TOONS: (ToonLook & {name: string; note: string; bg: string; ring: string; fg: string})[] = [
  {id: 't1', name: 'Classic', note: 'quiff · light stubble · white tee', hair: 'quiff', fh: 'stubble', mood: 'smile', outfit: 'tee', c1: '#f4f4f2', c2: '#dcdcd8',
    bg: '#2f6b4f', ring: '#3d8562', fg: '#fff'},
  {id: 't2', name: 'Night Owl', note: 'swept fringe · clean · black hoodie', hair: 'fringe', fh: 'clean', mood: 'gentle', outfit: 'hoodie', c1: '#232327', c2: '#1a1a1d', c3: '#7a2a33',
    bg: '#1c2433', ring: '#2c3a52', fg: '#fff'},
  {id: 't3', name: 'Spiky', note: 'textured spikes · clean · grey tee', hair: 'spiky', fh: 'clean', mood: 'smile', outfit: 'tee', c1: '#cfd2d6', c2: '#b3b7bc',
    bg: '#f0ede7', ring: '#e4ded3', fg: '#1a1a1a'},
  {id: 't4', name: 'Flannel', note: 'wavy · light stubble · flannel + black tee', hair: 'wavy', fh: 'stubble', mood: 'grin', outfit: 'flannel', c1: '#e9ecef', c2: '#6f8fae', c3: '#1b1b1e',
    bg: '#2f6b4f', ring: '#3d8562', fg: '#fff'},
  {id: 't5', name: 'Gentle', note: 'neat side part · clean · cream sweater', hair: 'neat', fh: 'clean', mood: 'gentle', outfit: 'sweater', c1: '#efe6d4', c2: '#ddd1b8',
    bg: '#f3ece1', ring: '#e7d9c2', fg: '#2a2118'},
  {id: 't6', name: 'Soft Beard', note: 'quiff · soft beard · navy sweatshirt', hair: 'quiff', fh: 'soft', mood: 'smirk', outfit: 'sweater', c1: '#2a3550', c2: '#1d2639',
    bg: '#e8ebf1', ring: '#c8d1e2', fg: '#141a28'},
  {id: 't7', name: 'Curtains', note: 'middle part · light stubble · denim jacket', hair: 'curtain', fh: 'stubble', mood: 'smile', outfit: 'denim', c1: '#5f84ad', c2: '#4b6d94', c3: '#f2f2ef',
    bg: '#e6edf3', ring: '#c4d4e5', fg: '#142030'},
  {id: 't8', name: 'Specs', note: 'swept fringe · stubble · glasses · olive overshirt', hair: 'fringe', fh: 'stubble', mood: 'smile', outfit: 'overshirt', c1: '#6b7450', c2: '#59613f', c3: '#20201f', glasses: true,
    bg: '#2f6b4f', ring: '#3d8562', fg: '#fff'},
];

export const ToonCard: React.FC<{k: number; big?: boolean}> = ({k, big}) => {
  const L = TOONS[k];
  const W = big ? 1080 : 560, H = big ? 1350 : 760;
  return (
    <div style={{width: W, height: H, position: 'relative', overflow: 'hidden', background: L.bg, borderRadius: big ? 0 : 30}}>
      <div style={{position: 'absolute', left: '50%', top: H * 0.6, width: W * 0.72, height: W * 0.72, marginLeft: -W * 0.36, marginTop: -W * 0.36, borderRadius: '50%', background: L.ring}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center'}}>
        <ToonAvatar L={L} width={W * 0.68} height={W * 0.68 * 640 / 440} />
      </div>
      <div style={{position: 'absolute', left: big ? 60 : 30, top: big ? 56 : 26, color: L.fg}}>
        <div style={{fontFamily: MONO, fontSize: big ? 30 : 18, letterSpacing: 3, opacity: 0.7}}>{L.id.toUpperCase()}</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: big ? 110 : 58, lineHeight: 1}}>{L.name}</div>
        <div style={{fontFamily: INTER, fontWeight: 600, fontSize: big ? 30 : 18, opacity: 0.78, marginTop: 4}}>{L.note}</div>
      </div>
    </div>
  );
};

export const ToonSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#e9e5de', padding: 50, fontFamily: INTER}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 30}}>
      <span style={{fontSize: 60, fontWeight: 800, letterSpacing: -2, color: '#121214'}}>Pick your host</span>
      <span style={{fontFamily: MONO, fontSize: 24, color: '#8b8780', letterSpacing: 2}}>ROUND 3 · AVATAR STYLE · 8 LOOKS</span>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 560px)', gap: 24}}>
      {TOONS.map((_, k) => <ToonCard key={k} k={k} />)}
    </div>
  </AbsoluteFill>
);

export const ToonSingle: React.FC<{k: number}> = ({k}) => <AbsoluteFill><ToonCard k={k} big /></AbsoluteFill>;
export const ToonProbe: React.FC = () => (
  <AbsoluteFill style={{background: '#2f6b4f', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start'}}>
    {TOONS.slice(0, 6).map((L, k) => <ToonAvatar key={k} L={{...L, id: 'pr' + k}} width={400} height={500} viewBox="110 30 380 475" />)}
  </AbsoluteFill>
);
