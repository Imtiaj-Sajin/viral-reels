import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INTER, SERIF, MONO} from './Explainer';

/* Character concepts, round 2: straight/slightly wavy hair, varied faces, gentle/cool outfits, no chains. */

const LINE = '#16110f';
const SKIN = {light: '#f2cfae', mid: '#e0ae8a', shadow: '#c48b65', deep: '#a9724f'};
const HAIR = '#17110f', HAIR_HI = '#5c4a42';

type HairStyle = 'quiff' | 'sidepart' | 'fringe' | 'slick' | 'curtains' | 'crop' | 'volume' | 'swept' | 'slickLift';
type FacialHair = 'clean' | 'stubble' | 'soft' | 'mustache';
type Outfit = 'knit' | 'sweat' | 'tee' | 'blazer' | 'cardigan' | 'turtle' | 'denim' | 'hoodie' | 'vest';
export type Look = {id: string; hair: HairStyle; face: 'round' | 'oval' | 'defined'; fh: FacialHair; glassesStyle?: 'round' | 'rect'; outfit: Outfit; mood: 'gentle' | 'warm' | 'calm' | 'smirk';
  brows: 'soft' | 'thick'; glasses?: boolean; headphones?: boolean; main: string; dark: string};

const FACE = {
  round: {d: 'M 172 300 Q 172 150 300 142 Q 428 150 428 300 Q 432 420 378 462 Q 342 490 300 492 Q 258 490 222 462 Q 168 420 172 300 Z', ex: 170, chin: 492},
  oval: {d: 'M 180 296 Q 180 148 300 140 Q 420 148 420 296 Q 422 408 376 456 Q 340 492 300 496 Q 260 492 224 456 Q 178 408 180 296 Z', ex: 178, chin: 496},
  defined: {d: 'M 184 290 Q 184 146 300 138 Q 416 146 416 290 L 414 352 Q 410 414 380 452 Q 348 494 300 502 Q 252 494 220 452 Q 190 414 186 352 Z', ex: 186, chin: 502},
};

