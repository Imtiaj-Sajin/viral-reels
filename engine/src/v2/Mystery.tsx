import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadMarker} from '@remotion/google-fonts/PermanentMarker';
import {loadFont as loadType} from '@remotion/google-fonts/SpecialElite';
import {Presenter, Mood} from './Presenter';
import {INTER, SERIF, MONO, Line, Word, wordAt, useT, sp, clamp, money, Roll, Lock, screensOf, Captions, SceneIn, Sfx} from './Explainer';

const {fontFamily: MARKER} = loadMarker();
const {fontFamily: TYPE} = loadType();

const M = {bg: '#0c0b0a', paper: '#efe6d2', paper2: '#e6d9bd', red: '#ff4b38', ink: '#171411', amber: '#e9b86a', mute: 'rgba(243,238,230,0.55)', fg: '#f3eee6', green: '#3ccf7d'};
const THEME = {bg: M.bg, fg: M.fg, mute: M.mute, hl: M.red};
const IMG = (n: string) => staticFile(`ep02/${n}`);
const rel = (a: number, t0: number) => a - t0;
type SP = {ls: Line[]; t0: number; dur: number};

/* ---------------- primitives ---------------- */

const Photo: React.FC<{src: string; x: number; y: number; w: number; h: number; rot?: number; z?: [number, number]; ox?: string; dur: number;
  sepia?: number; dark?: number; label?: string; tape?: boolean; children?: React.ReactNode; gray?: boolean}> =
  ({src, x, y, w, h, rot = 0, z = [1.02, 1.12], ox = '50% 50%', dur, sepia = 0.3, dark = 0, label, tape = true, children, gray}) => {
    const {t} = useT();
    const sc = z[0] + (z[1] - z[0]) * Math.min(1, t / Math.max(1, dur));
    return (
      <div style={{position: 'absolute', left: x, top: y, width: w, transform: `rotate(${rot}deg)`, background: '#f4ede1', padding: '18px 18px 20px',
        boxShadow: '0 34px 80px rgba(0,0,0,0.7), 0 2px 0 rgba(255,255,255,0.05)'}}>
        <div style={{width: w - 36, height: h, overflow: 'hidden', position: 'relative', background: '#111'}}>
          <Img src={IMG(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: ox, transform: `scale(${sc})`, transformOrigin: ox,
            filter: `${gray ? 'grayscale(1) ' : ''}sepia(${sepia}) contrast(1.08) brightness(${1 - dark})`}} />
          {children}
        </div>
        {label && <div style={{fontFamily: TYPE, fontSize: 27, color: '#2a241c', marginTop: 12, letterSpacing: 0.5}}>{label}</div>}
        {tape && <div style={{position: 'absolute', top: -20, left: w / 2 - 75, width: 150, height: 44, background: 'rgba(236,222,180,0.72)', transform: 'rotate(-4deg)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)'}} />}
      </div>
    );
  };

const StampM: React.FC<{text: string; at: number; color?: string; x: number; y: number; rot?: number; size?: number; instant?: boolean}> =
  ({text, at, color = M.red, x, y, rot = -8, size = 64, instant}) => {
    const {t, f, fps} = useT();
    if (!instant && t < at) return null;
    const s = instant ? 1 : sp(f, fps, at, {damping: 9, stiffness: 280, mass: 0.6});
    return (
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${2.1 - 1.1 * s})`, opacity: Math.min(1, s * 1.6) * 0.92,
        fontFamily: INTER, fontWeight: 800, fontSize: size, color, letterSpacing: 3, border: `7px solid ${color}`, borderRadius: 14,
        padding: '2px 22px', whiteSpace: 'nowrap', mixBlendMode: 'normal', textShadow: '0 0 1px rgba(0,0,0,0.2)'}}>{text}</div>
    );
  };

const Paper: React.FC<{x?: number; y: number; w: number; rot?: number; children: React.ReactNode; pad?: number; tone?: string}> = ({x, y, w, rot = 0, children, pad = 44, tone = M.paper}) => (
  <div style={{position: 'absolute', left: x ?? (1080 - w) / 2, top: y, width: w, padding: pad, transform: `rotate(${rot}deg)`, background: tone, color: M.ink,
    boxShadow: '0 30px 70px rgba(0,0,0,0.65)', backgroundImage: 'radial-gradient(rgba(120,90,40,0.10) 1px, transparent 1px)', backgroundSize: '5px 5px'}}>{children}</div>
);

const Typed: React.FC<{text: string; from: number; cps?: number; style?: React.CSSProperties}> = ({text, from, cps = 28, style}) => {
  const {t} = useT();
  const n = Math.max(0, Math.min(text.length, Math.floor((t - from) * cps)));
  return <span style={style}>{text.slice(0, n)}{n < text.length && n > 0 && <span style={{opacity: Math.floor(t * 4) % 2 ? 1 : 0}}>▌</span>}</span>;
};

const Flash: React.FC<{at: number}> = ({at}) => {
  const {t} = useT();
  const o = interpolate(t, [at, at + 0.04, at + 0.3], [0, 0.45, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{background: '#fff', opacity: o}} /> : null;
};

const Marker: React.FC<{cx: number; cy: number; rx: number; ry: number; at: number; color?: string}> = ({cx, cy, rx, ry, at, color = M.red}) => {
  const {t} = useT();
  const p = interpolate(t, [at, at + 0.45], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  if (p <= 0) return null;
  const L = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) * 1.08;
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)}
    transform={`rotate(-4 ${cx} ${cy})`} opacity={0.92} />;
};

/* ---------------- scenes ---------------- */

const HookScene: React.FC<SP> = ({ls, t0, dur}) => {
  const {t} = useT();
  const j = rel(wordAt(ls[0], 'jumped', 4), t0);
  const shake = t > j ? Math.sin((t - j) * 70) * 10 * Math.max(0, 1 - (t - j) * 3) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.4}px)`}}>
      <Photo src="sketch_face.jpg" x={250} y={500} w={580} h={660} rot={-2.5} dur={dur + 4} z={[1.0, 1.1]} ox="50% 40%" sepia={0.25}
        label="FBI SKETCH · FLIGHT 305 · NOV 24, 1971" />
      <StampM text="WANTED" at={0} instant x={720} y={600} rot={12} size={76} />
    </div>
  );
};

const UnsolvedScene: React.FC<SP> = ({ls, t0, dur}) => {
  const {t} = useT();
  const yrs = rel(wordAt(ls[0], 'forty-five', 1.5), t0), nm = rel(wordAt(ls[0], 'never', 2.5), t0);
  return (
    <>
      <Photo src="wanted.jpg" x={90} y={520} w={450} h={700} rot={-3} dur={dur} z={[1.0, 1.08]} ox="50% 20%" sepia={0.4} gray />
      <div style={{position: 'absolute', left: 590, top: 600, width: 420}}>
        <Roll text="45" at={yrs} size={230} color={M.red} stagger={0.08} />
        <div style={{textAlign: 'center', fontFamily: MONO, fontSize: 30, color: M.fg, letterSpacing: 4, marginTop: 8}}>YEARS OF SEARCHING</div>
        <div style={{marginTop: 70, textAlign: 'center', fontFamily: TYPE, fontSize: 40, color: M.fg, opacity: interpolate(t, [nm, nm + 0.3], [0, 1], clamp)}}>
          real name:<br /><span style={{color: M.red, fontSize: 64}}>unknown</span></div>
      </div>
    </>
  );
};

const ClueLockedScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const glow = 0.5 + 0.5 * Math.sin(t * 4);
  return (
    <div style={{position: 'absolute', left: 140, top: 520, width: 800, borderRadius: 26, overflow: 'hidden', background: '#16130f', border: '2px solid #3a3226',
      boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 ${40 + 30 * glow}px rgba(255,75,56,${0.18 + 0.15 * glow})`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', padding: '22px 28px', borderBottom: '2px dashed #3a3226'}}>
        <span style={{fontFamily: MONO, fontSize: 26, color: M.amber, letterSpacing: 2}}>EVIDENCE #1</span>
        <span style={{fontFamily: MONO, fontSize: 26, color: M.mute}}>FOUND · 1980</span>
      </div>
      <div style={{position: 'relative', height: 470}}>
        <Img src={IMG('money.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(26px) brightness(0.45) sepia(0.4)', transform: 'scale(1.2)'}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
          <div style={{width: 130, height: 130, borderRadius: 65, background: M.red, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${1 + 0.05 * glow})`}}><Lock size={70} /></div>
          <span style={{fontFamily: MONO, fontSize: 30, color: M.fg, letterSpacing: 3}}>REVEALED AT THE END</span>
        </div>
      </div>
    </div>
  );
};

const TicketScene: React.FC<SP> = ({ls, t0, dur}) => {
  const tw = rel(wordAt(ls[0], 'twenty-dollar', 3), t0), co = rel(wordAt(ls[0], 'cooper', 5), t0);
  return (
    <Photo src="ticket_crop.jpg" x={60} y={560} w={960} h={594} rot={-1.5} dur={dur} z={[1.0, 1.04]} sepia={0.1} label="his actual ticket · FBI evidence">
      <svg width={924} height={594} style={{position: 'absolute', left: 0, top: 0}}>
        <Marker cx={203} cy={488} rx={70} ry={34} at={tw} />
        <Marker cx={502} cy={224} rx={52} ry={32} at={tw + 0.35} color={M.amber} />
        <Marker cx={143} cy={86} rx={132} ry={38} at={co} />
      </svg>
    </Photo>
  );
};

