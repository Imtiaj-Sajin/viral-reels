import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadMarker} from '@remotion/google-fonts/PermanentMarker';
import {loadFont as loadType} from '@remotion/google-fonts/SpecialElite';
import {loadFont as loadHand} from '@remotion/google-fonts/Caveat';
import {Mood} from './Presenter';
import {HostR1} from './HostR1';
import {INTER, SERIF, MONO, Line, Word, wordAt, useT, sp, clamp, money, Roll, Lock, screensOf, Captions, SceneIn, Sfx} from './Explainer';

const {fontFamily: MARKER} = loadMarker();
const {fontFamily: TYPE} = loadType();
const {fontFamily: HAND} = loadHand('normal', {weights: ['500', '700']});

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
        {label && <div style={{fontFamily: TYPE, fontSize: label.startsWith('photo:') ? 19 : 27, color: '#2a241c', marginTop: 10, letterSpacing: 0.5, opacity: label.startsWith('photo:') ? 0.6 : 1}}>{label}</div>}
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
      <Photo src="sketch_face.jpg" x={250} y={500} w={580} h={660} rot={-2.5} dur={dur + 4} z={[1.0, 1.1]} ox="50% 40%" sepia={0.25} />
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
        <div style={{textAlign: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 70, color: M.fg, marginTop: -6, transform: 'rotate(-4deg)'}}>years.</div>
        <div style={{marginTop: 60, textAlign: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 84, color: M.red, transform: 'rotate(3deg)', opacity: interpolate(t, [nm, nm + 0.3], [0, 1], clamp)}}>
          name: ???</div>
      </div>
    </>
  );
};

const ClueLockedScene: React.FC<SP> = () => {
  const {t} = useT();
  const glow = 0.5 + 0.5 * Math.sin(t * 4);
  const sway = Math.sin(t * 1.6) * 1.2;
  return (
    <div style={{position: 'absolute', left: 170, top: 520, width: 740, height: 800, transform: `rotate(${-3 + sway}deg)`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.12))', boxShadow: '0 40px 90px rgba(0,0,0,0.75)'}}>
        <Img src={IMG('money.jpg')} style={{position: 'absolute', left: 50, top: 120, width: 640, height: 440, objectFit: 'cover', filter: 'blur(20px) brightness(0.55) sepia(0.5)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, background: 'rgba(214,52,40,0.92)', borderBottom: '4px solid #8f1f17'}} />
        <div style={{position: 'absolute', left: 60, right: 60, bottom: 54, height: 160, background: '#f4efe4', borderRadius: 6, padding: '14px 28px', transform: 'rotate(-1deg)'}}>
          <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 68, color: '#1d2a5c', lineHeight: 1}}>found · 1980</div>
          <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 52, color: M.red, lineHeight: 1.1}}>open at the end</div>
        </div>
        <div style={{position: 'absolute', left: -240 + ((t * 170) % 1400), top: -120, width: 110, height: 1200, background: 'rgba(255,255,255,0.10)', transform: 'rotate(22deg)'}} />
      </div>
      <div style={{position: 'absolute', left: 300, top: 270, width: 140, height: 140, borderRadius: 70, background: M.red, display: 'flex', alignItems: 'center',
        justifyContent: 'center', boxShadow: `0 0 ${40 + 30 * glow}px rgba(255,75,56,0.65)`, transform: `scale(${1 + 0.05 * glow})`}}><Lock size={74} /></div>
    </div>
  );
};

const TicketScene: React.FC<SP> = ({ls, t0, dur}) => {
  const tw = rel(wordAt(ls[0], 'twenty-dollar', 3), t0), co = rel(wordAt(ls[0], 'cooper', 5), t0);
  return (
    <Photo src="ticket_crop.jpg" x={60} y={560} w={960} h={594} rot={-1.5} dur={dur} z={[1.0, 1.04]} sepia={0.1}>
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
        {np > 0 && <g transform={`translate(${seatX(4) + SW / 2 + np * 60} ${Y0 + 5 * (SH + 22) + SH / 2 + np * 108}) rotate(${-10 + np * 20})`}>
          <rect x={-34} y={-24} width={68} height={48} rx={4} fill="#fbf7ee" stroke="#c9bfa8" strokeWidth={2} />
          <path d="M -24 -8 L 20 -8 M -24 4 L 14 4" stroke="#555" strokeWidth={3} /></g>}
        <text x={250} y={800} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={56} fill={M.red} transform="rotate(-4 250 800)">18E</text>
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
    </svg>
  );
};