const Defs: React.FC<{p: string; L: Look}> = ({p, L}) => (
  <defs>
    <radialGradient id={`${p}skin`} cx="46%" cy="38%" r="72%"><stop offset="0%" stopColor={SKIN.light} /><stop offset="62%" stopColor={SKIN.mid} /><stop offset="100%" stopColor={SKIN.shadow} /></radialGradient>
    <linearGradient id={`${p}hair`} x1="0" y1="0" x2="0.6" y2="1"><stop offset="0%" stopColor="#3a2d28" /><stop offset="50%" stopColor={HAIR} /><stop offset="100%" stopColor="#0a0706" /></linearGradient>
    <linearGradient id={`${p}fade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={HAIR} stopOpacity="0.95" /><stop offset="100%" stopColor={HAIR} stopOpacity="0.15" /></linearGradient>
    <radialGradient id={`${p}iris`} cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#5b3b25" /><stop offset="100%" stopColor="#1d1109" /></radialGradient>
    <linearGradient id={`${p}cloth`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={L.main} /><stop offset="100%" stopColor={L.dark} /></linearGradient>
    <linearGradient id={`${p}beard`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a1e1a" stopOpacity="0" />
      <stop offset="40%" stopColor="#2a1e1a" stopOpacity={L.fh === 'soft' ? 0.5 : 0.32} /><stop offset="100%" stopColor="#2a1e1a" stopOpacity={L.fh === 'soft' ? 0.85 : 0.5} /></linearGradient>
    <pattern id={`${p}knit`} width="26" height="22" patternUnits="userSpaceOnUse">
      <rect width="26" height="22" fill={L.main} /><path d="M 3 3 L 13 13 L 23 3" stroke={L.dark} strokeWidth="3" fill="none" opacity="0.55" />
    </pattern>
  </defs>
);

/* ---------- hair (straight / slightly wavy) ---------- */
const HairPaths: Record<HairStyle, {base: string; strands: string[]; tips?: string; sides?: boolean}> = {
  quiff: { // like the mirror photo: tapered sides, top pushed up and back
    base: `M 174 262 C 170 226 178 194 198 172 C 212 146 240 126 272 118 C 304 102 348 98 380 110 C 404 100 428 106 440 124 L 458 116
      C 462 140 456 164 444 182 C 448 202 440 218 428 230 C 430 244 430 254 428 262 C 420 246 412 236 400 230 C 380 216 358 212 336 218
      L 324 204 C 302 212 278 212 258 220 C 236 226 218 236 204 250 C 194 256 184 260 174 262 Z`,
    strands: ['M 214 204 C 250 162 316 140 404 146', 'M 246 216 C 290 178 352 164 432 170', 'M 280 122 C 322 110 372 112 418 128', 'M 330 206 C 360 186 396 182 430 194'],
    sides: true,
  },
  sidepart: {
    base: `M 172 272 C 160 220 172 164 210 132 C 244 104 298 90 348 94 C 404 98 446 130 454 184 C 460 220 452 252 432 272
      C 426 246 414 230 396 222 C 360 206 300 202 262 212 C 248 196 246 172 256 150 C 240 170 234 196 238 216
      C 218 226 202 238 192 252 C 186 260 178 268 172 272 Z`,
    strands: ['M 262 150 C 316 116 392 118 440 170', 'M 266 182 C 324 150 398 156 446 206', 'M 300 104 C 350 96 404 110 434 140', 'M 210 160 C 220 140 236 126 254 118', 'M 214 214 C 214 190 222 170 236 156'],
    sides: true,
  },
  fringe: {
    base: `M 168 282 C 158 226 172 170 214 140 C 256 112 336 108 384 128 C 430 148 456 196 448 250 C 446 264 440 274 432 282
      Q 426 262 422 250 L 404 262 Q 404 246 398 236 L 380 252 Q 376 236 368 226 L 350 248 Q 346 232 336 222 L 316 246 Q 310 230 300 220
      L 282 244 Q 276 230 268 220 L 252 246 Q 248 232 238 222 L 222 248 Q 218 236 210 228 L 194 254 Q 188 250 182 246 Q 176 264 168 282 Z`,
    strands: ['M 300 128 C 292 168 286 196 282 238', 'M 350 134 C 348 172 344 204 340 236', 'M 250 136 C 238 170 230 200 228 236', 'M 400 150 C 404 190 404 216 398 246'],
  },
  slick: {
    base: `M 172 262 C 162 210 176 158 216 128 C 258 98 324 88 378 102 C 424 114 452 150 450 200 C 450 228 442 248 428 262
      C 420 234 404 214 380 204 C 360 196 338 194 318 198 C 322 182 334 170 350 164 C 324 166 304 180 296 198
      C 270 200 246 206 228 216 C 206 228 190 244 182 254 Z`,
    strands: ['M 240 190 C 266 140 330 112 410 124', 'M 296 192 C 318 150 372 132 438 152', 'M 340 172 C 370 154 410 156 444 182', 'M 208 214 C 220 170 254 140 306 126'],
    sides: true,
  },
  curtains: {
    base: `M 166 290 C 156 228 172 168 216 140 C 260 112 340 112 384 140 C 428 168 444 228 434 290
      Q 432 252 406 232 Q 362 214 332 226 Q 316 214 300 198 Q 284 214 268 226 Q 238 214 194 232 Q 168 252 166 290 Z`,
    strands: ['M 300 200 C 332 210 384 216 424 254', 'M 300 200 C 268 210 216 216 176 254', 'M 300 122 L 300 198', 'M 340 130 C 372 150 400 180 414 220', 'M 260 130 C 228 150 200 180 186 220'],
  },
  volume: { // front lifts up on the left, sweeps back to the right (user's sketch); short sides
    base: `M 180 268 C 172 238 172 210 180 188 C 170 160 172 128 186 104 C 196 84 214 68 236 62 C 262 54 292 56 318 62
      C 352 68 390 70 420 82 C 448 94 466 116 468 142 C 470 166 462 186 448 202 C 452 222 446 244 434 262
      C 426 248 414 236 398 230 C 376 220 350 214 326 216 C 300 212 274 214 254 220 C 232 226 210 236 196 250 C 188 256 184 262 180 268 Z`,
    strands: ['M 202 198 C 214 132 270 94 360 88', 'M 228 214 C 252 152 322 114 432 112', 'M 282 212 C 322 174 382 152 458 160', 'M 196 150 C 206 112 226 88 252 76', 'M 244 86 C 292 74 360 80 414 94'],
    sides: true,
  },
  swept: { // medium height: lifted front-left, swept back to the right
    base: `M 180 270 C 172 240 174 212 182 190 C 176 162 182 132 200 112 C 216 94 240 84 266 80 C 300 74 340 78 376 86
      C 412 94 444 112 456 140 C 464 162 458 184 448 200 C 452 224 444 248 432 266 C 424 250 412 238 398 232
      C 376 222 350 216 326 218 C 300 214 276 218 258 224 C 234 230 212 240 198 254 C 190 260 184 266 180 270 Z`,
    strands: ['M 206 200 C 222 146 280 112 384 108', 'M 238 214 C 266 166 336 138 446 148', 'M 296 214 C 336 184 394 176 452 196', 'M 214 132 C 236 104 280 92 330 90'],
    sides: true,
  },
  slickLift: { // G4 slick back with a small lift at the front-left and a bit more height on top (user's sketch)
    base: `M 176 262 C 166 214 172 166 200 136 C 214 112 236 98 264 90 C 300 78 346 76 386 88 C 428 100 454 134 454 184
      C 454 216 446 242 430 262 C 420 234 404 214 380 204 C 360 196 338 194 318 198 C 322 182 334 170 350 164 C 324 166 304 180 296 198
      C 270 200 246 206 228 216 C 206 228 190 244 182 254 Z`,
    strands: ['M 236 190 C 254 140 318 108 402 114', 'M 292 192 C 314 150 368 128 440 144', 'M 338 172 C 368 152 410 156 446 180', 'M 206 212 C 210 168 236 136 280 118'],
    sides: true,
  },
  crop: {
    base: `M 176 262 C 172 214 188 170 226 148 C 264 128 336 128 374 148 C 412 170 428 214 424 262
      L 416 240 L 402 246 L 396 232 L 380 240 L 372 226 L 354 236 L 348 222 L 330 232 L 322 220 L 302 230 L 294 218 L 276 230
      L 268 220 L 250 234 L 242 224 L 224 238 L 216 230 L 200 244 L 190 238 Z`,
    strands: ['M 250 160 L 246 210', 'M 290 150 L 288 206', 'M 330 150 L 334 206', 'M 370 162 L 378 210'],
    sides: true,
  },
};

const Hair: React.FC<{p: string; L: Look}> = ({p, L}) => {
  const H = HairPaths[L.hair];
  return (
    <g>
      {H.sides && <>
        <path d="M 172 258 L 168 304 C 170 312 178 314 184 304 L 192 256 Z" fill={`url(#${p}fade)`} />
        <path d="M 428 258 L 432 304 C 430 312 422 314 416 304 L 408 256 Z" fill={`url(#${p}fade)`} />
      </>}
      <path d={H.base} fill={`url(#${p}hair)`} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
      {H.strands.map((d, k) => <path key={k} d={d} stroke={HAIR_HI} strokeWidth={k === 0 ? 7 : 5} fill="none" strokeLinecap="round" opacity={0.75} />)}
      {H.tips && <path d={H.tips} stroke="#5a4a42" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />}
    </g>
  );
};