const SeatScene: React.FC<SP> = ({ls, t0}) => {
  const {t, f, fps} = useT();
  const note = rel(wordAt(ls[0], 'note', 2.5), t0);
  const np = interpolate(t, [note - 0.3, note + 0.5], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const rows = [13, 14, 15, 16, 17, 18];
  const SW = 92, SH = 78, X0 = 120, Y0 = 120;
  const seatX = (c: number) => X0 + c * (SW + 12) + (c >= 3 ? 70 : 0);
  return (
    <Paper y={500} w={820} pad={0} tone="#1a1713">
      <svg width={820} height={830} viewBox="0 0 820 830">
        <text x={410} y={66} textAnchor="middle" fontFamily={MONO} fontSize={26} fill={M.amber} letterSpacing={3}>NORTHWEST 727 · REAR CABIN</text>
        {rows.map((r, ri) => ['A', 'B', 'C', 'D', 'E', 'F'].map((s, c) => {
          const hot = r === 18 && s === 'E';
          const y = Y0 + ri * (SH + 22);
          return (
            <g key={r + s}>
              <rect x={seatX(c)} y={y} width={SW} height={SH} rx={16} fill={hot ? M.red : '#2b2620'} stroke={hot ? '#ffb0a6' : '#3c352c'} strokeWidth={3} />
              {ri === 0 && <text x={seatX(c) + SW / 2} y={Y0 - 14} textAnchor="middle" fontFamily={MONO} fontSize={22} fill={M.mute}>{s}</text>}
              {c === 0 && <text x={X0 - 30} y={y + SH / 2 + 8} textAnchor="middle" fontFamily={MONO} fontSize={22} fill={M.mute}>{r}</text>}
              {hot && <g transform={`translate(${seatX(c) + SW / 2} ${y + SH / 2})`}><circle cy={-14} r={13} fill="#120f0c" /><path d="M -20 26 Q 0 -6 20 26 Z" fill="#120f0c" /></g>}
            </g>
          );
        }))}
        <rect x={seatX(3)} y={Y0 + 6 * (SH + 22) + 10} width={SW * 2 + 12} height={56} rx={14} fill="none" stroke={M.amber} strokeWidth={3} strokeDasharray="10 8" />
        <text x={seatX(3) + SW + 6} y={Y0 + 6 * (SH + 22) + 46} textAnchor="middle" fontFamily={MONO} fontSize={20} fill={M.amber}>JUMP SEAT · FLIGHT ATTENDANT</text>
        {np > 0 && <g transform={`translate(${seatX(4) + SW / 2 + np * 60} ${Y0 + 5 * (SH + 22) + SH / 2 + np * 108}) rotate(${-10 + np * 20})`}>
          <rect x={-34} y={-24} width={68} height={48} rx={4} fill="#fbf7ee" stroke="#c9bfa8" strokeWidth={2} />
          <path d="M -24 -8 L 20 -8 M -24 4 L 14 4" stroke="#555" strokeWidth={3} /></g>}
        <text x={230} y={790} textAnchor="middle" fontFamily={TYPE} fontSize={30} fill={M.fg}>seat 18E · last row</text>
      </svg>
    </Paper>
  );
};

const PurseScene: React.FC<SP> = ({ls, t0, dur}) => {
  const {t} = useT();
  const drop = interpolate(t, [0.2, 1.0], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const q = interpolate(t, [0.5, 0.8], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={900} style={{position: 'absolute', top: 470}} viewBox="0 0 1080 900">
        <g transform={`translate(${540 + drop * 20} ${120 + drop * 360}) rotate(${-14 + drop * 30})`} opacity={drop > 0.96 ? 0 : 1}>
          <rect x={-120} y={-80} width={240} height={160} rx={6} fill="#fbf7ee" stroke="#c9bfa8" strokeWidth={3} />
          <text x={-96} y={-30} fontFamily={MARKER} fontSize={30} fill="#222">MISS —</text>
          <path d="M -96 6 L 90 6 M -96 40 L 60 40" stroke="#bbb" strokeWidth={6} strokeLinecap="round" />
        </g>
        <path d="M 330 520 Q 540 430 750 520 L 790 840 Q 540 880 290 840 Z" fill="#5a3b26" stroke="#2a1b10" strokeWidth={6} />
        <path d="M 400 520 Q 540 320 680 520" fill="none" stroke="#2a1b10" strokeWidth={18} strokeLinecap="round" />
        <rect x={505} y={560} width={70} height={36} rx={6} fill="#c9a25a" />
        <g opacity={q} transform="translate(800 160)">
          <ellipse cx={0} cy={0} rx={150} ry={92} fill="#fbf7ee" />
          <circle cx={-110} cy={110} r={16} fill="#fbf7ee" /><circle cx={-140} cy={150} r={9} fill="#fbf7ee" />
          <text x={0} y={-6} textAnchor="middle" fontFamily={TYPE} fontSize={30} fill="#222">his phone</text>
          <text x={0} y={34} textAnchor="middle" fontFamily={TYPE} fontSize={30} fill="#222">number?</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const NoteScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const bomb = rel(wordAt(ls[0], 'bomb', 2.6), t0);
  const text = 'MISS — I HAVE A BOMB IN MY BRIEFCASE AND WANT YOU TO SIT BY ME.';
  const n = Math.floor(interpolate(t, [0.15, 2.2], [0, text.length], clamp));
  const shake = t > bomb ? Math.sin((t - bomb) * 60) * 8 * Math.max(0, 1 - (t - bomb) * 3) : 0;
  const i = text.indexOf('BOMB');
  return (
    <Paper y={560} w={860} rot={-3 + shake * 0.1} tone="#fbf7ee" pad={56}>
      <div style={{fontFamily: MONO, fontSize: 22, color: '#8a8070', marginBottom: 18, letterSpacing: 2}}>THE NOTE · FELT-TIP, ALL CAPS</div>
      <div style={{fontFamily: MARKER, fontSize: 66, lineHeight: 1.25, color: '#1c1a18', transform: `translateX(${shake}px)`, minHeight: 330}}>
        {text.slice(0, Math.min(n, i))}
        {n > i && <span style={{position: 'relative', color: t > bomb ? M.red : '#1c1a18'}}>{text.slice(i, Math.min(n, i + 4))}
          {t > bomb && <svg style={{position: 'absolute', left: -18, top: -14, overflow: 'visible'}} width={10} height={10}>
            <Marker cx={92} cy={50} rx={118} ry={52} at={bomb} /></svg>}</span>}
        {n > i + 4 && text.slice(i + 4, n)}
      </div>
    </Paper>
  );
};

const BriefcaseScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const red = rel(wordAt(ls[0], 'red', 1), t0), wires = rel(wordAt(ls[0], 'wires', 1.8), t0);
  const open = interpolate(t, [0, 0.5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const g = t > red ? 0.6 + 0.4 * Math.abs(Math.sin((t - red) * 7)) : 0;
  const wireOn = t > wires;
  return (
    <svg width={1080} height={900} viewBox="0 0 1080 900" style={{position: 'absolute', top: 480}}>
      <g transform={`translate(540 420)`}>
        <g transform={`translate(0 -150) scale(1 ${1 - open * 0.75}) translate(0 -150)`}>
          <rect x={-420} y={-150} width={840} height={300} rx={26} fill="#1c1916" stroke="#3b342b" strokeWidth={6} />
        </g>
        <rect x={-420} y={-150} width={840} height={440} rx={26} fill="#211d19" stroke="#3b342b" strokeWidth={6} />
        <rect x={-390} y={-120} width={780} height={380} rx={16} fill="#2c2620" />
        {[0, 1].map((r) => [0, 1, 2, 3].map((c) => (
          <g key={`${r}${c}`} transform={`translate(${-330 + c * 110} ${-80 + r * 160})`}>
            <rect x={0} y={0} width={80} height={130} rx={14} fill={M.red} opacity={0.75 + 0.25 * g} />
            <rect x={0} y={0} width={80} height={130} rx={14} fill="none" stroke="#ffb0a6" strokeWidth={3} opacity={g} />
            <rect x={10} y={14} width={14} height={100} rx={7} fill="#fff" opacity={0.25} />
          </g>
        )))}
        <rect x={140} y={-60} width={210} height={240} rx={30} fill="#8a8f96" stroke="#50555c" strokeWidth={5} />
        <rect x={140} y={-60} width={210} height={50} rx={22} fill="#b9bec5" />
        <text x={245} y={110} textAnchor="middle" fontFamily={MONO} fontSize={26} fill="#2b2f35">BATTERY</text>
        {['M 40 -40 C 90 -120 120 -60 160 -40', 'M 40 120 C 100 160 120 60 160 100', 'M -100 -60 C -40 -140 60 -100 150 -20'].map((d, k) => (
          <path key={k} d={d} fill="none" stroke={wireOn ? ['#ffd34d', '#3ecfff', '#ff6b5a'][k] : '#55504a'} strokeWidth={8} strokeLinecap="round"
            style={{filter: wireOn ? `drop-shadow(0 0 ${8 + 6 * Math.sin(t * 20 + k)}px ${['#ffd34d', '#3ecfff', '#ff6b5a'][k]})` : 'none'}} />
        ))}
      </g>
      <text x={540} y={880} textAnchor="middle" fontFamily={TYPE} fontSize={32} fill={M.fg}>what the flight attendant saw</text>
    </svg>
  );
};

const DemandsScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const a = rel(wordAt(ls[0], 'thousand', 1.2), t0) - 0.3, b = rel(wordAt(ls[0], 'parachutes', 2.2), t0) - 0.2;
  const items: [string, string, number][] = [['$200,000', 'in a knapsack, by 5 pm', a], ['4 parachutes', '2 front · 2 back', b], ['fuel trucks', 'waiting in Seattle', b + 0.9]];
  return (
    <Paper y={540} w={860} rot={1.5}>
      <div style={{fontFamily: MONO, fontSize: 24, color: '#7b7060', letterSpacing: 3, marginBottom: 20}}>COCKPIT RADIO LOG · 3:13 PM</div>
      {items.map(([big, small, at], k) => {
        const on = t >= at;
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '22px 0', borderTop: k ? '2px dashed rgba(0,0,0,0.15)' : 'none'}}>
            <div style={{width: 64, height: 64, border: '5px solid #1c1a18', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MARKER, fontSize: 56, color: M.red, lineHeight: 1}}>{on ? '✓' : ''}</div>
            <div><div style={{fontFamily: TYPE, fontSize: 56, color: '#1c1a18'}}>{on ? <Typed text={big} from={at} cps={30} /> : ''}</div>
              <div style={{fontFamily: TYPE, fontSize: 30, color: '#6e6352', opacity: interpolate(t, [at + 0.3, at + 0.6], [0, 1], clamp)}}>{small}</div></div>
          </div>
        );
      })}
    </Paper>
  );
};