const DemandsScene: React.FC<SP> = ({ls, t0}) => {
  const {t, f, fps} = useT();
  const a = rel(wordAt(ls[0], 'thousand', 1.2), t0) - 0.3, b = rel(wordAt(ls[0], 'parachutes', 2.2), t0) - 0.2;
  const items: [string, number][] = [['$200,000', a], ['4 parachutes', b], ['fuel trucks', b + 0.9]];
  return (
    <div style={{position: 'absolute', left: 150, top: 520, width: 780, height: 700, transform: 'rotate(2deg)', background: '#f6e98f', overflow: 'hidden',
      backgroundImage: 'repeating-linear-gradient(transparent 0 118px, rgba(70,110,170,0.35) 118px 121px)', backgroundPosition: '0 40px',
      boxShadow: '0 30px 70px rgba(0,0,0,0.6)', padding: '60px 60px 30px 120px'}}>
      <div style={{position: 'absolute', left: 92, top: 0, bottom: 0, width: 3, background: 'rgba(220,60,60,0.6)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 34, background: '#b5973f'}} />
      <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 60, color: '#2a3470', height: 120, display: 'flex', alignItems: 'center'}}>he wants:</div>
      {items.map(([txt, at], k) => {
        const on = t >= at;
        const ck = sp(f, fps, at, {damping: 10, stiffness: 260, mass: 0.5});
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 22, height: 121, fontFamily: HAND, fontWeight: 700, fontSize: 92, color: '#1d2a5c'}}>
            <span style={{color: M.red, width: 64, opacity: on ? 1 : 0, transform: `scale(${on ? 0.5 + 0.5 * ck : 0}) rotate(-8deg)`, display: 'inline-block'}}>✓</span>
            <Typed text={txt} from={at} cps={20} />
          </div>
        );
      })}
    </div>
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
      <div style={{position: 'absolute', top: 1100, left: 90, width: 900, height: 150, background: '#111', border: '2px solid #333', borderRadius: 10, overflow: 'hidden',
        opacity: strip, transform: `translateY(${(1 - strip) * 40}px)`}}>
        <div style={{display: 'flex', gap: 34, padding: '0 20px', height: '100%', alignItems: 'center', transform: `translateX(${-((t - ser) * 220) % 400}px)`}}>
          {Array.from({length: 12}).map((_, k) => (
            <div key={k} style={{fontFamily: MONO, fontSize: 30, color: '#e8e2d4', whiteSpace: 'nowrap', padding: '10px 14px', border: '2px solid #444'}}>
              L{String(10000000 + ((k * 7919) % 89999999)).slice(0, 8)}A</div>
          ))}
        </div>
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
    <div style={{position: 'absolute', left: 590, top: y, fontFamily: HAND, fontWeight: 700, fontSize: 70, color: M.red, whiteSpace: 'nowrap', textShadow: '0 3px 0 rgba(0,0,0,0.45)',
      opacity: interpolate(t, [at, at + 0.2], [0, 1], clamp), transform: `rotate(-4deg) translateX(${interpolate(t, [at, at + 0.3], [30, 0], clamp)}px)`}}>{txt}</div>
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
        <g transform={`translate(${px} ${py}) rotate(${ang})`}>
          <path d="M 0 -30 L 6 -6 L 30 6 L 30 12 L 6 6 L 4 22 L 12 28 L 12 32 L 0 28 L -12 32 L -12 28 L -4 22 L -6 6 L -30 12 L -30 6 L -6 -6 Z" fill={M.fg} />
        </g>
      </svg>
      {chip('Mexico City?', mx, 520)}
      {chip('10,000 ft', low, 610)}
      {chip('~100 knots', slow, 700)}
      {chip('gear down', gear, 790)}
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
        label="photo: R. Rynerson · CC BY 2.5">
        {fall > 0 && fall < 1 && <svg width={904} height={600} style={{position: 'absolute', left: 0, top: 0}}>
          <g transform={`translate(${560 + fall * 120} ${330 + fall * 340}) rotate(${fall * 160})`}>
            <circle cx={0} cy={-34} r={14} fill="#050505" /><rect x={-14} y={-20} width={28} height={50} rx={10} fill="#050505" />
          </g></svg>}
        <AbsoluteFill style={{background: '#fff', opacity: flash, mixBlendMode: 'overlay'}} />
      </Photo>
      <StampM text="8:13 PM" at={lw} x={800} y={600} rot={8} size={58} color={M.amber} />
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
      </svg>
      <StampM text="NO BODY" at={at[0]} x={320} y={700} rot={-8} size={66} />
      <StampM text="NO CHUTE" at={at[1]} x={760} y={870} rot={7} size={66} />
      <StampM text="$0 SPENT" at={at[2]} x={450} y={1050} rot={-4} size={78} color={M.amber} />
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
      <Photo src="money.jpg" x={70} y={520} w={940} h={560} rot={1.5} dur={dur} z={[1.0, 1.15]} ox="45% 45%" sepia={0.15} />
      <div style={{position: 'absolute', top: 1190, left: 0, right: 0, opacity: t > six - 0.6 ? 1 : 0}}><Roll text="$5,800" at={six} size={120} color={M.red} /></div>
      <div style={{position: 'absolute', top: 1310, left: 0, right: 0, textAlign: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 64, color: M.fg,
        transform: 'rotate(-3deg)', opacity: interpolate(t, [rb, rb + 0.3], [0, 1], clamp)}}>still in rubber bands</div>
      <Flash at={0.05} />
    </AbsoluteFill>
  );
};

const RiverScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
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
      <text x={760} y={430} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={50} fill={M.amber}>he landed here?</text>
      <path d="M 60 640 C 300 560 460 720 700 660 C 860 620 960 700 1020 680" fill="none" stroke="#2f6f9c" strokeWidth={70} opacity={0.85} />
      <text x={820} y={770} fontFamily={MONO} fontSize={24} fill="#7fb4d8">COLUMBIA RIVER</text>
      <path d="M 660 340 C 560 440 380 520 300 600" fill="none" stroke={M.fg} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={0}
        style={{strokeDasharray: `${dash * 500} 2000`}} />
      <g transform="translate(290 590)"><path d="M 0 0 C -34 -34 -34 -80 0 -80 C 34 -80 34 -34 0 0 Z" fill={M.red} /><circle cx={0} cy={-52} r={12} fill="#fff" /></g>
      <text x={290} y={650} textAnchor="middle" fontFamily={MONO} fontSize={26} fill={M.fg}>TENA BAR</text>
      <text x={470} y={470} fontFamily={SERIF} fontStyle="italic" fontSize={150} fill={M.red} opacity={dash > 0.9 ? q : 0}>?</text>
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
      <StampM text="NEVER RECOVERED" at={nv} x={540} y={950} rot={-6} size={66} />
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

/* ---------------- film chrome ---------------- */

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.09, mixBlendMode: 'screen'}}>
      <svg width={1080} height={1920}><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 9} /></filter>
        <rect width={1080} height={1920} filter="url(#g)" /></svg>
    </AbsoluteFill>
  );
};

/* ---------------- the evidence board ---------------- */

const STEP_X = 1420, STEP_Y = 1980, COLS = 3;
type Slot = {x: number; y: number; r: number};
const layoutSlots = (n: number): Slot[] => Array.from({length: n}).map((_, s) => {
  const row = Math.floor(s / COLS), c = s % COLS, col = row % 2 ? COLS - 1 - c : c;
  return {x: col * STEP_X + (row % 2 ? 110 : 0), y: row * STEP_Y + (col % 2 ? 240 : 0), r: (((s * 37) % 7) - 3) * 0.55};
});
const easeIO = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const c01 = (v: number) => Math.max(0, Math.min(1, v));