/* ---------- face ---------- */
const Face: React.FC<{p: string; L: Look}> = ({p, L}) => {
  const skin = `url(#${p}skin)`;
  const F = FACE[L.face];
  const lid = L.mood === 'calm' ? 0.3 : L.mood === 'smirk' ? 0.32 : 0.24;
  const lowLid = L.mood === 'warm' ? 0.3 : L.mood === 'gentle' ? 0.16 : 0;
  const Eye: React.FC<{cx: number; side: number}> = ({cx, side}) => {
    const cy = 300, rx = 26, ry = 21;
    const extra = L.mood === 'smirk' && side > 0 ? 0.1 : 0;
    const top = cy - ry + (lid + extra) * ry * 2;
    const bot = cy + ry - lowLid * ry * 1.1;
    return (
      <g>
        <clipPath id={`${p}e${side}`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fbf8f3" />
        <g clipPath={`url(#${p}e${side})`}>
          <circle cx={cx + 2} cy={cy + 3} r={14} fill={`url(#${p}iris)`} />
          <circle cx={cx + 2} cy={cy + 3} r={6.5} fill="#0a0605" />
          <circle cx={cx + 7} cy={cy - 2} r={4} fill="#fff" />
          <rect x={cx - rx - 2} y={cy - ry - 4} width={rx * 2 + 4} height={top - (cy - ry - 4)} fill={skin} />
          <rect x={cx - rx - 2} y={bot} width={rx * 2 + 4} height={ry * 2} fill={skin} />
        </g>
        <path d={`M ${cx - rx - 3} ${top + 4} Q ${cx} ${top - 8} ${cx + rx + 3} ${top + 4}`} stroke={LINE} strokeWidth={6.5} fill="none" strokeLinecap="round" />
        <path d={`M ${cx - rx + 6} ${bot + 2} Q ${cx} ${bot + 7} ${cx + rx - 6} ${bot + 2}`} stroke={SKIN.deep} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.7} />
      </g>
    );
  };
  const brow = (left: boolean) => {
    const t = L.brows === 'thick' ? 14 : 9, y = L.mood === 'smirk' && !left ? -6 : 0;
    return left
      ? `M 208 ${268 + y} Q 244 ${252 + y} 280 ${260 + y} L 279 ${260 + t + y} Q 244 ${254 + t + y} 210 ${268 + t + y} Z`
      : `M 320 ${260 + y} Q 356 ${252 + y} 392 ${268 + y} L 390 ${268 + t + y} Q 356 ${254 + t + y} 321 ${260 + t + y} Z`;
  };
  const mouth = L.mood === 'warm' ? 'M 264 406 Q 300 438 336 406' : L.mood === 'gentle' ? 'M 270 410 Q 300 428 330 410'
    : L.mood === 'smirk' ? 'M 274 416 Q 304 424 334 404' : 'M 278 414 Q 300 421 322 414';
  const ex = F.ex, ex2 = 600 - F.ex;
  return (
    <g>
      <ellipse cx={ex} cy={322} rx={24} ry={34} fill={skin} stroke={LINE} strokeWidth={6} />
      <ellipse cx={ex2} cy={322} rx={24} ry={34} fill={skin} stroke={LINE} strokeWidth={6} />
      <path d={`M ${ex - 2} 306 Q ${ex - 10} 322 ${ex} 338 M ${ex2 + 2} 306 Q ${ex2 + 10} 322 ${ex2} 338`} stroke={SKIN.deep} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={F.d} fill={skin} stroke={LINE} strokeWidth={7} />
      <clipPath id={`${p}fc`}><path d={F.d} /></clipPath>
      <g clipPath={`url(#${p}fc)`}>
      {/* facial hair */}
      {(L.fh === 'stubble' || L.fh === 'soft' || L.fh === 'mustache') &&
        <path d="M 178 320 Q 180 420 224 460 Q 262 490 300 492 Q 338 490 376 460 Q 420 420 422 320 Q 410 388 378 420 Q 342 446 300 448 Q 258 446 222 420 Q 190 388 178 320 Z"
          fill={`url(#${p}beard)`} />}
      {L.fh === 'soft' && <path d="M 238 440 Q 300 472 362 440 Q 370 474 340 494 Q 300 510 260 494 Q 230 474 238 440 Z" fill="#2a1e1a" opacity={0.6} />}
      {(L.fh === 'soft' || L.fh === 'mustache') && <path d="M 264 398 Q 282 386 300 392 Q 318 386 336 398 Q 320 402 300 398 Q 280 402 264 398 Z" fill="#2a1e1a" opacity={L.fh === 'soft' ? 0.7 : 0.85} />}
      {L.fh === 'stubble' && <path d="M 266 398 Q 300 388 334 398" stroke="#2a1e1a" strokeWidth={9} opacity={0.25} fill="none" strokeLinecap="round" />}
      </g>
      <path d={mouth} stroke="#8a4a3a" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={mouth} stroke={LINE} strokeWidth={5} fill="none" strokeLinecap="round" />
      {L.mood === 'warm' && <path d="M 274 412 Q 300 428 326 411 Q 312 419 300 419 Q 288 419 274 412 Z" fill="#fbf7f2" />}
      <path d="M 306 300 Q 308 334 292 352 Q 298 366 314 364 Q 326 362 328 352" stroke={SKIN.deep} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={220} cy={356} rx={24} ry={12} fill="#de7d6c" opacity={L.mood === 'warm' || L.mood === 'gentle' ? 0.28 : 0.18} />
      <ellipse cx={380} cy={356} rx={24} ry={12} fill="#de7d6c" opacity={L.mood === 'warm' || L.mood === 'gentle' ? 0.28 : 0.18} />
      <path d={brow(true)} fill="#140e0b" />
      <path d={brow(false)} fill="#140e0b" />
      <Eye cx={246} side={-1} />
      <Eye cx={354} side={1} />
    </g>
  );
};