const Bill: React.FC<{x: number; y: number; r?: number; o?: number}> = ({x, y, r = 0, o = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`} opacity={o}>
    <rect x={-120} y={-52} width={240} height={104} rx={8} fill="#cfdcc1" stroke="#5d7350" strokeWidth={3} />
    <rect x={-108} y={-40} width={216} height={80} rx={4} fill="none" stroke="#7c9470" strokeWidth={2} />
    <ellipse cx={0} cy={0} rx={30} ry={36} fill="#9fb391" />
    <text x={-80} y={-14} fontFamily={INTER} fontWeight={800} fontSize={26} fill="#3f5634">20</text>
    <text x={58} y={36} fontFamily={INTER} fontWeight={800} fontSize={26} fill="#3f5634">20</text>
  </g>
);

const MoneyScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const ser = rel(wordAt(ls[0], 'serial', 2.6), t0);
  const strip = interpolate(t, [ser - 0.1, ser + 0.4], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={620} viewBox="0 0 1080 620" style={{position: 'absolute', top: 470}}>
        {Array.from({length: 26}).map((_, k) => {
          const at = 0.05 + k * 0.06;
          const p = interpolate(t, [at, at + 0.45], [0, 1], {...clamp, easing: Easing.out(Easing.bounce)});
          const col = k % 3, layer = Math.floor(k / 3);
          return <Bill key={k} x={250 + col * 290 + (k % 2 ? 6 : -6)} y={-80 + p * (520 - layer * 14)} r={(k % 5 - 2) * 3} o={p > 0 ? 1 : 0} />;
        })}
      </svg>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontSize: 30, color: M.amber, letterSpacing: 3}}>10,000 × $20 BILLS</div>
      <div style={{position: 'absolute', top: 1100, left: 90, width: 900, height: 150, background: '#111', border: '2px solid #333', borderRadius: 10, overflow: 'hidden',
        opacity: strip, transform: `translateY(${(1 - strip) * 40}px)`}}>
        <div style={{display: 'flex', gap: 34, padding: '0 20px', height: '100%', alignItems: 'center', transform: `translateX(${-((t - ser) * 220) % 400}px)`}}>
          {Array.from({length: 12}).map((_, k) => (
            <div key={k} style={{fontFamily: MONO, fontSize: 30, color: '#e8e2d4', whiteSpace: 'nowrap', padding: '10px 14px', border: '2px solid #444'}}>
              L{String(10000000 + ((k * 7919) % 89999999)).slice(0, 8)}A</div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 0, top: 6, fontFamily: MONO, fontSize: 18, color: M.red, paddingLeft: 12}}>● MICROFILM · EVERY SERIAL RECORDED</div>
      </div>
      <Flash at={ser} />
    </AbsoluteFill>
  );
};

const FlightMapScene: React.FC<SP> = ({ls, t0, dur}) => {
  const {t} = useT();
  const mx = rel(wordAt(ls[0], 'mexico', 1.2), t0), low = rel(wordAt(ls[0], 'low', 2.6), t0), slow = rel(wordAt(ls[0], 'slow', 3), t0), gear = rel(wordAt(ls[0], 'gear', 3.4), t0);
  const p = interpolate(t, [0.3, dur], [0, 0.42], clamp);
  const path = 'M 330 140 C 360 220 330 300 350 380 C 380 520 520 620 650 760';
  const pt = (q: number) => { // approximate point on path (two cubic segments)
    const seg = q < 0.5 ? 0 : 1, u = q < 0.5 ? q * 2 : (q - 0.5) * 2;
    const P = seg === 0 ? [[330, 140], [360, 220], [330, 300], [350, 380]] : [[350, 380], [380, 520], [520, 620], [650, 760]];
    const b = (i: number) => (1 - u) ** 3 * P[0][i] + 3 * (1 - u) ** 2 * u * P[1][i] + 3 * (1 - u) * u * u * P[2][i] + u ** 3 * P[3][i];
    return [b(0), b(1)];
  };
  const [px, py] = pt(p), [qx, qy] = pt(Math.min(1, p + 0.01));
  const ang = Math.atan2(qy - py, qx - px) * 180 / Math.PI + 90;
  const chip = (txt: string, at: number, y: number) => (
    <div style={{position: 'absolute', left: 560, top: y, fontFamily: MONO, fontSize: 27, color: M.ink, background: M.amber, padding: '8px 16px', borderRadius: 8, whiteSpace: 'nowrap',
      opacity: interpolate(t, [at, at + 0.2], [0, 1], clamp), transform: `translateX(${interpolate(t, [at, at + 0.3], [40, 0], clamp)}px)`}}>{txt}</div>
  );
  return (
    <AbsoluteFill>
      <svg width={1080} height={860} viewBox="0 0 1080 860" style={{position: 'absolute', top: 470}}>
        <rect x={60} y={20} width={960} height={820} rx={24} fill="#121a1f" stroke="#26343c" strokeWidth={3} />
        {Array.from({length: 9}).map((_, k) => <path key={k} d={`M 60 ${100 + k * 85} L 1020 ${100 + k * 85}`} stroke="#1b262d" strokeWidth={2} />)}
        <path d="M 120 20 C 160 200 110 420 170 840" fill="none" stroke="#1f3c4d" strokeWidth={60} opacity={0.8} />
        <path d={path} fill="none" stroke="#3b4c56" strokeWidth={6} strokeDasharray="14 12" />
        <path d={path} fill="none" stroke={M.red} strokeWidth={7} strokeDasharray={`${p * 1000} 2000`} />
        {[[330, 140, 'SEATTLE'], [350, 380, 'PORTLAND'], [650, 760, 'RENO']].map(([x, y, n]) => (
          <g key={n as string}><circle cx={x as number} cy={y as number} r={11} fill={M.fg} /><text x={(x as number) - 24} y={(y as number) + 8} textAnchor="end" fontFamily={MONO} fontSize={26} fill={M.fg}>{n}</text></g>
        ))}
        <text x={720} y={820} fontFamily={MONO} fontSize={24} fill={M.mute}>↓ MEXICO CITY</text>
        <g transform={`translate(${px} ${py}) rotate(${ang})`}>
          <path d="M 0 -30 L 6 -6 L 30 6 L 30 12 L 6 6 L 4 22 L 12 28 L 12 32 L 0 28 L -12 32 L -12 28 L -4 22 L -6 6 L -30 12 L -30 6 L -6 -6 Z" fill={M.fg} />
        </g>
      </svg>
      {chip('→ MEXICO CITY', mx, 540)}
      {chip('10,000 FT', low, 610)}
      {chip('~100 KNOTS', slow, 680)}
      {chip('GEAR DOWN', gear, 750)}
    </AbsoluteFill>
  );
};

const Rain: React.FC<{strength?: number}> = ({strength = 1}) => {
  const {t} = useT();
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: Math.round(110 * strength)}).map((_, k) => {
        const x = ((k * 97.3) % 1180) - 50 - ((t * 260 + k * 31) % 140);
        const y = ((k * 211.7 + t * (1500 + (k % 7) * 120)) % 2100) - 100;
        return <line key={k} x1={x} y1={y} x2={x - 18} y2={y + 70} stroke="rgba(200,215,230,0.35)" strokeWidth={2.2} />;
      })}
    </svg>
  );
};

const JumpScene: React.FC<SP> = ({ls, t0, dur}) => {
  const {t} = useT();
  const lw = rel(wordAt(ls[0], 'lowers', dur - 2), t0), jp = rel(wordAt(ls[0], 'jumps', dur - 0.6), t0);
  const fall = interpolate(t, [jp, jp + 1.1], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const flash = (Math.sin(t * 1.7) > 0.985 || (t > 1.6 && t < 1.68)) ? 0.35 : 0;
  return (
    <AbsoluteFill>
      <Photo src="airstair.jpg" x={70} y={520} w={940} h={600} rot={1.5} dur={dur} z={[1.05, 1.32]} ox="62% 72%" sepia={0.55} dark={0.45} tape={false}
        label="a Northwest 727 rear airstair · photo: R. Rynerson, CC BY 2.5">
        {fall > 0 && fall < 1 && <svg width={904} height={600} style={{position: 'absolute', left: 0, top: 0}}>
          <g transform={`translate(${560 + fall * 120} ${330 + fall * 340}) rotate(${fall * 160})`}>
            <circle cx={0} cy={-34} r={14} fill="#050505" /><rect x={-14} y={-20} width={28} height={50} rx={10} fill="#050505" />
          </g></svg>}
        <AbsoluteFill style={{background: '#fff', opacity: flash, mixBlendMode: 'overlay'}} />
      </Photo>
      <StampM text="8:13 PM" at={lw} x={800} y={600} rot={8} size={58} color={M.amber} />
      <Rain />
    </AbsoluteFill>
  );
};

const BlackScene: React.FC<SP> = ({ls, t0, dur}) => {
  const {t, f, fps} = useT();
  const ws = ls[0].words;
  const ghost = interpolate(t, [0, 0.6, dur - 0.3, dur], [0, 0.16, 0.12, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#020202'}}>
      <Img src={IMG('sketch_face.jpg')} style={{position: 'absolute', left: 290, top: 520, width: 500, height: 690, objectFit: 'cover', opacity: ghost, filter: 'grayscale(1) blur(1px)'}} />
      <div style={{position: 'absolute', top: 820, left: 60, right: 60, textAlign: 'center', fontFamily: INTER, fontWeight: 600, fontSize: 84, color: M.fg, letterSpacing: -1}}>
        {ws.map((w, k) => {
          const on = sp(f, fps, rel(w.start, t0) - 0.05, {damping: 22, stiffness: 200, mass: 0.6});
          const hl = w.hl;
          return <span key={k} style={{display: 'inline-block', marginRight: 22, opacity: on, filter: `blur(${(1 - on) * 6}px)`,
            ...(hl ? {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 104, color: M.red} : {})}}>{w.w}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const SearchScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const at = ['body', 'parachute', 'spent'].map((w, k) => rel(wordAt(ls[0], w, 0.8 + k * 1.1), t0));
  const tags: [string, string][] = [['BODY', 'NOT FOUND'], ['PARACHUTE', 'NOT FOUND'], ['RANSOM BILLS SPENT', '0']];
  return (
    <AbsoluteFill>
      <svg width={1080} height={640} viewBox="0 0 1080 640" style={{position: 'absolute', top: 480}}>
        <rect x={60} y={0} width={960} height={620} rx={22} fill="#18201a" stroke="#2c3a2f" strokeWidth={3} />
        {Array.from({length: 8}).map((_, k) => <ellipse key={k} cx={560 + k * 6} cy={300 - k * 4} rx={60 + k * 52} ry={36 + k * 32} fill="none" stroke="#2b3d2e" strokeWidth={3} />)}
        {Array.from({length: 30}).map((_, k) => {
          const c = k % 6, r = Math.floor(k / 6), done = t > 0.15 + k * 0.08;
          const x = 120 + c * 140, y = 40 + r * 112;
          return <g key={k}><rect x={x} y={y} width={130} height={102} fill={done ? 'rgba(255,75,56,0.12)' : 'none'} stroke="#3c5a41" strokeWidth={2} />
            {done && <path d={`M ${x + 40} ${y + 30} L ${x + 90} ${y + 72} M ${x + 90} ${y + 30} L ${x + 40} ${y + 72}`} stroke={M.red} strokeWidth={5} strokeLinecap="round" opacity={0.75} />}</g>;
        })}
        <text x={100} y={600} fontFamily={MONO} fontSize={22} fill="#6f8a73">SW WASHINGTON · SEARCH GRID · 1971–72</text>
      </svg>
      <div style={{position: 'absolute', top: 1130, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 14}}>
        {tags.map(([a, b], k) => (
          <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 30, color: M.fg, padding: '10px 18px',
            borderLeft: `6px solid ${M.red}`, background: 'rgba(255,255,255,0.05)', opacity: interpolate(t, [at[k], at[k] + 0.2], [0, 1], clamp)}}>
            <span>{a}</span><span style={{color: M.red}}>{b}</span></div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const DummyScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const dm = rel(wordAt(ls[0], 'dummy', 1.4), t0), vn = rel(wordAt(ls[0], 'vanished', 3), t0);
  const stitch = interpolate(t, [dm - 0.2, dm + 0.6], [0, 1], clamp);
  const gone = interpolate(t, [vn, vn + 0.7], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={760} viewBox="0 0 1080 760" style={{position: 'absolute', top: 480}}>
        <g opacity={1 - gone * 0.85} style={{filter: `blur(${gone * 6}px)`}}>
          <rect x={290} y={80} width={500} height={460} rx={60} fill="#5d6448" stroke="#353a28" strokeWidth={8} />
          <rect x={330} y={120} width={420} height={380} rx={40} fill="#6d7556" />
          <path d="M 330 230 L 750 230 M 330 390 L 750 390" stroke="#3d432e" strokeWidth={26} />
          <rect x={500} y={270} width={80} height={80} rx={12} fill="#b9b39a" stroke="#3d432e" strokeWidth={6} />
          <text x={540} y={322} textAnchor="middle" fontFamily={MONO} fontSize={26} fill="#3d432e">R</text>
          <path d="M 340 160 L 380 190 L 420 160 L 460 190 L 500 160 L 540 190 L 580 160 L 620 190 L 660 160 L 700 190 L 740 160" fill="none" stroke={M.red}
            strokeWidth={8} strokeLinecap="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - stitch)} />
          <path d="M 340 470 L 380 440 L 420 470 L 460 440 L 500 470 L 540 440 L 580 470 L 620 440 L 660 470 L 700 440 L 740 470" fill="none" stroke={M.red}
            strokeWidth={8} strokeLinecap="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - stitch)} />
        </g>
        {gone > 0 && <rect x={290} y={80} width={500} height={460} rx={60} fill="none" stroke={M.fg} strokeWidth={5} strokeDasharray="20 16" opacity={gone} />}
        <text x={540} y={640} textAnchor="middle" fontFamily={TYPE} fontSize={34} fill={M.fg}>reserve chute · classroom training dummy</text>
      </svg>
      <StampM text="SEWN SHUT" at={dm + 0.3} x={540} y={760} rot={-10} size={70} />
      <StampM text="NEVER FOUND" at={vn + 0.2} x={560} y={1010} rot={7} size={60} color={M.amber} />
    </AbsoluteFill>
  );
};

const MoneyFoundScene: React.FC<SP> = ({ls, t0, dur}) => {
  const {t} = useT();
  const six = rel(wordAt(ls[0], 'six', 3.5), t0), rb = rel(wordAt(ls[0], 'rubber', 5), t0);
  return (
    <AbsoluteFill>
      <Photo src="money.jpg" x={70} y={520} w={940} h={560} rot={1.5} dur={dur} z={[1.0, 1.15]} ox="45% 45%" sepia={0.15}
        label="FBI evidence · Tena Bar, Columbia River · Feb 10, 1980" />
      <div style={{position: 'absolute', top: 1190, left: 0, right: 0, opacity: t > six - 0.6 ? 1 : 0}}><Roll text="$5,800" at={six} size={120} color={M.red} /></div>
      <div style={{position: 'absolute', top: 1320, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontSize: 28, color: M.fg,
        opacity: interpolate(t, [rb, rb + 0.3], [0, 1], clamp)}}>290 bills · still in rubber bands</div>
      <Flash at={0.05} />
    </AbsoluteFill>
  );
};

const RiverScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const pv = rel(wordAt(ls[0], 'proven', 2.5), t0);
  const dash = interpolate(t, [0.4, 1.6], [0, 1], clamp);
  const q = 0.7 + 0.3 * Math.sin(t * 6);
  return (
    <svg width={1080} height={860} viewBox="0 0 1080 860" style={{position: 'absolute', top: 470}}>
      <rect x={60} y={0} width={960} height={820} rx={24} fill="#141a16" stroke="#26322a" strokeWidth={3} />
      {Array.from({length: 46}).map((_, k) => {
        const x = 560 + ((k * 73) % 380), y = 60 + ((k * 131) % 330);
        return <path key={k} d={`M ${x} ${y} l 18 36 l -36 0 Z`} fill="#26402c" />;
      })}
      <ellipse cx={760} cy={230} rx={190} ry={150} fill="none" stroke={M.amber} strokeWidth={5} strokeDasharray="16 12" />
      <text x={760} y={420} textAnchor="middle" fontFamily={MONO} fontSize={24} fill={M.amber}>ESTIMATED LANDING ZONE</text>
      <path d="M 60 640 C 300 560 460 720 700 660 C 860 620 960 700 1020 680" fill="none" stroke="#2f6f9c" strokeWidth={70} opacity={0.85} />
      <text x={820} y={770} fontFamily={MONO} fontSize={24} fill="#7fb4d8">COLUMBIA RIVER</text>
      <path d="M 660 340 C 560 440 380 520 300 600" fill="none" stroke={M.fg} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={0}
        style={{strokeDasharray: `${dash * 500} 2000`}} />
      <g transform="translate(290 590)"><path d="M 0 0 C -34 -34 -34 -80 0 -80 C 34 -80 34 -34 0 0 Z" fill={M.red} /><circle cx={0} cy={-52} r={12} fill="#fff" /></g>
      <text x={290} y={650} textAnchor="middle" fontFamily={MONO} fontSize={26} fill={M.fg}>TENA BAR</text>
      <text x={470} y={470} fontFamily={SERIF} fontStyle="italic" fontSize={150} fill={M.red} opacity={dash > 0.9 ? q : 0}>?</text>
      {t > pv && <text x={540} y={800} textAnchor="middle" fontFamily={TYPE} fontSize={34} fill={M.fg}>no proven explanation</text>}
    </svg>
  );
};

const MissingScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const nv = rel(wordAt(ls[0], 'never', 1.6), t0);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 600, left: 0, right: 0, fontFamily: MONO, fontSize: 32, color: M.mute, textAlign: 'center', letterSpacing: 3}}>
        RANSOM <span style={{color: M.fg}}>$200,000</span> − FOUND <span style={{color: M.fg}}>$5,800</span></div>
      <div style={{position: 'absolute', top: 680, left: 0, right: 0}}><Roll text="$194,200" at={0.9} size={170} color={M.red} /></div>
      <div style={{position: 'absolute', top: 900, left: 0, right: 0, textAlign: 'center', opacity: interpolate(t, [nv, nv + 0.25], [0, 1], clamp)}}>
        <span style={{fontFamily: INTER, fontWeight: 800, fontSize: 64, color: M.bg, background: M.fg, padding: '6px 28px', borderRadius: 12}}>NEVER RECOVERED</span></div>
    </AbsoluteFill>
  );
};

const ClosedScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const y16 = rel(wordAt(ls[0], '2016', 0.3), t0), un = rel(wordAt(ls[0], 'unsolved', 3.4), t0);
  const rows: [string, string][] = [['SUBJECT', 'UNKNOWN (alias "Dan Cooper")'], ['OPENED', 'NOV 24, 1971'], ['VOLUMES', '66'], ['STATUS', t > y16 + 0.3 ? 'SUSPENDED · JUL 8, 2016' : 'ACTIVE']];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 500, width: 840, height: 660}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 300, height: 70, background: '#d9b874', borderRadius: '18px 18px 0 0',
          fontFamily: MONO, fontSize: 26, color: '#4a3612', display: 'flex', alignItems: 'center', paddingLeft: 26}}>FBI · NORJAK</div>
        <div style={{position: 'absolute', left: 0, top: 60, right: 0, bottom: 0, background: '#e2c385', borderRadius: '0 18px 18px 18px', padding: 50,
          boxShadow: '0 30px 70px rgba(0,0,0,0.65)'}}>
          {rows.map(([a, b], k) => (
            <div key={k} style={{display: 'flex', gap: 24, padding: '20px 0', borderBottom: '2px solid rgba(74,54,18,0.25)', fontFamily: TYPE, fontSize: 36, color: '#2e220c'}}>
              <span style={{width: 210, color: '#6d5428'}}>{a}</span>
              <span style={{color: k === 3 && t > y16 + 0.3 ? M.red : '#2e220c'}}><Typed text={b} from={k === 3 && t > y16 + 0.3 ? y16 + 0.3 : 0.15 + k * 0.25} cps={34} /></span>
            </div>
          ))}
        </div>
      </div>
      <StampM text="UNSOLVED" at={un} x={560} y={1080} rot={-9} size={110} />
    </AbsoluteFill>
  );
};

const CtaScene: React.FC<SP> = ({ls, t0}) => {
  const {t, f, fps} = useT();
  const fol = rel(wordAt(ls[0], 'follow', 3.5), t0);
  const pressed = t > fol + 0.25;
  const pop = sp(f, fps, fol + 0.25, {damping: 9, stiffness: 300, mass: 0.5});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 110, top: 520, width: 860, borderRadius: 30, background: '#17140f', border: '2px solid #3a3226', padding: 40}}>
        <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 52, color: M.fg, marginBottom: 26}}>Did he survive?</div>
        {['He made it. The money was a decoy.', 'He never opened his chute.'].map((txt, k) => (
          <div key={k} style={{fontFamily: INTER, fontWeight: 600, fontSize: 34, color: M.fg, padding: '22px 26px', marginBottom: 16, borderRadius: 18,
            background: 'rgba(255,255,255,0.06)', border: `2px solid ${k ? 'rgba(255,75,56,0.5)' : 'rgba(233,184,106,0.5)'}`,
            opacity: interpolate(t, [0.2 + k * 0.25, 0.45 + k * 0.25], [0, 1], clamp)}}>{txt}</div>
        ))}
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, padding: '18px 24px', borderRadius: 999, background: 'rgba(255,255,255,0.08)'}}>
          <span style={{fontFamily: INTER, fontSize: 32, color: M.mute}}><Typed text="Add a comment… your theory" from={0.9} cps={26} /></span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1110, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 56, color: pressed ? M.ink : '#fff', background: pressed ? M.fg : M.red,
          padding: '24px 80px', borderRadius: 22, transform: `scale(${pressed ? 0.96 + 0.04 * pop : 1})`, opacity: interpolate(t, [fol - 0.4, fol - 0.1], [0, 1], clamp)}}>
          {pressed ? 'Following ✓' : 'Follow'}</div>
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<SP>> = {
  hook: HookScene, unsolved: UnsolvedScene, clue_locked: ClueLockedScene, ticket: TicketScene, seat: SeatScene, purse: PurseScene, note: NoteScene,
  briefcase: BriefcaseScene, demands: DemandsScene, money: MoneyScene, flightmap: FlightMapScene, jump: JumpScene, black: BlackScene, search: SearchScene,
  dummy: DummyScene, money_found: MoneyFoundScene, river: RiverScene, missing: MissingScene, closed: ClosedScene, cta: CtaScene,
};

/* ---------------- chrome ---------------- */

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.09, mixBlendMode: 'screen'}}>
      <svg width={1080} height={1920}><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 9} /></filter>
        <rect width={1080} height={1920} filter="url(#g)" /></svg>
    </AbsoluteFill>
  );
};

const Backdrop: React.FC = () => {
  const {t} = useT();
  const flick = 0.96 + 0.04 * Math.sin(t * 23) * Math.sin(t * 7.3);
  return (
    <AbsoluteFill style={{background: M.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 42%, rgba(233,184,106,0.10), transparent 70%)', opacity: flick}} />
      <AbsoluteFill style={{background: 'radial-gradient(55% 30% at 50% 92%, rgba(233,184,106,0.16), transparent 75%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};

const Header: React.FC<{left: string; tally?: number; from?: number; label?: string; tallyAt: number}> = ({left, tally, from = 0, label, tallyAt}) => {
  const {t} = useT();
  const v = tally === undefined ? 0 : Math.round(from + interpolate(t, [tallyAt, tallyAt + 0.9], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}) * (tally - from));
  return (
    <div style={{position: 'absolute', top: 70, left: 72, right: 72, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 26, color: M.mute, letterSpacing: 1}}>
      <span>// {left}</span>
      {tally === undefined ? <span style={{color: M.red}}>● UNSOLVED</span> : <span>{label} <span style={{color: M.red, fontWeight: 700}}>{money(v)}</span></span>}
    </div>
  );
};

const Pill: React.FC<{at: number; locked: string; open: string}> = ({at, locked, open}) => {
  const {t} = useT();
  const p = Math.min(1, t / at), done = t >= at;
  return (
    <div style={{position: 'absolute', top: 118, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px', borderRadius: 999,
        background: done ? M.green : 'rgba(255,255,255,0.07)', border: `1.5px solid ${done ? M.green : 'rgba(255,255,255,0.14)'}`}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: done ? M.green : 'rgba(255,75,56,0.22)'}} />
        <span style={{position: 'relative'}}><Lock open={done ? 1 : 0} size={24} color="#fff" /></span>
        <span style={{position: 'relative', fontFamily: MONO, fontSize: 24, color: '#fff'}}>{done ? open : locked}</span>
      </div>
    </div>
  );
};

/* ---------------- cover ---------------- */
const Cover: React.FC<{lines: string[]}> = ({lines}) => (
  <AbsoluteFill>
    <Backdrop />
    <div style={{position: 'absolute', top: 300, left: 70, right: 70, fontFamily: INTER, fontWeight: 800, fontSize: 104, lineHeight: 1.0, color: M.fg, letterSpacing: -3}}>
      {lines.map((l, k) => <div key={k} style={k >= 2 ? {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: M.red, fontSize: 128, letterSpacing: 0} : {}}>{l}</div>)}
    </div>
    <div style={{position: 'absolute', inset: 0, top: 330}}>
      <Photo src="sketch_face.jpg" x={300} y={560} w={480} h={560} rot={-3} dur={10} z={[1.0, 1.0]} ox="50% 40%" sepia={0.25} label="FBI SKETCH · 1971" />
      <StampM text="UNSOLVED" at={0} instant x={700} y={700} rot={12} size={62} />
    </div>
    <Grain />
  </AbsoluteFill>
);

/* ---------------- composition ---------------- */
type Props = {duration: number; lines: (Line & {tally_label?: string; nopresenter?: boolean})[]; mouth: number[]; case?: string; pill_locked?: string;
  pill_open?: string; unlock_scene?: string; cover?: string[]; coverMode?: boolean};

export const Mystery: React.FC<Props> = (props) => {
  const {duration, lines, mouth} = props;
  const {fps} = useVideoConfig();
  const f = useCurrentFrame();
  const t = f / fps;
  if (props.coverMode && props.cover) return <Cover lines={props.cover} />;

  const blocks: {scene: string; lines: typeof lines; start: number; end: number}[] = [];
  lines.forEach((ln) => {
    const last = blocks[blocks.length - 1];
    if (last && last.scene === ln.scene) last.lines.push(ln); else blocks.push({scene: ln.scene, lines: [ln], start: 0, end: 0});
  });
  blocks.forEach((b, k) => { b.start = k === 0 ? 0 : b.lines[0].start - 0.12; b.end = k + 1 < blocks.length ? blocks[k + 1].lines[0].start - 0.12 : duration; });

  const cur = [...lines].reverse().find((l) => l.start - 0.12 <= t) ?? lines[0];
  const ci = lines.indexOf(cur);
  const prevMood = ((ci > 0 ? lines[ci - 1].mood : 'neutral') ?? 'neutral') as Mood;
  const gLine = cur.gesture ? cur : (ci > 0 && lines[ci - 1].gesture && t < lines[ci - 1].end + 0.5 ? lines[ci - 1] : undefined);
  const tl = lines.filter((l) => l.tally !== undefined && l.start <= t);
  const tallyLine = tl[tl.length - 1];
  const tallyFrom = tl.length > 1 ? tl[tl.length - 2].tally : 0;
  const tallyAt = tallyLine ? tallyLine.start + 0.4 : 0;
  const tallyLabel = tallyLine ? (tallyLine.scene === 'missing' ? 'MISSING' : 'RANSOM') : '';
  const unlock = lines.find((l) => l.scene === (props.unlock_scene ?? 'money_found'));
  const unlockAt = unlock ? unlock.start : duration;
  const noCap = lines.filter((l) => l.nopresenter);
  const screens = screensOf(lines, duration).filter((s) => !noCap.some((l) => s.start >= l.start - 0.05 && s.start <= l.end));
  const hidePresenter = !!cur.nopresenter;
  const section = cur.section ?? props.case ?? '';

  // sound
  const sfx: {at: number; name: string; vol?: number}[] = [];
  blocks.forEach((b, k) => { if (k > 0 && !['black'].includes(b.scene)) sfx.push({at: b.start, name: 'whoosh', vol: 0.16}); });
  const L = (s: string) => lines.find((l) => l.scene === s);
  if (L('hook')) sfx.push({at: 0, name: 'm_stamp', vol: 0.5}, {at: wordAt(L('hook'), 'jumped', 4), name: 'm_boom', vol: 0.7});
  if (L('unsolved')) sfx.push({at: wordAt(L('unsolved'), 'forty-five', 1.5) - 0.5, name: 'tick', vol: 0.15});
  if (L('clue_locked')) sfx.push({at: L('clue_locked')!.start + 0.1, name: 'm_sting', vol: 0.35});
  if (L('ticket')) { sfx.push({at: wordAt(L('ticket'), 'twenty-dollar', 3), name: 'm_paper', vol: 0.4}, {at: wordAt(L('ticket'), 'cooper', 5), name: 'm_paper', vol: 0.4}); }
  if (L('seat')) sfx.push({at: wordAt(L('seat'), 'note', 2.5) - 0.3, name: 'm_paper', vol: 0.45});
  if (L('purse')) sfx.push({at: L('purse')!.start + 0.6, name: 'thud', vol: 0.25});
  if (L('note')) { const s0 = L('note')!.start; for (let x = s0 + 0.15; x < s0 + 2.2; x += 0.09) sfx.push({at: x, name: 'm_key', vol: 0.12}); sfx.push({at: wordAt(L('note'), 'bomb', 2.6), name: 'm_boom', vol: 0.6}); }
  if (L('briefcase')) sfx.push({at: wordAt(L('briefcase'), 'wires', 1.8), name: 'beep', vol: 0.18});
  if (L('demands')) { sfx.push({at: wordAt(L('demands'), 'thousand', 1.2) - 0.3, name: 'm_stamp', vol: 0.3}, {at: wordAt(L('demands'), 'parachutes', 2.2) - 0.2, name: 'm_stamp', vol: 0.3}); }
  if (L('money')) sfx.push({at: wordAt(L('money'), 'serial', 2.6), name: 'm_sting', vol: 0.25});
  if (L('jump')) { sfx.push({at: wordAt(L('jump'), 'lowers', 4), name: 'm_stamp', vol: 0.35}, {at: wordAt(L('jump'), 'jumps', 6) - 0.1, name: 'm_wind', vol: 0.7}); }
  if (L('black')) sfx.push({at: L('black')!.start - 1.9, name: 'm_riser', vol: 0.35}, {at: L('black')!.start, name: 'm_boom', vol: 0.8});
  if (L('dummy')) { sfx.push({at: wordAt(L('dummy'), 'dummy', 1.4) + 0.3, name: 'm_stamp', vol: 0.45}, {at: wordAt(L('dummy'), 'vanished', 3) + 0.2, name: 'm_stamp', vol: 0.4}); }
  if (unlock) sfx.push({at: unlockAt, name: 'm_sting', vol: 0.45}, {at: unlockAt + 0.05, name: 'ding', vol: 0.3});
  if (L('missing')) sfx.push({at: L('missing')!.start + 0.9 - 0.5, name: 'tick', vol: 0.15}, {at: wordAt(L('missing'), 'never', 1.6), name: 'm_boom', vol: 0.5});
  if (L('closed')) { sfx.push({at: wordAt(L('closed'), '2016', 0.3) + 0.3, name: 'm_stamp', vol: 0.35}, {at: wordAt(L('closed'), 'unsolved', 3.4), name: 'm_stamp', vol: 0.6}); }
  if (L('cta')) sfx.push({at: wordAt(L('cta'), 'follow', 3.5) + 0.25, name: 'check', vol: 0.3});
  const jet0 = L('ticket')?.start ?? 0, jet1 = L('jump')?.start ?? 0;
  const rain0 = L('jump')?.start ?? 0, rain1 = L('black')?.start ?? 0;

  return (
    <AbsoluteFill style={{background: M.bg}}>
      <Backdrop />
      {blocks.map((b, k) => {
        const Comp = SCENES[b.scene];
        if (!Comp) return null;
        const kicks = b.lines.flatMap((l) => l.words.filter((w) => w.hl).map((w) => w.start - b.start));
        return (
          <Sequence key={k} from={Math.round(b.start * fps)} durationInFrames={Math.max(1, Math.round((b.end - b.start) * fps))}>
            <SceneIn kicks={kicks} instant={k === 0 || b.scene === 'black'}><Comp ls={b.lines} t0={b.start} dur={b.end - b.start} /></SceneIn>
          </Sequence>
        );
      })}
      {!hidePresenter && <>
        <AbsoluteFill style={{background: 'radial-gradient(38% 20% at 50% 90%, rgba(233,184,106,0.20), transparent 75%)'}} />
        <Presenter mood={(cur.mood ?? 'neutral') as Mood} prevMood={prevMood} moodAt={cur.start - 0.1} gesture={gLine?.gesture ?? 'none'}
          gestureFrom={gLine ? gLine.start : 0} gestureTo={gLine ? gLine.end - 0.1 : 0} mouth={mouth} scale={0.78} y={1975} />
      </>}
      <Captions screens={screens} themeAt={() => THEME} />
      {!hidePresenter && <Header left={section} tally={tallyLine?.tally} from={tallyFrom} label={tallyLabel} tallyAt={tallyAt} />}
      {!hidePresenter && <Pill at={unlockAt} locked={props.pill_locked ?? 'the clue · at the end'} open={props.pill_open ?? 'the clue'} />}
      <Grain />
      <Audio src={staticFile('reel/voice.wav')} />
      <Audio src={staticFile('sfx/m_bed.wav')} volume={0.11} />
      {jet1 > jet0 && <Sequence from={Math.round(jet0 * fps)} durationInFrames={Math.round((jet1 - jet0 + 0.8) * fps)}><Audio src={staticFile('sfx/m_jet.wav')} loop volume={0.13} /></Sequence>}
      {rain1 > rain0 && <Sequence from={Math.round(rain0 * fps)} durationInFrames={Math.round((rain1 - rain0 + 0.5) * fps)}><Audio src={staticFile('sfx/m_rain.wav')} loop volume={0.14} /></Sequence>}
      {sfx.map((s, k) => <Sfx key={k} {...s} />)}
    </AbsoluteFill>
  );
};