const NOTES = ['Flight 305', 'seat 18E', '$200,000', '4 parachutes', '8:13 PM', 'Nov 24, 1971', 'who was he?', 'Reno?', 'Tena Bar', '$5,800',
  'Dan Cooper??', 'never spent', 'no body', 'Mexico City?', 'bourbon & 7-Up', '1971 - 2016'];
const HEADS = ['HIJACKER BAILS OUT WITH $200,000', 'NO TRACE OF JET HIJACKER', 'SEARCH TEAMS COMB WOODS', 'BOY FINDS RANSOM CASH', 'CASE STILL OPEN'];

const PushPin: React.FC<{x: number; y: number; c?: string}> = ({x, y, c = '#d83a2e'}) => (
  <div style={{position: 'absolute', left: x - 17, top: y - 17, width: 34, height: 34, borderRadius: 17,
    background: `radial-gradient(circle at 35% 30%, #fff 0 10%, ${c} 26%, #6e140d 100%)`, boxShadow: '4px 8px 8px rgba(0,0,0,0.55)'}} />
);

const IndexCard: React.FC<{x: number; y: number; r: number; text: string}> = ({x, y, r, text}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 380, height: 230, transform: `rotate(${r}deg)`, background: '#f2ead6', padding: '58px 28px 0',
    backgroundImage: 'repeating-linear-gradient(transparent 0 44px, rgba(90,120,170,0.32) 44px 46px)', backgroundPosition: '0 30px',
    boxShadow: '0 22px 44px rgba(0,0,0,0.6)'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 46, height: 3, background: 'rgba(220,70,70,0.6)'}} />
    <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 66, color: '#1d2a5c', lineHeight: 1.05}}>{text}</div>
    <PushPin x={190} y={18} c="#2e6bd8" />
  </div>
);

const Clipping: React.FC<{x: number; y: number; r: number; head: string}> = ({x, y, r, head}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 440, padding: '26px 28px 30px', transform: `rotate(${r}deg)`, background: '#ddd5c2',
    boxShadow: '0 22px 44px rgba(0,0,0,0.6)', clipPath: 'polygon(0 2%, 8% 0, 22% 3%, 40% 0, 63% 2%, 80% 0, 100% 3%, 99% 97%, 84% 100%, 60% 97%, 38% 100%, 15% 97%, 1% 100%)'}}>
    <div style={{fontFamily: SERIF, fontSize: 44, lineHeight: 1.02, color: '#1b1a17', letterSpacing: -0.5}}>{head}</div>
    <div style={{display: 'flex', gap: 14, marginTop: 16}}>
      {[0, 1].map((c) => <div key={c} style={{flex: 1}}>{Array.from({length: 7}).map((_, k) => (
        <div key={k} style={{height: 7, margin: '9px 0', background: 'rgba(30,28,24,0.35)', width: `${86 + ((k * 13 + c * 7) % 14)}%`}} />))}</div>)}
    </div>
  </div>
);