/* ---------- outfits (no chains) ---------- */
const TORSO = 'M 20 900 L 34 650 Q 48 548 176 520 L 424 520 Q 552 548 566 650 L 580 900 Z';
const OutfitBack: React.FC<{p: string; L: Look}> = ({p, L}) => {
  const o = L.outfit;
  const fill = o === 'knit' ? `url(#${p}knit)` : o === 'vest' ? '#dbe5f1' : `url(#${p}cloth)`;
  return (
    <g>
      {o === 'tee' ? <path d="M 6 900 L 22 640 Q 40 540 170 518 L 430 518 Q 560 540 578 640 L 594 900 Z" fill={fill} stroke={LINE} strokeWidth={6} />
        : <path d={TORSO} fill={fill} stroke={LINE} strokeWidth={6} />}
      {o === 'hoodie' && <path d="M 176 532 C 186 470 236 452 300 456 C 364 452 414 470 424 532 C 380 566 220 566 176 532 Z" fill={L.dark} stroke={LINE} strokeWidth={6} />}
      {o === 'denim' && <path d="M 180 534 C 190 474 238 456 300 460 C 362 456 410 474 420 534 C 380 566 220 566 180 534 Z" fill="#8d9097" stroke={LINE} strokeWidth={6} />}
      {o === 'sweat' && <path d="M 150 560 Q 120 700 128 900 M 450 560 Q 480 700 472 900" stroke="#000" strokeWidth={4} opacity={0.18} fill="none" />}
      <path d="M 120 900 Q 128 770 150 700 M 480 900 Q 472 770 450 700" stroke="#000" strokeWidth={7} opacity={0.14} fill="none" strokeLinecap="round" />
    </g>
  );
};

