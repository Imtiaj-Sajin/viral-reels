import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INTER, SERIF, MONO} from './Explainer';

/* Character concept explorations (static). One base face, different looks. */

const LINE = '#16110f';
const SKIN = {light: '#f1cca9', mid: '#dfac86', shadow: '#c18862', deep: '#a8714d'};
const HAIR = '#15100e', HAIR_HI = '#3d2f2a', BEARD = '#1d1512';

type Look = {
  id: string; hair: 'quiff' | 'messy' | 'cap' | 'hood'; outfit: 'hoodie' | 'hoodup' | 'plaid' | 'bomber' | 'tee' | 'leather';
  acc: ('headphones' | 'roundglasses' | 'screenglasses' | 'sunglasses' | 'chain')[]; mood: 'smirk' | 'calm' | 'smile' | 'brow' | 'cool';
  main: string; dark: string; arms?: 'crossed';
};

const Defs: React.FC<{p: string; L: Look}> = ({p, L}) => (
  <defs>
    <radialGradient id={`${p}skin`} cx="46%" cy="38%" r="72%"><stop offset="0%" stopColor={SKIN.light} /><stop offset="62%" stopColor={SKIN.mid} /><stop offset="100%" stopColor={SKIN.shadow} /></radialGradient>
    <linearGradient id={`${p}hair`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#30241f" /><stop offset="55%" stopColor={HAIR} /><stop offset="100%" stopColor="#080605" /></linearGradient>
    <radialGradient id={`${p}iris`} cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#5b3b25" /><stop offset="100%" stopColor="#1d1109" /></radialGradient>
    <linearGradient id={`${p}cloth`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={L.main} /><stop offset="100%" stopColor={L.dark} /></linearGradient>
    <pattern id={`${p}plaid`} width="34" height="34" patternUnits="userSpaceOnUse">
      <rect width="34" height="34" fill="#ead6bb" />
      <rect width="34" height="9" y="12" fill="#d7b48c" opacity="0.75" /><rect width="9" height="34" x="12" fill="#d7b48c" opacity="0.75" />
      <rect width="34" height="2" y="16" fill="#9c6a3e" opacity="0.7" /><rect width="2" height="34" x="16" fill="#9c6a3e" opacity="0.7" />
      <rect width="34" height="1.5" y="3" fill="#fff" opacity="0.6" /><rect width="1.5" height="34" x="3" fill="#fff" opacity="0.6" />
    </pattern>
    <linearGradient id={`${p}lens`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2a2a30" /><stop offset="45%" stopColor="#0c0c0f" /><stop offset="100%" stopColor="#3a1d22" /></linearGradient>
    <linearGradient id={`${p}beardFade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a1e1a" stopOpacity="0" /><stop offset="38%" stopColor="#2a1e1a" stopOpacity="0.55" /><stop offset="100%" stopColor="#2a1e1a" stopOpacity="0.9" /></linearGradient>
    <radialGradient id={`${p}glow`} cx="50%" cy="80%" r="60%"><stop offset="0%" stopColor="#5fd4ff" stopOpacity="0.22" /><stop offset="100%" stopColor="#5fd4ff" stopOpacity="0" /></radialGradient>
  </defs>
);

const Body: React.FC<{p: string; L: Look}> = ({p, L}) => {
  const torso = 'M 20 900 L 34 650 Q 48 548 176 520 L 424 520 Q 552 548 566 650 L 580 900 Z';
  if (L.outfit === 'hoodie' || L.outfit === 'hoodup') return (
    <g>
      <path d={torso} fill={`url(#${p}cloth)`} stroke={LINE} strokeWidth={6} />
      {L.outfit === 'hoodie' && <path d="M 176 532 C 186 470 236 452 300 456 C 364 452 414 470 424 532 C 380 566 220 566 176 532 Z" fill={L.dark} stroke={LINE} strokeWidth={6} />}
      <path d="M 120 900 Q 128 770 150 700 M 480 900 Q 472 770 450 700" stroke="#000" strokeWidth={8} opacity={0.2} fill="none" strokeLinecap="round" />
      <path d="M 196 828 Q 300 800 404 828 L 418 900 L 182 900 Z" fill="none" stroke="#000" strokeWidth={5} opacity={0.25} />
    </g>
  );
  if (L.outfit === 'plaid') return (
    <g>
      <path d={torso} fill={`url(#${p}plaid)`} stroke={LINE} strokeWidth={6} />
      {[640, 730, 820].map((y) => <circle key={y} cx={258 + (y - 640) * 0.02} cy={y} r={7} fill="#8b6a48" stroke={LINE} strokeWidth={2.5} />)}
    </g>
  );
  if (L.outfit === 'bomber' || L.outfit === 'leather') return (
    <g>
      <path d={torso} fill={`url(#${p}cloth)`} stroke={LINE} strokeWidth={6} />
      <path d="M 238 524 L 300 640 L 362 524 Z" fill="#f4f1ea" />
      <path d="M 238 524 L 300 640 L 300 900 L 214 900 L 224 620 Z" fill="none" />
      {L.outfit === 'bomber' ? <>
        <path d="M 230 520 Q 300 556 370 520 L 380 540 Q 300 584 220 540 Z" fill="#26291f" stroke={LINE} strokeWidth={5} />
        {[0, 1, 2].map((k) => <path key={k} d={`M ${226 + k * 2} ${528 + k * 6} Q 300 ${566 + k * 6} ${374 - k * 2} ${528 + k * 6}`} stroke="#7b8a5e" strokeWidth={2} fill="none" />)}
        <path d="M 256 600 L 280 900 M 344 600 L 320 900" stroke={LINE} strokeWidth={6} />
        <circle cx={440} cy={690} r={26} fill="#e8743b" stroke={LINE} strokeWidth={4} /><path d="M 430 690 l 8 8 l 14 -16" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
      </> : <>
        <path d="M 236 524 L 196 610 L 254 700 L 290 640 Z" fill={L.main} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 364 524 L 404 610 L 346 700 L 310 640 Z" fill={L.main} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 290 640 L 262 900 M 310 640 L 338 900" stroke={LINE} strokeWidth={6} />
        <path d="M 360 760 L 420 750" stroke="#c9c9cf" strokeWidth={5} strokeLinecap="round" />
        <path d="M 170 620 Q 160 700 166 760" stroke="#ffffff" strokeWidth={6} opacity={0.18} fill="none" strokeLinecap="round" />
      </>}
    </g>
  );
  // oversized tee
  return (
    <g>
      <path d="M 6 900 L 22 640 Q 40 540 170 518 L 430 518 Q 560 540 578 640 L 594 900 Z" fill={`url(#${p}cloth)`} stroke={LINE} strokeWidth={6} />
      <path d="M 240 520 Q 300 572 360 520" fill="none" stroke={L.dark} strokeWidth={14} />
      <path d="M 240 520 Q 300 572 360 520" fill="none" stroke={LINE} strokeWidth={4} />
      <path d="M 110 900 Q 120 780 140 720 M 490 900 Q 480 780 460 720" stroke="#000" strokeWidth={7} opacity={0.15} fill="none" strokeLinecap="round" />
    </g>
  );
};

const FrontLayer: React.FC<{p: string; L: Look}> = ({p, L}) => (
  <g>
    {(L.outfit === 'hoodie' || L.outfit === 'hoodup') && <>
      <path d="M 204 532 Q 300 610 396 532 Q 388 584 300 604 Q 212 584 204 532 Z" fill={L.main} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 278 590 L 270 720 M 322 590 L 330 720" stroke="#ece6da" strokeWidth={8} strokeLinecap="round" />
      <rect x={262} y={716} width={16} height={26} rx={5} fill="#c9c3b8" stroke={LINE} strokeWidth={3} />
      <rect x={322} y={716} width={16} height={26} rx={5} fill="#c9c3b8" stroke={LINE} strokeWidth={3} />
    </>}
    {L.outfit === 'plaid' && <>
      <path d="M 236 524 L 274 900 L 326 900 L 364 524 Q 300 560 236 524 Z" fill="#f6f3ee" stroke={LINE} strokeWidth={5} />
      <path d="M 252 524 Q 300 562 348 524" fill="none" stroke="#dcd6cc" strokeWidth={10} />
      <path d="M 244 506 L 198 556 L 252 628 L 292 572 Z" fill={`url(#${p}plaid)`} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 356 506 L 402 556 L 348 628 L 308 572 Z" fill={`url(#${p}plaid)`} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
    </>}
    {L.acc.includes('chain') && <>
      <path d="M 262 552 Q 300 628 338 552" fill="none" stroke="#8d8d94" strokeWidth={9} strokeLinecap="round" />
      <path d="M 262 552 Q 300 628 338 552" fill="none" stroke="#e9e9ee" strokeWidth={5} strokeDasharray="7 5" strokeLinecap="round" />
    </>}
    {L.acc.includes('headphones') && <>
      <path d="M 196 520 Q 300 470 404 520" stroke="#2b2b31" strokeWidth={18} fill="none" strokeLinecap="round" />
      <g transform="rotate(-14 208 540)"><ellipse cx={208} cy={540} rx={44} ry={56} fill="#ff3d2e" stroke={LINE} strokeWidth={6} /><ellipse cx={216} cy={540} rx={24} ry={34} fill="#c9261a" opacity={0.6} /><ellipse cx={196} cy={520} rx={10} ry={16} fill="#fff" opacity={0.35} /></g>
      <g transform="rotate(14 392 540)"><ellipse cx={392} cy={540} rx={44} ry={56} fill="#ff3d2e" stroke={LINE} strokeWidth={6} /><ellipse cx={384} cy={540} rx={24} ry={34} fill="#c9261a" opacity={0.6} /><ellipse cx={380} cy={520} rx={10} ry={16} fill="#fff" opacity={0.35} /></g>
    </>}
    {L.arms === 'crossed' && <>
      <path d="M 96 760 Q 290 820 470 772" stroke={LINE} strokeWidth={118} fill="none" strokeLinecap="round" />
      <path d="M 96 760 Q 290 820 470 772" stroke={`url(#${p}plaid)`} strokeWidth={106} fill="none" strokeLinecap="round" />
      <ellipse cx={470} cy={760} rx={44} ry={36} fill={`url(#${p}skin)`} stroke={LINE} strokeWidth={5} />
      <path d="M 504 702 Q 310 722 130 712" stroke={LINE} strokeWidth={118} fill="none" strokeLinecap="round" />
      <path d="M 504 702 Q 310 722 130 712" stroke={`url(#${p}plaid)`} strokeWidth={106} fill="none" strokeLinecap="round" />
      <ellipse cx={136} cy={716} rx={46} ry={38} fill={`url(#${p}skin)`} stroke={LINE} strokeWidth={5} />
      <path d="M 112 704 q 20 -10 40 0 M 116 724 q 20 -8 38 2" stroke={SKIN.deep} strokeWidth={4} fill="none" strokeLinecap="round" />
    </>}
  </g>
);

const Hair: React.FC<{p: string; L: Look}> = ({p, L}) => {
  if (L.hair === 'hood') return (
    <g>
      <path d="M 214 236 C 236 192 364 188 388 236 C 370 226 352 232 340 242 C 330 230 312 228 300 240 C 288 228 270 230 260 242 C 248 232 230 228 214 236 Z" fill={`url(#${p}hair)`} stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
  if (L.hair === 'cap') return (
    <g>
      <path d="M 170 300 C 162 270 164 248 172 232 L 190 236 C 186 260 186 280 190 300 Z" fill={HAIR} />
      <path d="M 430 300 C 438 270 436 248 428 232 L 410 236 C 414 260 414 280 410 300 Z" fill={HAIR} />
      <path d="M 168 240 C 166 150 228 104 300 102 C 372 104 434 150 432 240 Z" fill="#141416" stroke={LINE} strokeWidth={6} />
      <path d="M 168 240 C 230 222 370 222 432 240 L 434 256 C 370 238 230 238 166 256 Z" fill="#26262b" stroke={LINE} strokeWidth={5} />
      <rect x={262} y={196} width={76} height={30} rx={8} fill="#ff3d2e" stroke={LINE} strokeWidth={4} />
      <path d="M 252 120 C 280 108 330 108 356 118" stroke="#3a3a42" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M 196 256 Q 192 276 198 292 M 404 256 Q 408 276 402 292" stroke={HAIR} strokeWidth={12} strokeLinecap="round" fill="none" />
    </g>
  );
  const quiff = L.hair === 'quiff';
  return (
    <g>
      {/* short tapered sides */}
      <path d="M 168 304 C 160 270 160 238 170 214 L 196 222 C 186 250 186 280 190 304 Z" fill={HAIR} opacity={0.82} />
      <path d="M 432 304 C 440 270 440 238 430 214 L 404 222 C 414 250 414 280 410 304 Z" fill={HAIR} opacity={0.82} />
      <path d={quiff
        ? `M 170 228 C 164 188 178 152 206 134 C 200 114 214 96 236 94 C 236 74 256 62 276 68 C 284 50 310 44 326 56
           C 340 40 368 42 380 58 C 400 52 420 64 424 84 C 446 86 462 106 460 130 C 474 146 474 172 460 188
           C 466 206 454 222 432 228 C 420 214 404 208 388 212 C 372 200 346 198 328 208 C 306 198 280 202 266 214
           C 246 208 224 214 212 226 C 198 222 182 224 170 228 Z`
        : `M 166 236 C 154 194 168 150 200 130 C 190 106 206 82 232 82 C 230 58 254 42 278 52 C 288 30 318 24 336 40
           C 352 24 382 28 392 48 C 414 40 440 54 442 78 C 466 80 484 104 478 130 C 494 148 492 180 474 194
           C 480 216 466 234 440 240 C 424 222 402 216 384 222 C 370 206 340 204 324 216 C 304 204 272 208 260 222
           C 240 216 214 222 204 236 C 190 232 178 234 166 236 Z`}
        fill={`url(#${p}hair)`} stroke={LINE} strokeWidth={6} strokeLinejoin="round" />
      {['M 214 160 C 248 124 300 110 352 116', 'M 252 104 C 280 86 320 80 356 88', 'M 376 116 C 408 120 432 140 442 166', 'M 300 72 C 320 62 344 62 362 70', 'M 196 196 C 210 176 230 166 252 166'].map((d, k) => (
        <path key={k} d={d} stroke={HAIR_HI} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.85} />
      ))}
      <path d={quiff ? 'M 296 210 Q 288 222 292 236' : 'M 286 216 Q 276 232 282 248'} stroke={HAIR} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={quiff ? 'M 316 208 Q 318 218 326 224' : 'M 308 214 Q 306 228 316 238'} stroke={HAIR} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
};

const Face: React.FC<{p: string; L: Look}> = ({p, L}) => {
  const skin = `url(#${p}skin)`;
  const lid = L.mood === 'cool' ? 0.42 : L.mood === 'smirk' ? 0.34 : L.mood === 'smile' ? 0.26 : 0.3;
  const Eye: React.FC<{cx: number; side: number}> = ({cx, side}) => {
    const cy = 300, rx = 27, ry = 21;
    const extra = L.mood === 'smirk' && side > 0 ? 0.12 : L.mood === 'brow' && side < 0 ? 0.1 : 0;
    const top = cy - ry + (lid + extra) * ry * 2;
    const smileLow = L.mood === 'smile' ? 0.3 : 0;
    const bot = cy + ry - smileLow * ry * 1.1;
    return (
      <g>
        <clipPath id={`${p}e${side}`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fbf8f3" />
        <g clipPath={`url(#${p}e${side})`}>
          <circle cx={cx + 3} cy={cy + 3} r={14} fill={`url(#${p}iris)`} />
          <circle cx={cx + 3} cy={cy + 3} r={6.5} fill="#0a0605" />
          <circle cx={cx + 8} cy={cy - 2} r={4} fill="#fff" />
          <rect x={cx - rx - 2} y={cy - ry - 4} width={rx * 2 + 4} height={top - (cy - ry - 4)} fill={skin} />
          <rect x={cx - rx - 2} y={bot} width={rx * 2 + 4} height={ry * 2} fill={skin} />
        </g>
        <path d={`M ${cx - rx - 3} ${top + 4} Q ${cx} ${top - 8} ${cx + rx + 3} ${top + 4}`} stroke={LINE} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M ${cx - rx + 6} ${bot + 2} Q ${cx} ${bot + 7} ${cx + rx - 6} ${bot + 2}`} stroke={SKIN.deep} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.7} />
      </g>
    );
  };
  const by = L.mood === 'brow' ? [-2, -16] : L.mood === 'cool' ? [4, 4] : [0, 0];
  const mouth = L.mood === 'smile' ? 'M 266 410 Q 300 436 336 408' : L.mood === 'smirk' || L.mood === 'brow' ? 'M 274 416 Q 304 424 334 402'
    : L.mood === 'cool' ? 'M 278 416 Q 300 418 326 410' : 'M 276 414 Q 300 422 326 412';
  return (
    <g>
      <ellipse cx={170} cy={322} rx={24} ry={34} fill={skin} stroke={LINE} strokeWidth={6} />
      <ellipse cx={430} cy={322} rx={24} ry={34} fill={skin} stroke={LINE} strokeWidth={6} />
      <path d="M 168 306 Q 160 322 170 338 M 432 306 Q 440 322 430 338" stroke={SKIN.deep} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M 172 300 Q 172 150 300 142 Q 428 150 428 300 Q 432 420 378 462 Q 342 490 300 492 Q 258 490 222 462 Q 168 420 172 300 Z" fill={skin} stroke={LINE} strokeWidth={7} />
      {/* soft short beard: stubble on the jaw fading up the cheeks, chin beard, thin mustache */}
      <path d="M 174 318 Q 176 420 222 462 Q 262 492 300 494 Q 338 492 378 462 Q 424 420 426 318 Q 414 386 380 420 Q 344 446 300 448 Q 256 446 220 420 Q 186 386 174 318 Z" fill={`url(#${p}beardFade)`} />
      <path d="M 232 436 Q 300 474 368 436 Q 378 474 344 498 Q 300 516 256 498 Q 222 474 232 436 Z" fill="#2a1e1a" opacity={0.92} />
      {Array.from({length: 26}).map((_, k) => { const x = 240 + (k * 37) % 122, y = 448 + (k * 23) % 50;
        return <path key={k} d={`M ${x} ${y} l ${((k % 3) - 1) * 2} 10`} stroke="#4a3830" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />; })}
      <path d="M 262 398 Q 282 384 300 391 Q 318 384 338 398 Q 320 403 300 398 Q 280 403 262 398 Z" fill="#2a1e1a" opacity={0.92} />
      <path d="M 262 398 Q 252 418 240 436 M 338 398 Q 348 418 360 436" stroke="#2a1e1a" strokeWidth={10} opacity={0.5} strokeLinecap="round" />
      <path d={mouth} stroke="#8a4a3a" strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d={mouth} stroke={LINE} strokeWidth={5.5} fill="none" strokeLinecap="round" />
      {L.mood === 'smile' && <path d="M 278 414 Q 300 428 324 413 Q 310 420 300 420 Q 290 420 278 414 Z" fill="#fbf7f2" />}
      {/* nose */}
      <path d="M 306 300 Q 308 334 292 352 Q 298 366 314 364 Q 326 362 328 352" stroke={SKIN.deep} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* cheeks */}
      <ellipse cx={218} cy={354} rx={24} ry={12} fill="#d9786a" opacity={0.2} />
      <ellipse cx={382} cy={354} rx={24} ry={12} fill="#d9786a" opacity={0.2} />
      {/* brows: thick, fairly straight */}
      <path d={`M 204 ${266 + by[0]} Q 240 ${250 + by[0]} 280 ${258 + by[0]} L 278 ${272 + by[0]} Q 240 ${266 + by[0]} 208 ${280 + by[0]} Z`} fill="#120c0a" />
      <path d={`M 320 ${258 + by[1]} Q 360 ${250 + by[1]} 396 ${266 + by[1]} L 392 ${280 + by[1]} Q 360 ${266 + by[1]} 322 ${272 + by[1]} Z`} fill="#120c0a" />
      <Eye cx={246} side={-1} />
      <Eye cx={354} side={1} />
    </g>
  );
};

const Glasses: React.FC<{p: string; L: Look}> = ({p, L}) => (
  <g>
    {L.acc.includes('roundglasses') && <>
      <circle cx={246} cy={302} r={42} fill="rgba(255,255,255,0.08)" stroke="#2a1d16" strokeWidth={7} />
      <circle cx={354} cy={302} r={42} fill="rgba(255,255,255,0.08)" stroke="#2a1d16" strokeWidth={7} />
      <path d="M 288 298 Q 300 288 312 298 M 204 296 L 172 290 M 396 296 L 428 290" stroke="#2a1d16" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 222 282 l 16 -10 M 330 282 l 16 -10" stroke="#fff" strokeWidth={5} opacity={0.6} strokeLinecap="round" />
    </>}
    {L.acc.includes('screenglasses') && <>
      {[246, 354].map((cx) => <rect key={cx} x={cx - 46} y={272} width={92} height={62} rx={14} fill="rgba(95,212,255,0.22)" stroke="#101418" strokeWidth={6} />)}
      <path d="M 292 296 L 308 296 M 200 292 L 172 286 M 400 292 L 428 286" stroke="#101418" strokeWidth={6} strokeLinecap="round" />
      {[246, 354].map((cx) => <path key={cx} d={`M ${cx - 34} ${318} l 40 -36 M ${cx - 12} ${326} l 30 -28`} stroke="#bff0ff" strokeWidth={5} opacity={0.7} strokeLinecap="round" />)}
    </>}
    {L.acc.includes('sunglasses') && <>
      {[246, 354].map((cx) => <path key={cx} d={`M ${cx - 50} 280 Q ${cx} 268 ${cx + 50} 280 Q ${cx + 50} 334 ${cx} 336 Q ${cx - 50} 334 ${cx - 50} 280 Z`} fill={`url(#${p}lens)`} stroke={LINE} strokeWidth={6} />)}
      <path d="M 296 284 L 304 284 M 196 284 L 172 288 M 404 284 L 428 288" stroke={LINE} strokeWidth={7} strokeLinecap="round" />
      {[246, 354].map((cx) => <path key={cx} d={`M ${cx - 30} 292 l 22 0`} stroke="#ff5a4a" strokeWidth={6} opacity={0.85} strokeLinecap="round" />)}
    </>}
  </g>
);

export const Avatar: React.FC<{L: Look; width: number; height: number; viewBox?: string}> = ({L, width, height, viewBox = '-40 20 680 760'}) => {
  const p = L.id;
  return (
    <svg viewBox={viewBox} width={width} height={height} style={{overflow: 'hidden', display: 'block'}}>
      <Defs p={p} L={L} />
      {L.outfit === 'hoodup' && <path d="M 112 560 C 80 400 100 140 300 96 C 500 140 520 400 488 560 Z" fill={`url(#${p}cloth)`} stroke={LINE} strokeWidth={6} />}
      <Body p={p} L={L} />
      <path d="M 262 430 L 262 540 Q 300 562 338 540 L 338 430 Z" fill={SKIN.shadow} stroke={LINE} strokeWidth={6} />
      <path d="M 266 500 Q 300 528 334 500" stroke={SKIN.deep} strokeWidth={14} opacity={0.4} fill="none" />
      <Face p={p} L={L} />
      <Hair p={p} L={L} />
      {L.outfit === 'hoodup' && <>
        <path d="M 182 470 C 150 360 160 192 300 160 C 440 192 450 360 418 470" stroke={L.main} strokeWidth={48} fill="none" strokeLinecap="round" />
        <path d="M 182 470 C 150 360 160 192 300 160 C 440 192 450 360 418 470" stroke={LINE} strokeWidth={6} fill="none" strokeLinecap="round" transform="translate(0 -1)" />
        <path d="M 208 462 C 182 360 190 214 300 186 C 410 214 418 360 392 462" stroke="#000" strokeWidth={12} fill="none" opacity={0.35} strokeLinecap="round" />
      </>}
      <Glasses p={p} L={L} />
      <FrontLayer p={p} L={L} />
    </svg>
  );
};

export const LOOKS: (Look & {name: string; note: string; bg: string; fg: string; ring: string})[] = [
  {id: 'v1', name: 'The Hoodie', note: 'navy hoodie · red headphones · smirk', hair: 'quiff', outfit: 'hoodie', acc: ['headphones'], mood: 'smirk', main: '#26304a', dark: '#141a2a',
    bg: '#f2efe9', fg: '#121214', ring: '#f0412f'},
  {id: 'v2', name: 'Night Mode', note: 'hood up · screen-glow glasses', hair: 'hood', outfit: 'hoodup', acc: ['screenglasses'], mood: 'calm', main: '#1b1d24', dark: '#0c0d11',
    bg: '#0b1020', fg: '#e8f6ff', ring: '#29b6f6'},
  {id: 'v3', name: 'Weekend', note: 'check overshirt · white tee', hair: 'messy', outfit: 'plaid', acc: [], mood: 'smile', main: '#ead6bb', dark: '#c9a47a',
    bg: '#efe3d0', fg: '#2a1d12', ring: '#d9822b'},
  {id: 'v4', name: 'Founder', note: 'olive bomber · round glasses · chain', hair: 'quiff', outfit: 'bomber', acc: ['roundglasses', 'chain'], mood: 'calm', main: '#5a6b42', dark: '#36412a',
    bg: '#e4e7d8', fg: '#1c2214', ring: '#e8743b'},
  {id: 'v5', name: 'Street', note: 'backwards cap · oversized tee · chain', hair: 'cap', outfit: 'tee', acc: ['chain'], mood: 'brow', main: '#b9c3a6', dark: '#8f9a7c',
    bg: '#dfe6e3', fg: '#141a18', ring: '#141414'},
  {id: 'v6', name: 'After Dark', note: 'leather jacket · shades', hair: 'messy', outfit: 'leather', acc: ['sunglasses'], mood: 'cool', main: '#1d1d21', dark: '#0d0d10',
    bg: '#141414', fg: '#f4f1ea', ring: '#f0412f'},
];

export const ConceptCard: React.FC<{k: number; big?: boolean}> = ({k, big}) => {
  const L = LOOKS[k];
  const W = big ? 1080 : 720, H = big ? 1350 : 860;
  return (
    <div style={{width: W, height: H, position: 'relative', overflow: 'hidden', background: L.bg, borderRadius: big ? 0 : 36}}>
      <div style={{position: 'absolute', left: '50%', top: H * 0.5, width: W * 0.74, height: W * 0.74, marginLeft: -W * 0.37, marginTop: -W * 0.37, borderRadius: '50%',
        background: L.ring, opacity: L.id === 'v2' ? 0.22 : 0.9, filter: L.id === 'v2' ? 'blur(40px)' : 'none'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center'}}>
        <Avatar L={L} width={W * 0.86} height={W * 0.86 * 760 / 680} />
      </div>
      <div style={{position: 'absolute', left: big ? 60 : 36, top: big ? 56 : 30, color: L.fg}}>
        <div style={{fontFamily: MONO, fontSize: big ? 30 : 22, letterSpacing: 3, opacity: 0.7}}>{L.id.toUpperCase()}</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: big ? 110 : 70, lineHeight: 1}}>{L.name}</div>
        <div style={{fontFamily: INTER, fontWeight: 600, fontSize: big ? 30 : 22, opacity: 0.75, marginTop: 6}}>{L.note}</div>
      </div>
    </div>
  );
};

export const ConceptSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#e9e5de', padding: 60, fontFamily: INTER}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 36}}>
      <span style={{fontSize: 64, fontWeight: 800, letterSpacing: -2, color: '#121214'}}>Pick your host</span>
      <span style={{fontFamily: MONO, fontSize: 26, color: '#8b8780', letterSpacing: 2}}>6 CONCEPTS · SAME FACE, DIFFERENT VIBE</span>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 720px)', gap: 30}}>
      {LOOKS.map((_, k) => <ConceptCard key={k} k={k} />)}
    </div>
  </AbsoluteFill>
);

export const ConceptSingle: React.FC<{k: number}> = ({k}) => <AbsoluteFill><ConceptCard k={k} big /></AbsoluteFill>;