const Decor: React.FC<{slots: Slot[]}> = ({slots}) => (
  <>
    {slots.map((S, s) => (
      <React.Fragment key={s}>
        <div style={{position: 'absolute', left: S.x - 500, top: S.y + 200, width: 2100, height: 1700, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(233,184,106,0.06), transparent)'}} />
        <IndexCard x={S.x + 1120} y={S.y + 560 + (s % 3) * 250} r={((s * 53) % 9 - 4) * 1.6} text={NOTES[s % NOTES.length]} />
        <Clipping x={S.x - 430} y={S.y + 1250 - (s % 2) * 560} r={((s * 29) % 7 - 3) * 1.4} head={HEADS[s % HEADS.length]} />
        <div style={{position: 'absolute', left: S.x + 1150, top: S.y + 1480, width: 230, height: 230, borderRadius: 115,
          border: '14px solid rgba(110,70,30,0.22)', boxShadow: 'inset 0 0 18px rgba(110,70,30,0.2)'}} />
      </React.Fragment>
    ))}
  </>
);

const pinOf = (S: Slot) => ({x: S.x + 540, y: S.y + 440});

const Strings: React.FC<{slots: Slot[]; upto: number; prog: number}> = ({slots, upto, prog}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
    {slots.slice(1, upto + 1).map((S, j) => {
      const a = pinOf(slots[j]), b = pinOf(S);
      const d = Math.hypot(b.x - a.x, b.y - a.y), sag = 0.12 * d;
      const path = `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + sag} ${b.x} ${b.y}`;
      const L = d * 1.08, pr = j + 1 < upto ? 1 : prog;
      return (
        <g key={j}>
          <path d={path} stroke="rgba(0,0,0,0.45)" strokeWidth={7} fill="none" strokeDasharray={L} strokeDashoffset={L * (1 - pr)} transform="translate(6 10)" />
          <path d={path} stroke="#c42a26" strokeWidth={5} fill="none" strokeDasharray={L} strokeDashoffset={L * (1 - pr)} />
        </g>
      );
    })}
  </svg>
);

/* ---------------- cover ---------------- */
const Cover2: React.FC<{lines: string[]}> = ({lines}) => {
  const zeros = Array.from({length: 120}, () => 0);
  return (
    <AbsoluteFill style={{background: M.bg}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(233,184,106,0.13) 2px, transparent 2.6px)', backgroundSize: '26px 26px'}} />
      <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 45%, rgba(233,184,106,0.16), transparent 70%)'}} />
      <div style={{position: 'absolute', top: 300, left: 70, right: 70, fontFamily: INTER, fontWeight: 800, fontSize: 104, lineHeight: 1.0, color: M.fg, letterSpacing: -3}}>
        {lines.map((l, k) => <div key={k} style={k >= 2 ? {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: M.red, fontSize: 128, letterSpacing: 0} : {}}>{l}</div>)}
      </div>
      <div style={{position: 'absolute', inset: 0, top: 300}}>
        <Photo src="sketch_face.jpg" x={150} y={560} w={430} h={500} rot={-4} dur={10} z={[1.0, 1.0]} ox="50% 40%" sepia={0.25} />
        <StampM text="UNSOLVED" at={0} instant x={470} y={680} rot={12} size={56} />
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)'}} />
      <HostR1 mood="shocked" prevMood="shocked" moodAt={-1} gesture="point" gestureFrom={-2} gestureTo={99} mouth={zeros} x={760} y={1990} scale={0.82} id="cov" />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------------- composition ---------------- */
type Props = {duration: number; lines: (Line & {nopresenter?: boolean})[]; mouth: number[]; cover?: string[]; coverMode?: boolean};
const TINT: Record<string, string> = {
  ticket: '#ffb45a', seat: '#ffb45a', purse: '#ffb45a', note: '#ffb45a', briefcase: '#ff7a4a', demands: '#ffb45a', money: '#ffcf73',
  flightmap: '#4d7cff', jump: '#3f6dff', black: '#3f6dff', search: '#4d8cff', dummy: '#5a7dff',
  money_found: '#ffcf73', river: '#ffcf73', missing: '#ff6a4a',
};

export const Mystery2: React.FC<Props> = (props) => {
  const {duration, lines, mouth} = props;
  const {fps} = useVideoConfig();
  const f = useCurrentFrame();
  const t = f / fps;
  if (props.coverMode && props.cover) return <Cover2 lines={props.cover} />;

  // scene blocks
  const blocks: {scene: string; lines: typeof lines; start: number; end: number}[] = [];
  lines.forEach((ln) => {
    const last = blocks[blocks.length - 1];
    if (last && last.scene === ln.scene) last.lines.push(ln); else blocks.push({scene: ln.scene, lines: [ln], start: 0, end: 0});
  });
  blocks.forEach((b, k) => { b.start = k === 0 ? 0 : b.lines[0].start - 0.12; b.end = k + 1 < blocks.length ? blocks[k + 1].lines[0].start - 0.12 : duration; });

  // board slots (a black beat holds the camera on the previous slot)
  const slotOf: number[] = [];
  let sc = -1;
  blocks.forEach((b, k) => { if (k === 0 || b.scene !== 'black') sc++; slotOf.push(sc); });
  const slots = layoutSlots(sc + 1);

  // camera
  const TR = 0.62;
  let k = 0;
  blocks.forEach((b, i) => { if (b.start <= t) k = i; });
  const to = slots[slotOf[k]], from = k > 0 ? slots[slotOf[k - 1]] : to;
  const moving = k > 0 && slotOf[k] !== slotOf[k - 1];
  const p = moving ? c01((t - blocks[k].start) / TR) : 1;
  const e = easeIO(p), v = moving ? Math.sin(Math.PI * p) : 0;
  const cam = {x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, r: from.r + (to.r - from.r) * e};
  const bk = blocks[k];
  const push = 1 + 0.045 * c01((t - bk.start) / Math.max(1, bk.end - bk.start));
  const zoom = push * (1 - 0.17 * v);
  const dutch = v * 2.6 * (k % 2 ? 1 : -1) - cam.r * 0.7;
  const hx = Math.sin(t * 0.83) * 5 + Math.sin(t * 2.1) * 2, hy = Math.cos(t * 0.67) * 4;
  const blur = v * 9;

  // grade
  const tintNow = TINT[bk.scene] ?? '#ffcf8a', tintPrev = k > 0 ? (TINT[blocks[k - 1].scene] ?? '#ffcf8a') : tintNow;
  const tmix = c01((t - bk.start) / 0.7);

  const cur = [...lines].reverse().find((l) => l.start - 0.12 <= t) ?? lines[0];
  const ci = lines.indexOf(cur);
  const prevMood = ((ci > 0 ? lines[ci - 1].mood : 'neutral') ?? 'neutral') as Mood;
  const gLine = cur.gesture ? cur : (ci > 0 && lines[ci - 1].gesture && t < lines[ci - 1].end + 0.5 ? lines[ci - 1] : undefined);
  const noCap = lines.filter((l) => l.nopresenter);
  const screens = screensOf(lines, duration).filter((s) => !noCap.some((l) => s.start >= l.start - 0.05 && s.start <= l.end));
  const blackB = blocks.find((b) => b.scene === 'black');
  const jumpB = blocks.find((b) => b.scene === 'jump');
  const inBlack = !!blackB && t >= blackB.start && t < blackB.end;
  const blackO = blackB ? interpolate(t, [blackB.start, blackB.start + 0.25, blackB.end - 0.3, blackB.end], [0, 1, 1, 0], clamp) : 0;
  const rainOn = jumpB && blackB ? interpolate(t, [jumpB.start, jumpB.start + 0.5, blackB.end - 0.2, blackB.end + 0.6], [0, 1, 1, 0], clamp) : 0;
  const flashes = jumpB ? [jumpB.start + 0.7, jumpB.start + 0.85, jumpB.start + 3.4] : [];
  const lightning = flashes.reduce((acc, a) => Math.max(acc, interpolate(t, [a, a + 0.03, a + 0.22], [0, 0.55, 0], clamp)), 0);

  // sound
  const sfx: {at: number; name: string; vol?: number}[] = [];
  blocks.forEach((b, i) => { if (i > 0 && slotOf[i] !== slotOf[i - 1]) sfx.push({at: b.start, name: 'whoosh', vol: 0.26}); });
  const L = (s: string) => lines.find((l) => l.scene === s);
  if (L('hook')) sfx.push({at: 0, name: 'm_stamp', vol: 0.5}, {at: wordAt(L('hook'), 'jumped', 4), name: 'm_boom', vol: 0.7});
  if (L('clue_locked')) sfx.push({at: L('clue_locked')!.start + 0.1, name: 'm_sting', vol: 0.35});
  if (L('ticket')) { sfx.push({at: wordAt(L('ticket'), 'twenty-dollar', 3), name: 'm_paper', vol: 0.4}, {at: wordAt(L('ticket'), 'cooper', 5), name: 'm_paper', vol: 0.4}); }
  if (L('seat')) sfx.push({at: wordAt(L('seat'), 'note', 2.5) - 0.3, name: 'm_paper', vol: 0.45});
  if (L('purse')) sfx.push({at: L('purse')!.start + 0.6, name: 'thud', vol: 0.25});
  if (L('note')) { const s0 = L('note')!.start; for (let x = s0 + 0.15; x < s0 + 2.2; x += 0.09) sfx.push({at: x, name: 'm_key', vol: 0.12}); sfx.push({at: wordAt(L('note'), 'bomb', 2.6), name: 'm_boom', vol: 0.6}); }
  if (L('briefcase')) sfx.push({at: wordAt(L('briefcase'), 'wires', 1.8), name: 'beep', vol: 0.18});
  if (L('demands')) { sfx.push({at: wordAt(L('demands'), 'thousand', 1.2) - 0.3, name: 'check', vol: 0.3}, {at: wordAt(L('demands'), 'parachutes', 2.2) - 0.2, name: 'check', vol: 0.3}); }
  if (L('money')) sfx.push({at: wordAt(L('money'), 'serial', 2.6), name: 'm_sting', vol: 0.25});
  if (L('jump')) { sfx.push({at: wordAt(L('jump'), 'lowers', 4), name: 'm_stamp', vol: 0.35}, {at: wordAt(L('jump'), 'jumps', 6) - 0.1, name: 'm_wind', vol: 0.7}); }
  flashes.slice(0, 1).concat(flashes.slice(2)).forEach((a) => sfx.push({at: a + 0.15, name: 'm_boom', vol: 0.4}));
  if (blackB) sfx.push({at: blackB.start - 1.9, name: 'm_riser', vol: 0.35}, {at: blackB.start, name: 'm_boom', vol: 0.8});
  if (L('search')) ['body', 'parachute', 'spent'].forEach((w, i) => sfx.push({at: wordAt(L('search'), w, 0.8 + i * 1.1), name: 'm_stamp', vol: 0.4}));
  if (L('dummy')) { sfx.push({at: wordAt(L('dummy'), 'dummy', 1.4) + 0.3, name: 'm_stamp', vol: 0.45}, {at: wordAt(L('dummy'), 'vanished', 3) + 0.2, name: 'm_stamp', vol: 0.4}); }
  if (L('money_found')) sfx.push({at: L('money_found')!.start + 0.05, name: 'm_sting', vol: 0.45}, {at: L('money_found')!.start + 0.1, name: 'ding', vol: 0.3});
  if (L('missing')) sfx.push({at: L('missing')!.start + 0.4, name: 'tick', vol: 0.15}, {at: wordAt(L('missing'), 'never', 1.6), name: 'm_stamp', vol: 0.5});
  if (L('closed')) { sfx.push({at: wordAt(L('closed'), '2016', 0.3) + 0.3, name: 'm_stamp', vol: 0.35}, {at: wordAt(L('closed'), 'unsolved', 3.4), name: 'm_stamp', vol: 0.6}); }
  if (L('cta')) sfx.push({at: wordAt(L('cta'), 'follow', 3.5) + 0.25, name: 'check', vol: 0.3});
  const jet0 = L('ticket')?.start ?? 0, jet1 = L('jump')?.start ?? 0;

  // dotted board patch that follows the camera (dots fixed in board space)
  const gx = Math.floor((cam.x - 900) / 26) * 26, gy = Math.floor((cam.y - 1100) / 26) * 26;

  return (
    <AbsoluteFill style={{background: '#100d0b'}}>
      {/* board, seen through the camera */}
      <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(540px, 960px) rotate(${dutch}deg) scale(${zoom}) translate(${-540 + hx}px, ${-960 + hy}px)`,
        filter: blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : 'none'}}>
        <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${-cam.x}px, ${-cam.y}px)`}}>
          <div style={{position: 'absolute', left: gx, top: gy, width: 2900, height: 4100,
            backgroundImage: 'radial-gradient(rgba(233,184,106,0.13) 2px, transparent 2.6px)', backgroundSize: '26px 26px'}} />
          <Decor slots={slots} />
          <Strings slots={slots} upto={slotOf[k]} prog={moving ? e : 1} />
          {blocks.map((b, i) => {
            if (b.scene === 'black') return null;
            const Comp = SCENES[b.scene];
            if (!Comp) return null;
            const S = slots[slotOf[i]];
            const nextBlack = blocks[i + 1]?.scene === 'black' ? blocks[i + 1].end - blocks[i + 1].start : 0;
            const tail = TR + 0.4 + nextBlack;
            const kicks = b.lines.flatMap((l) => l.words.filter((w) => w.hl).map((w) => w.start - b.start));
            return (
              <div key={i} style={{position: 'absolute', left: S.x, top: S.y, width: 1080, height: 1920, transform: `rotate(${S.r}deg)`, transformOrigin: '540px 900px'}}>
                <Sequence from={Math.round(b.start * fps)} durationInFrames={Math.max(1, Math.round((b.end - b.start + tail) * fps))} layout="none">
                  <AbsoluteFill><SceneIn kicks={kicks} instant><Comp ls={b.lines} t0={b.start} dur={b.end - b.start} /></SceneIn></AbsoluteFill>
                </Sequence>
              </div>
            );
          })}
          {slots.slice(0, slotOf[k] + 1).map((S, j) => { const q = pinOf(S); return <PushPin key={j} x={q.x} y={q.y} />; })}
        </div>
      </AbsoluteFill>

      {/* light + grade */}
      <AbsoluteFill style={{background: tintPrev, opacity: 0.13 * (1 - tmix), mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: tintNow, opacity: 0.13 * tmix, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: 'radial-gradient(62% 40% at 50% 46%, rgba(255,214,150,0.10), transparent 70%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.78) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(8,6,5,0.82) 0%, rgba(8,6,5,0.55) 12%, transparent 24%)'}} />
      {rainOn > 0 && <AbsoluteFill style={{opacity: rainOn}}><Rain strength={1.2} /></AbsoluteFill>}
      {lightning > 0 && <AbsoluteFill style={{background: '#dfe8ff', opacity: lightning}} />}

      {/* "never seen again" beat */}
      {blackB && blackO > 0 && (
        <AbsoluteFill style={{opacity: blackO}}>
          <Sequence from={Math.round(blackB.start * fps)} durationInFrames={Math.round((blackB.end - blackB.start) * fps)} layout="none">
            <BlackScene ls={blackB.lines} t0={blackB.start} dur={blackB.end - blackB.start} />
          </Sequence>
        </AbsoluteFill>
      )}

      {/* host */}
      {!inBlack && <>
        <AbsoluteFill style={{background: 'radial-gradient(36% 18% at 55% 92%, rgba(255,210,150,0.22), transparent 75%)'}} />
        <HostR1 mood={(cur.mood ?? 'neutral') as Mood} prevMood={prevMood} moodAt={cur.start - 0.1} gesture={gLine?.gesture ?? 'none'}
          gestureFrom={gLine ? gLine.start : 0} gestureTo={gLine ? gLine.end - 0.1 : 0} mouth={mouth} x={590} y={1990} scale={0.8} />
      </>}
      <Captions screens={screens} themeAt={() => THEME} />
      <Grain />

      <Audio src={staticFile('reel/voice.wav')} />
      <Audio src={staticFile('sfx/m_bed.wav')} volume={0.11} />
      {jet1 > jet0 && <Sequence from={Math.round(jet0 * fps)} durationInFrames={Math.round((jet1 - jet0 + 0.8) * fps)}><Audio src={staticFile('sfx/m_jet.wav')} loop volume={0.13} /></Sequence>}
      {jumpB && blackB && <Sequence from={Math.round(jumpB.start * fps)} durationInFrames={Math.round((blackB.end - jumpB.start + 0.6) * fps)}><Audio src={staticFile('sfx/m_rain.wav')} loop volume={0.14} /></Sequence>}
      {sfx.map((x, i) => <Sfx key={i} {...x} />)}
    </AbsoluteFill>
  );
};