const Neckline: React.FC<{p: string; L: Look}> = ({p, L}) => {
  const o = L.outfit;
  if (o === 'knit') return <path d="M 236 522 Q 300 566 364 522 L 372 544 Q 300 594 228 544 Z" fill={L.dark} stroke={LINE} strokeWidth={5} />;
  if (o === 'vest') return <>
    <path d="M 120 900 L 128 700 Q 140 612 192 570 L 252 542 L 300 690 L 348 542 L 408 570 Q 460 612 472 700 L 480 900 Z" fill={`url(#${p}knit)`} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 252 548 L 300 690 L 348 548" fill="none" stroke={L.dark} strokeWidth={12} />
    <path d="M 252 548 L 300 690 L 348 548" fill="none" stroke={LINE} strokeWidth={4} />
    <path d="M 300 560 L 300 690" stroke="#9fb3cc" strokeWidth={3} />
    <path d="M 252 510 L 212 560 L 266 610 L 294 566 Z" fill="#f3f7fc" stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 348 510 L 388 560 L 334 610 L 306 566 Z" fill="#f3f7fc" stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
    {[760, 840].map((y) => <circle key={y} cx={300} cy={y} r={8} fill={L.dark} stroke={LINE} strokeWidth={2.5} />)}</>;
  if (o === 'sweat') return <><path d="M 236 522 Q 300 568 364 522 L 370 540 Q 300 590 230 540 Z" fill={L.dark} stroke={LINE} strokeWidth={5} />
    {Array.from({length: 13}).map((_, k) => { const x = 240 + k * 10; return <path key={k} d={`M ${x} ${530 + Math.abs(x - 300) * -0.1 + 14} l 0 14`} stroke="#000" strokeWidth={2} opacity={0.15} />; })}</>;
  if (o === 'tee') return <path d="M 244 520 Q 300 566 356 520" fill="none" stroke={L.dark} strokeWidth={13} strokeLinecap="round" />;
  if (o === 'turtle') return <><path d="M 250 456 L 250 548 Q 300 576 350 548 L 350 456 Q 300 476 250 456 Z" fill={`url(#${p}cloth)`} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
    {[262, 278, 294, 310, 326, 340].map((x) => <path key={x} d={`M ${x} 470 L ${x} 556`} stroke="#000" strokeWidth={2.5} opacity={0.22} />)}</>;
  if (o === 'blazer') return <>
    <path d="M 240 520 L 300 640 L 360 520 Z" fill="#f7f5f0" />
    <path d="M 252 512 L 222 556 L 274 610 L 296 566 Z" fill="#fbfaf7" stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 348 512 L 378 556 L 326 610 L 304 566 Z" fill="#fbfaf7" stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 226 522 L 186 620 L 262 760 L 290 650 Z" fill={L.main} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 374 522 L 414 620 L 338 760 L 310 650 Z" fill={L.main} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 290 650 L 300 900 M 310 650 L 300 900" stroke={LINE} strokeWidth={5} />
    <circle cx={300} cy={800} r={9} fill={L.dark} stroke={LINE} strokeWidth={3} /></>;
  if (o === 'cardigan') return <>
    <path d="M 240 522 L 300 700 L 360 522 Q 300 560 240 522 Z" fill="#f6f3ee" stroke={LINE} strokeWidth={4} />
    <path d="M 252 522 Q 300 556 348 522" fill="none" stroke="#dcd6cc" strokeWidth={9} />
    <path d="M 236 520 L 300 704 L 300 900 M 364 520 L 300 704" stroke={LINE} strokeWidth={6} fill="none" />
    <path d="M 240 520 L 302 700" stroke={L.dark} strokeWidth={14} opacity={0.6} />
    {[740, 800, 860].map((y) => <circle key={y} cx={312} cy={y} r={8} fill="#6e5038" stroke={LINE} strokeWidth={2.5} />)}</>;
  if (o === 'denim') return <>
    <path d="M 276 560 L 270 700 M 324 560 L 330 700" stroke="#ece6da" strokeWidth={7} strokeLinecap="round" />
    <path d="M 214 528 Q 300 600 386 528 Q 380 576 300 596 Q 220 576 214 528 Z" fill="#a1a4ab" stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 210 520 L 170 600 L 236 660 L 262 600 Z" fill={L.main} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 390 520 L 430 600 L 364 660 L 338 600 Z" fill={L.main} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 250 640 L 240 900 M 350 640 L 360 900" stroke={LINE} strokeWidth={5} />
    <path d="M 136 700 L 236 700 M 364 700 L 464 700" stroke="#f0d7a0" strokeWidth={3} strokeDasharray="8 6" /></>;
  if (o === 'hoodie') return <>
    <path d="M 204 532 Q 300 610 396 532 Q 388 584 300 604 Q 212 584 204 532 Z" fill={L.main} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 278 590 L 270 720 M 322 590 L 330 720" stroke="#ece6da" strokeWidth={8} strokeLinecap="round" /></>;
  return null;
};

const Extras: React.FC<{L: Look}> = ({L}) => (
  <g>
    {L.glasses && L.glassesStyle === 'rect' && <>
      {[246, 354].map((cx) => <rect key={cx} x={cx - 47} y={276} width={94} height={54} rx={13} fill="rgba(255,255,255,0.07)" stroke="#1b1b1f" strokeWidth={6} />)}
      <path d="M 293 298 Q 300 292 307 298 M 199 294 L 182 290 M 401 294 L 418 290" stroke="#1b1b1f" strokeWidth={5.5} fill="none" strokeLinecap="round" />
      {[246, 354].map((cx) => <path key={cx} d={`M ${cx - 34} 316 l 26 -28`} stroke="#fff" strokeWidth={4} opacity={0.45} strokeLinecap="round" />)}
    </>}
    {L.glasses && L.glassesStyle !== 'rect' && <>
      <circle cx={246} cy={302} r={38} fill="rgba(255,255,255,0.06)" stroke="#a8823e" strokeWidth={4.5} />
      <circle cx={354} cy={302} r={38} fill="rgba(255,255,255,0.06)" stroke="#a8823e" strokeWidth={4.5} />
      <path d="M 284 298 Q 300 290 316 298 M 208 296 L 180 292 M 392 296 L 420 292" stroke="#a8823e" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M 224 284 l 14 -9 M 332 284 l 14 -9" stroke="#fff" strokeWidth={4} opacity={0.6} strokeLinecap="round" />
    </>}
    {L.headphones && <>
      <path d="M 196 520 Q 300 470 404 520" stroke="#2b2b31" strokeWidth={18} fill="none" strokeLinecap="round" />
      <g transform="rotate(-14 208 540)"><ellipse cx={208} cy={540} rx={44} ry={56} fill="#ff3d2e" stroke={LINE} strokeWidth={6} /><ellipse cx={216} cy={540} rx={24} ry={34} fill="#c9261a" opacity={0.6} /><ellipse cx={196} cy={520} rx={10} ry={16} fill="#fff" opacity={0.35} /></g>
      <g transform="rotate(14 392 540)"><ellipse cx={392} cy={540} rx={44} ry={56} fill="#ff3d2e" stroke={LINE} strokeWidth={6} /><ellipse cx={384} cy={540} rx={24} ry={34} fill="#c9261a" opacity={0.6} /><ellipse cx={380} cy={520} rx={10} ry={16} fill="#fff" opacity={0.35} /></g>
    </>}
  </g>
);

export const Avatar2: React.FC<{L: Look; width: number; height: number; viewBox?: string}> = ({L, width, height, viewBox = '-40 40 680 760'}) => {
  const p = L.id;
  return (
    <svg viewBox={viewBox} width={width} height={height} style={{overflow: 'hidden', display: 'block'}}>
      <Defs p={p} L={L} />
      <OutfitBack p={p} L={L} />
      <path d="M 262 430 L 262 540 Q 300 562 338 540 L 338 430 Z" fill={SKIN.shadow} stroke={LINE} strokeWidth={6} />
      <path d="M 266 500 Q 300 528 334 500" stroke={SKIN.deep} strokeWidth={14} opacity={0.4} fill="none" />
      <Neckline p={p} L={L} />
      <Face p={p} L={L} />
      <Hair p={p} L={L} />
      <Extras L={L} />
    </svg>
  );
};

export const LOOKS2: (Look & {name: string; note: string; bg: string; fg: string; ring: string})[] = [
  {id: 'g1', name: 'Gentle', note: 'side part · clean shave · cream knit', hair: 'sidepart', face: 'oval', fh: 'clean', outfit: 'knit', mood: 'warm', brows: 'soft',
    main: '#efe6d6', dark: '#d8cbb3', bg: '#f4efe6', fg: '#2a2118', ring: '#e9c9a0'},
  {id: 'g2', name: 'Soft Spoken', note: 'curtain hair · light stubble · gold glasses', hair: 'curtains', face: 'oval', fh: 'stubble', outfit: 'sweat', mood: 'gentle', brows: 'soft', glasses: true,
    main: '#b9c4a8', dark: '#8f9b7e', bg: '#eef0e6', fg: '#1d2318', ring: '#cfd8bd'},
  {id: 'g3', name: 'Everyday', note: 'textured quiff · soft beard · khaki tee', hair: 'quiff', face: 'round', fh: 'soft', outfit: 'tee', mood: 'gentle', brows: 'thick',
    main: '#cfc7ab', dark: '#a9a184', bg: '#efece2', fg: '#24221a', ring: '#dcd3b6'},
  {id: 'g4', name: 'Smart', note: 'slick back · stubble · navy blazer', hair: 'slick', face: 'oval', fh: 'stubble', outfit: 'blazer', mood: 'calm', brows: 'thick',
    main: '#26324d', dark: '#161e31', bg: '#e8ebf1', fg: '#141a28', ring: '#b8c3d9'},
  {id: 'g5', name: 'Cozy', note: 'soft fringe · clean shave · camel cardigan', hair: 'fringe', face: 'round', fh: 'clean', outfit: 'cardigan', mood: 'warm', brows: 'soft',
    main: '#bd9163', dark: '#946b44', bg: '#f3e9dc', fg: '#2b1e12', ring: '#e7c79e'},
  {id: 'g6', name: 'Minimal', note: 'textured crop · mustache · charcoal turtleneck', hair: 'crop', face: 'oval', fh: 'mustache', outfit: 'turtle', mood: 'calm', brows: 'thick',
    main: '#34353b', dark: '#1c1d21', bg: '#ecebe8', fg: '#141414', ring: '#cfcdc8'},
  {id: 'g7', name: 'Studio', note: 'textured quiff · soft beard · hoodie + headphones', hair: 'quiff', face: 'round', fh: 'soft', outfit: 'hoodie', mood: 'smirk', brows: 'thick', headphones: true,
    main: '#26304a', dark: '#141a2a', bg: '#f2efe9', fg: '#121214', ring: '#f0412f'},
  {id: 'g8', name: 'Layered', note: 'side part · stubble · denim over grey hoodie', hair: 'sidepart', face: 'round', fh: 'stubble', outfit: 'denim', mood: 'gentle', brows: 'thick',
    main: '#6d8bb0', dark: '#4b6688', bg: '#e6edf3', fg: '#142030', ring: '#bccde0'},
];

export const ConceptCard2: React.FC<{k: number; big?: boolean}> = ({k, big}) => {
  const L = LOOKS2[k];
  const W = big ? 1080 : 560, H = big ? 1350 : 700;
  return (
    <div style={{width: W, height: H, position: 'relative', overflow: 'hidden', background: L.bg, borderRadius: big ? 0 : 30}}>
      <div style={{position: 'absolute', left: '50%', top: H * 0.52, width: W * 0.76, height: W * 0.76, marginLeft: -W * 0.38, marginTop: -W * 0.38, borderRadius: '50%', background: L.ring}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center'}}>
        <Avatar2 L={L} width={W * 0.9} height={W * 0.9 * 760 / 680} />
      </div>
      <div style={{position: 'absolute', left: big ? 60 : 30, top: big ? 56 : 26, color: L.fg}}>
        <div style={{fontFamily: MONO, fontSize: big ? 30 : 18, letterSpacing: 3, opacity: 0.65}}>{L.id.toUpperCase()}</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: big ? 110 : 58, lineHeight: 1}}>{L.name}</div>
        <div style={{fontFamily: INTER, fontWeight: 600, fontSize: big ? 30 : 18, opacity: 0.72, marginTop: 4}}>{L.note}</div>
      </div>
    </div>
  );
};

export const ConceptSheet2: React.FC = () => (
  <AbsoluteFill style={{background: '#e9e5de', padding: 50, fontFamily: INTER}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 30}}>
      <span style={{fontSize: 60, fontWeight: 800, letterSpacing: -2, color: '#121214'}}>Pick your host</span>
      <span style={{fontFamily: MONO, fontSize: 24, color: '#8b8780', letterSpacing: 2}}>ROUND 2 · 8 LOOKS · STRAIGHT HAIR · NO CHAINS</span>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 560px)', gap: 24}}>
      {LOOKS2.map((_, k) => <ConceptCard2 key={k} k={k} />)}
    </div>
  </AbsoluteFill>
);

export const ConceptSingle2: React.FC<{k: number}> = ({k}) => <AbsoluteFill><ConceptCard2 k={k} big /></AbsoluteFill>;
