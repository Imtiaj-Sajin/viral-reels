import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {Presenter, Mood, Gesture} from './Presenter';

export const {fontFamily: INTER} = loadInter('normal', {weights: ['500', '600', '700', '800'], subsets: ['latin']});
export const {fontFamily: SERIF} = loadSerif('italic', {weights: ['400'], subsets: ['latin']});
export const {fontFamily: MONO} = loadMono('normal', {weights: ['500', '700'], subsets: ['latin']});

export const K = {
  paper: '#f2efe9', ink: '#121214', red: '#f0412f', cobalt: '#2d5bff', green: '#16b06a', mute: '#8b8780',
  card: '#ffffff', line: 'rgba(18,18,20,0.10)',
};
export const BG: Record<string, {bg: string; fg: string; mute: string; hl: string}> = {
  paper: {bg: K.paper, fg: K.ink, mute: K.mute, hl: K.red},
  red: {bg: K.red, fg: '#fff', mute: 'rgba(255,255,255,0.7)', hl: K.ink},
  ink: {bg: K.ink, fg: '#fff', mute: 'rgba(255,255,255,0.55)', hl: K.red},
};

export type Word = {w: string; start: number; end: number; hl: boolean};
export type Line = {i: number; text: string; start: number; end: number; words: Word[]; scene: string; section?: string; mood?: Mood;
  gesture?: Gesture; tally?: number; bg?: string};
type Props = {duration: number; lines: Line[]; mouth: number[]; tally_label?: string; episode?: number; cover?: string[]};

export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
export const wordAt = (ln: Line | undefined, w: string, fb = 0) => {
  if (!ln) return fb;
  const hit = ln.words.find((x) => norm(x.w).startsWith(norm(w)));
  return hit ? hit.start : ln.start + fb;
};
export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, t: f / fps};
};
export const sp = (f: number, fps: number, at: number, c = {damping: 14, stiffness: 170, mass: 0.7}) => spring({frame: f - at * fps, fps, config: c});
export const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const money = (v: number, dec = 0) => '$' + v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec});

/* ---------------- primitives ---------------- */

export const Card: React.FC<{children: React.ReactNode; x?: number; y: number; w?: number; rot?: number; pad?: number; dark?: boolean; style?: React.CSSProperties}> =
  ({children, x, y, w = 860, rot = 0, pad = 40, dark, style}) => (
    <div style={{position: 'absolute', left: x ?? (1080 - w) / 2, top: y, width: w, padding: pad, borderRadius: 34,
      background: dark ? '#17171b' : K.card, transform: `rotate(${rot}deg)`, color: dark ? '#e9e6df' : K.ink,
      boxShadow: '0 2px 0 rgba(0,0,0,0.04), 0 28px 60px rgba(30,20,10,0.16)', border: dark ? '1px solid #2a2a30' : `1px solid ${K.line}`,
      fontFamily: INTER, ...style}}>{children}</div>
  );

export const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 26, color = K.mute, style}) => (
  <span style={{fontFamily: MONO, fontSize: size, color, letterSpacing: 1, ...style}}>{children}</span>
);

export const Stamp: React.FC<{text: string; at: number; color: string; x: number; y: number; rot?: number; size?: number}> = ({text, at, color, x, y, rot = -8, size = 58}) => {
  const {t, f, fps} = useT();
  if (t < at) return null;
  const s = sp(f, fps, at, {damping: 9, stiffness: 260, mass: 0.6});
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${2 - s})`, opacity: Math.min(1, s * 1.6),
      fontFamily: INTER, fontWeight: 800, fontSize: size, color, letterSpacing: 1, border: `6px solid ${color}`, borderRadius: 16,
      padding: '4px 22px', background: 'rgba(255,255,255,0.88)', whiteSpace: 'nowrap'}}>{text}</div>
  );
};

/* slot-machine number */
export const Roll: React.FC<{text: string; at: number; size: number; color: string; stagger?: number}> = ({text, at, size, color, stagger = 0.05}) => {
  const {t} = useT();
  return (
    <div style={{display: 'flex', justifyContent: 'center', fontFamily: INTER, fontWeight: 800, fontSize: size, color, lineHeight: 1,
      letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>
      {text.split('').map((ch, k) => {
        if (!/[0-9]/.test(ch)) return <span key={k}>{ch}</span>;
        const land = at + k * stagger;
        const p = interpolate(t, [land - 0.55, land], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        const target = +ch, spins = 2;
        const pos = (target + 10 * spins) * p;
        return (
          <span key={k} style={{display: 'inline-block', height: size, overflow: 'hidden', position: 'relative', width: size * 0.6}}>
            <span style={{position: 'absolute', left: 0, top: 0, transform: `translateY(${-pos * size}px)`, filter: p < 1 ? `blur(${(1 - p) * 3}px)` : 'none'}}>
              {Array.from({length: 10 * (spins + 1)}).map((_, d) => <div key={d} style={{height: size}}>{d % 10}</div>)}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const Lock: React.FC<{open?: number; size?: number; color?: string}> = ({open = 0, size = 30, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{verticalAlign: 'middle'}}>
    <path d={`M7 11 V8 a5 5 0 0 1 10 0 ${open > 0.5 ? 'V6' : 'V11'}`} transform={open > 0.5 ? 'translate(5 -2)' : ''} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    <rect x={4.5} y={11} width={15} height={10} rx={2.5} fill={color} />
  </svg>
);

/* ---------------- layout chrome ---------------- */

const Header: React.FC<{section: string; tally?: number; from?: number; label: string; theme: typeof BG.paper; tallyAt: number}> = ({section, tally, from = 0, label, theme, tallyAt}) => {
  const {t} = useT();
  return (
    <div style={{position: 'absolute', top: 70, left: 72, right: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <Mono color={theme.mute}>// {section}</Mono>
      {tally !== undefined && <Mono color={theme.mute}>{label} <span style={{color: theme.hl === K.ink ? '#fff' : K.red, fontWeight: 700}}>
        {money(Math.round(from + interpolate(t, [tallyAt, tallyAt + 0.8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}) * (tally - from)))}</span></Mono>}
    </div>
  );
};

const PromptPill: React.FC<{unlockAt: number; theme: typeof BG.paper}> = ({unlockAt, theme}) => {
  const {t} = useT();
  const p = Math.min(1, t / unlockAt), done = t >= unlockAt;
  return (
    <div style={{position: 'absolute', top: 118, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 22px', borderRadius: 999,
        background: done ? K.green : 'rgba(18,18,20,0.08)', border: `1.5px solid ${done ? K.green : 'rgba(18,18,20,0.12)'}`}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: done ? K.green : 'rgba(240,65,47,0.18)'}} />
        <span style={{position: 'relative'}}><Lock open={done ? 1 : 0} size={24} color={done ? '#fff' : theme.fg} /></span>
        <Mono size={24} color={done ? '#fff' : theme.fg} style={{position: 'relative'}}>{done ? 'the prompt · unlocked' : 'the prompt · at the end'}</Mono>
      </div>
    </div>
  );
};

/* captions: sentence builds word by word, top-left; one screen per sentence */
export type Screen = {words: Word[]; start: number; end: number};
export const screensOf = (lines: Line[], total: number): Screen[] => {
  const out: Screen[] = [];
  lines.forEach((ln) => {
    let cur: Word[] = [];
    ln.words.forEach((w, k) => {
      cur.push(w);
      const endS = /[.?!]$/.test(w.w) || k === ln.words.length - 1;
      if (endS) { out.push({words: cur, start: cur[0].start, end: 0}); cur = []; }
    });
  });
  out.forEach((s, k) => { s.end = k + 1 < out.length ? out[k + 1].start - 0.02 : total; });
  return out;
};
export const Captions: React.FC<{screens: Screen[]; themeAt: (t: number) => typeof BG.paper}> = ({screens, themeAt}) => {
  const {t, f, fps} = useT();
  const sc = screens.find((s, k) => (t >= s.start - 0.08 || (k === 0)) && t < s.end);
  if (!sc) return null;
  const th = themeAt(t);
  return (
    <div style={{position: 'absolute', top: 178, left: 72, width: 936, fontFamily: INTER, fontWeight: 600, fontSize: 56, lineHeight: 1.2,
      color: th.fg, letterSpacing: -0.6}}>
      {sc.words.map((w, k) => {
        const on = sp(f, fps, w.start - 0.06, {damping: 20, stiffness: 260, mass: 0.5});
        const first = sc.start < 0.3;
        const vis = t >= w.start - 0.06 || first;
        const o = first ? 1 : on;
        return (
          <span key={k} style={{display: 'inline-block', marginRight: 14, opacity: vis ? o : 0,
            transform: `translateY(${vis ? (1 - o) * 10 : 10}px)`, filter: vis && o < 0.99 ? `blur(${(1 - o) * 4}px)` : 'none',
            ...(w.hl ? {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 70, color: th.hl, letterSpacing: 0} : {})}}>{w.w}</span>
        );
      })}
    </div>
  );
};

/* scene wrapper: soft spring in + zoom kick on highlighted words */
export const SceneIn: React.FC<{children: React.ReactNode; kicks: number[]; instant?: boolean}> = ({children, kicks, instant}) => {
  const {f, fps, t} = useT();
  const s = instant ? 1 : sp(f, fps, 0, {damping: 16, stiffness: 180, mass: 0.8});
  const kick = kicks.reduce((acc, k) => acc + (t >= k ? Math.exp(-(t - k) * 7) * 0.035 : 0), 0);
  return (
    <AbsoluteFill style={{transform: `translateY(${(1 - s) * 60}px) scale(${0.92 + 0.08 * s + kick})`, opacity: s, filter: `blur(${(1 - s) * 10}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

/* ---------------- scenes ---------------- */
type SP = {ls: Line[]; t0: number; dur: number};
const rel = (abs: number, t0: number) => abs - t0;

const ReceiptScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  return (
    <Card y={520} w={760} rot={-2}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26}}>
        <svg width={46} height={32} viewBox="0 0 46 32"><path d="M12 30 a10 10 0 0 1 0-20 a13 13 0 0 1 24 3 a8.5 8.5 0 0 1-1 17 Z" fill={K.cobalt} /></svg>
        <span style={{fontSize: 36, fontWeight: 700}}>Cloud Billing</span><span style={{flex: 1}} /><Mono size={24}>FEB 2026</Mono>
      </div>
      {[['Monthly usage', '$180.00', K.ink], ['Team', '3 people', K.ink], ['Status', '● Normal', K.green]].map(([a, b, c], k) => (
        <div key={k} style={{display: 'flex', justifyContent: 'space-between', padding: '18px 0', borderTop: `1px dashed ${K.line}`, fontSize: 34,
          opacity: k === 0 ? 1 : interpolate(t, [0.25 + k * 0.2, 0.45 + k * 0.2], [0, 1], clamp)}}>
          <span style={{color: K.mute, fontWeight: 500}}>{a}</span><span style={{fontWeight: 700, color: c as string}}>{b}</span>
        </div>
      ))}
    </Card>
  );
};

const BigNumScene: React.FC<SP> = ({ls, t0}) => {
  const {t, f, fps} = useT();
  const land = rel(wordAt(ls[0], 'eighty-two', 1.2), t0);
  const chip = sp(f, fps, rel(wordAt(ls[0], 'forty-eight', 0.1), t0));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center', opacity: chip}}>
        <span style={{fontFamily: MONO, fontSize: 30, color: K.red, border: `2px solid ${K.red}`, borderRadius: 999, padding: '8px 22px'}}>IN 48 HOURS</span>
      </div>
      <div style={{position: 'absolute', top: 650, left: 0, right: 0}}><Roll text="$82,314.44" at={land} size={168} color={K.red} /></div>
      <div style={{position: 'absolute', top: 860, left: 0, right: 0, textAlign: 'center', fontFamily: INTER, fontSize: 34, color: K.mute,
        opacity: interpolate(t, [land + 0.2, land + 0.5], [0, 1], clamp)}}>
        normally <span style={{textDecoration: 'line-through', fontWeight: 700}}>$180</span> a month
      </div>
    </AbsoluteFill>
  );
};

const PromptCard: React.FC<{unlocked: number; typed?: number; lines: string[]}> = ({unlocked, typed = 0, lines}) => {
  const {t} = useT();
  const total = lines.join('').length;
  let left = Math.round(typed * total);
  return (
    <Card y={500} w={880} rot={unlocked ? 0 : 1.5}>
      <div style={{display: 'flex', alignItems: 'center', marginBottom: 24}}>
        <Mono size={26} color={K.mute}>the prompt</Mono><span style={{flex: 1}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: unlocked ? K.green : K.red}}>
          <Lock open={unlocked} size={22} /><Mono size={22} color="#fff">{unlocked ? 'unlocked' : 'unlocks at the end'}</Mono>
        </div>
      </div>
      {!unlocked && [1, 0.92, 0.75, 0.86].map((w, k) => (
        <div key={k} style={{height: 26, width: `${w * 100}%`, borderRadius: 13, margin: '18px 0',
          background: `linear-gradient(90deg, #1b1b1f ${((t * 0.6 + k * 0.2) % 1) * 100 - 30}%, #3a3a42 ${((t * 0.6 + k * 0.2) % 1) * 100}%, #1b1b1f ${((t * 0.6 + k * 0.2) % 1) * 100 + 30}%)`}} />
      ))}
      {!!unlocked && lines.map((ln, k) => {
        const n = Math.max(0, Math.min(ln.length, left)); left -= ln.length;
        return <div key={k} style={{fontFamily: MONO, fontSize: 31, lineHeight: 1.45, color: k === 0 ? K.ink : '#3b3a38', fontWeight: k === 0 ? 700 : 500, minHeight: 45}}>{ln.slice(0, n)}</div>;
      })}
    </Card>
  );
};
const PROMPT = ['Audit my app for exposed API keys.', '• Move every secret to the server', '• Restrict each key to one API + my domain',
  '• Turn on Row Level Security everywhere', '• Set a hard spending cap', 'List each change and the file it touched.'];

const PromptLockedScene: React.FC<SP> = () => <PromptCard unlocked={0} lines={PROMPT} />;
const PromptUnlockScene: React.FC<SP> = ({ls, t0, dur}) => {
  const {t} = useT();
  return <PromptCard unlocked={1} typed={interpolate(t, [0.3, dur - 0.4], [0, 1], clamp)} lines={PROMPT} />;
};

const CodeKeyScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const letters = ls[0].words.filter((w) => /^[aizAIZ][,.]?$/.test(w.w)).map((w) => rel(w.start, t0));
  const key = 'AIzaSyB7x9QeK2mLw3';
  return (
    <Card y={520} w={900} dark pad={44}>
      <div style={{display: 'flex', gap: 10, marginBottom: 26}}>{['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
        <span style={{flex: 1}} /><Mono size={22} color="#77757a">index.html</Mono></div>
      <div style={{fontFamily: MONO, fontSize: 38, lineHeight: 1.55}}>
        <div style={{color: '#77757a'}}>{'<script>'}</div>
        <div><span style={{color: '#c792ea'}}>  const</span> <span style={{color: '#82aaff'}}>KEY</span> <span style={{color: '#e9e6df'}}>=</span></div>
        <div style={{color: '#c3e88d'}}>{'   "'}
          {key.split('').map((ch, k) => {
            const lit = k < 4 ? t >= (letters[k] ?? 99) - 0.03 : t >= (letters[3] ?? 99) + 0.3;
            return <span key={k} style={k < 4 ? {background: lit ? K.cobalt : 'transparent', color: lit ? '#fff' : '#c3e88d', borderRadius: 6, padding: '0 3px'}
              : {opacity: lit ? 1 : 0.35}}>{ch}</span>;
          })}{'"'}</div>
        <div style={{color: '#77757a'}}>{'</script>'}</div>
      </div>
    </Card>
  );
};

const PublicScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const pin = Math.abs(Math.sin(t * 4)) * 10;
  return (
    <>
      <Card y={500} w={860} pad={0} style={{overflow: 'hidden'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '18px 26px', borderBottom: `1px solid ${K.line}`}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
          <Mono size={22}>yourapp.com/contact</Mono></div>
        <svg viewBox="0 0 860 400" width={860} height={400} style={{display: 'block', background: '#ebe7dc'}}>
          <rect x={60} y={40} width={220} height={130} rx={20} fill="#cfe3c2" /><rect x={560} y={230} width={240} height={140} rx={24} fill="#cfe3c2" />
          <path d="M -20 300 Q 300 220 520 330 T 900 290" stroke="#a9c8e8" strokeWidth={46} fill="none" />
          <path d="M 0 210 L 860 170 M 380 0 L 420 400 M 0 90 L 860 120 M 650 0 L 620 400" stroke="#fff" strokeWidth={20} />
          <g transform={`translate(430 ${150 - pin})`}><path d="M 0 0 C -40 -40 -40 -90 0 -90 C 40 -90 40 -40 0 0 Z" fill={K.red} stroke="#7a1a10" strokeWidth={4} />
            <circle cx={0} cy={-58} r={13} fill="#fff" /></g>
        </svg>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 26px'}}>
          <Mono size={24}>maps key</Mono><span style={{fontFamily: MONO, fontSize: 28, color: K.ink, background: '#f1eee8', padding: '6px 14px', borderRadius: 10}}>AIzaSyB7x9QeK2mLw3</span>
        </div>
      </Card>
      <Stamp text="PUBLIC BY DESIGN" at={rel(wordAt(ls[0], 'public', 3), t0)} color={K.green} x={720} y={560} rot={8} size={46} />
    </>
  );
};

const Sparkle: React.FC = () => {
  const {t, f, fps} = useT();
  const s = sp(f, fps, 0.05, {damping: 10, stiffness: 120});
  return (
    <svg viewBox="-100 -100 200 200" width={520} height={520} style={{position: 'absolute', left: 280, top: 520, transform: `scale(${s}) rotate(${t * 40}deg)`}}>
      <defs><linearGradient id="spk" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7aa2ff" /><stop offset="100%" stopColor="#b388ff" /></linearGradient></defs>
      <path d="M0 -95 C 8 -30 30 -8 95 0 C 30 8 8 30 0 95 C -8 30 -30 8 -95 0 C -30 -8 -8 -30 0 -95 Z" fill="url(#spk)" />
    </svg>
  );
};
const FlashScene: React.FC<SP> = () => <Sparkle />;

const Toggle: React.FC<{on: number}> = ({on}) => (
  <div style={{width: 110, height: 60, borderRadius: 30, background: on > 0.5 ? K.green : '#d5d1c8', position: 'relative'}}>
    <div style={{position: 'absolute', top: 6, left: 6 + on * 50, width: 48, height: 48, borderRadius: 24, background: '#fff', boxShadow: '0 3px 8px rgba(0,0,0,0.2)'}} />
  </div>
);
const ToggleScene: React.FC<SP> = ({ls, t0}) => {
  const {t, f, fps} = useT();
  const onAt = rel(wordAt(ls[0], 'gemini', 0.6), t0) + 0.15;
  const on = interpolate(t, [onAt, onAt + 0.2], [0, 1], clamp);
  const callAt = rel(wordAt(ls[0], 'call', 2.2), t0), cardAt = rel(wordAt(ls[0], 'card', 3.5), t0);
  const c1 = sp(f, fps, callAt), c2 = sp(f, fps, cardAt, {damping: 11, stiffness: 200, mass: 0.7});
  return (
    <>
      <Card y={470} w={860}>
        <Mono size={24}>apis &amp; services · your project</Mono>
        {[['Maps JavaScript API', null], ['Gemini API', on]].map(([name, v], k) => (
          <div key={k} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0', borderTop: k ? `1px solid ${K.line}` : 'none', marginTop: k ? 0 : 14}}>
            <span style={{fontSize: 36, fontWeight: 700}}>{name}</span>
            {v === null ? <Mono size={26} color={K.green}>● enabled</Mono> : <Toggle on={v as number} />}
          </div>
        ))}
      </Card>
      <div style={{position: 'absolute', top: 790, left: 110, display: 'flex', alignItems: 'center', gap: 18, opacity: c1, transform: `translateY(${(1 - c1) * 30}px)`}}>
        <span style={{fontFamily: MONO, fontSize: 28, background: '#fff', padding: '10px 16px', borderRadius: 12, border: `1px solid ${K.line}`}}>AIzaSy…Lw3</span>
        <span style={{fontFamily: INTER, fontSize: 40, fontWeight: 800}}>→</span>
        <span style={{fontFamily: MONO, fontSize: 28, color: '#fff', background: K.red, padding: '10px 18px', borderRadius: 12}}>can call gemini</span>
      </div>
      <div style={{position: 'absolute', top: 880, left: 560, width: 380, height: 236, borderRadius: 24, background: 'linear-gradient(135deg,#232328,#0d0d10)',
        transform: `rotate(${-8 + (1 - c2) * 20}deg) scale(${c2})`, boxShadow: '0 24px 50px rgba(0,0,0,0.35)', padding: 28, color: '#e9e6df', fontFamily: MONO}}>
        <div style={{width: 60, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,#e8c879,#b8913d)'}} />
        <div style={{fontSize: 30, marginTop: 34, letterSpacing: 4}}>•••• 4242</div>
        <div style={{position: 'absolute', right: 24, bottom: 22, fontSize: 22, color: K.red, fontWeight: 700}}>CHARGED</div>
      </div>
    </>
  );
};

const CounterScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const land = rel(wordAt(ls[0], 'sixty-three', 2.2), t0);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0}}><Roll text="2,863" at={land} size={190} color={K.red} stagger={0.07} /></div>
      <div style={{position: 'absolute', top: 680, left: 0, right: 0, textAlign: 'center'}}><Mono size={30} color={K.ink}>live keys · on public websites</Mono></div>
      <div style={{position: 'absolute', top: 750, left: 120, width: 840, display: 'flex', flexWrap: 'wrap', gap: 14}}>
        {Array.from({length: 40}).map((_, k) => {
          const lit = t >= land - 0.6 + (k * 0.618 % 1) * 1.6;
          return (
            <div key={k} style={{width: 92, height: 62, borderRadius: 10, background: lit ? '#fff' : 'rgba(18,18,20,0.06)', border: `2px solid ${lit ? K.red : 'transparent'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lit ? 1 : 0.9})`}}>
              {lit && <Mono size={18} color={K.red}>AIza</Mono>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const UnrestrictedScene: React.FC<SP> = ({ls, t0}) => {
  const {t} = useT();
  const hit = rel(wordAt(ls[0], 'unrestricted', 1), t0);
  const ring = t >= hit ? 0.6 + 0.4 * Math.abs(Math.sin((t - hit) * 6)) : 0;
  return (
    <Card y={500} w={860}>
      <div style={{fontSize: 38, fontWeight: 800, marginBottom: 6}}>Create API key</div>
      <Mono size={24}>api restrictions</Mono>
      {[["Don't restrict key", true], ['Restrict key', false]].map(([label, sel], k) => (
        <div key={k} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '24px 22px', marginTop: 18, borderRadius: 20,
          border: `3px solid ${sel ? `rgba(240,65,47,${ring})` : K.line}`, background: sel ? 'rgba(240,65,47,0.06)' : 'transparent'}}>
          <div style={{width: 40, height: 40, borderRadius: 20, border: `4px solid ${sel ? K.cobalt : '#c8c4bb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {sel && <div style={{width: 20, height: 20, borderRadius: 10, background: K.cobalt}} />}</div>
          <span style={{fontSize: 36, fontWeight: 600, flex: 1}}>{label as string}</span>
          {sel && <Mono size={22} color="#fff" style={{background: K.red, padding: '6px 14px', borderRadius: 999}}>default</Mono>}
        </div>
      ))}
    </Card>
  );
};

const CapScene: React.FC<SP> = ({ls, t0, dur}) => {
  const {t, f, fps} = useT();
  const capAt = rel(wordAt(ls[0], 'lag', 2.5), t0), past = rel(wordAt(ls[0], 'past', 4.5), t0);
  const fill = t < capAt ? interpolate(t, [0.3, capAt], [0, 0.62], {...clamp, easing: Easing.inOut(Easing.cubic)})
    : interpolate(t, [capAt, past + 0.4], [0.62, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const capX = 0.62, over = fill > capX;
  const clock = sp(f, fps, capAt - 0.2);
  const quote = sp(f, fps, Math.min(dur - 1.6, capAt + 0.9));
  return (
    <>
      <Card y={480} w={880}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <span style={{fontSize: 36, fontWeight: 800}}>Spend cap</span>
          <Mono size={20} color="#fff" style={{background: K.mute, padding: '4px 12px', borderRadius: 999}}>experimental</Mono>
          <span style={{flex: 1}} />
          <span style={{fontWeight: 800, fontSize: 40, color: over ? K.red : K.ink}}>{over ? 'still charging' : 'under cap'}</span>
        </div>
        <div style={{position: 'relative', height: 56, borderRadius: 28, background: '#ece8e0', marginTop: 34}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, borderRadius: 28,
            background: over ? `linear-gradient(90deg, #f6a03b ${capX / fill * 100}%, ${K.red} ${capX / fill * 100}%)` : '#f6a03b'}} />
          <div style={{position: 'absolute', left: `${capX * 100}%`, top: -22, bottom: -22, width: 6, background: K.ink, borderRadius: 3}} />
          <div style={{position: 'absolute', left: `${capX * 100}%`, top: 74, transform: 'translateX(-50%)'}}><Mono size={24} color={K.ink}>your cap</Mono></div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 92, opacity: clock, transform: `translateY(${(1 - clock) * 20}px)`}}>
          <svg width={40} height={40} viewBox="0 0 40 40"><circle cx={20} cy={20} r={17} fill="none" stroke={K.red} strokeWidth={4} />
            <path d={`M20 20 L20 9 M20 20 L${20 + 9 * Math.sin(t * 4)} ${20 - 9 * Math.cos(t * 4)}`} stroke={K.red} strokeWidth={4} strokeLinecap="round" /></svg>
          <Mono size={26} color={K.red}>billing data delayed · up to ~10 min</Mono>
        </div>
      </Card>
      <div style={{position: 'absolute', top: 930, left: 120, width: 840, padding: '26px 30px', borderRadius: 22, background: '#fff', borderLeft: `8px solid ${K.cobalt}`,
        boxShadow: '0 18px 40px rgba(0,0,0,0.12)', opacity: quote, transform: `translateY(${(1 - quote) * 40}px)`, fontFamily: INTER}}>
        <Mono size={20}>ai.google.dev · gemini api · billing</Mono>
        <div style={{fontSize: 34, fontWeight: 600, marginTop: 10, lineHeight: 1.3}}>“You may experience overages beyond your project cap.”</div>
      </div>
    </>
  );
};

const TableScene: React.FC<SP> = ({ls, t0}) => {
  const {t, f, fps} = useT();
  const anyone = rel(wordAt(ls[0], 'anyone', 2), t0), stamp = rel(wordAt(ls[0], 'seventy', 4.5), t0);
  const eye = sp(f, fps, anyone);
  const rows = [['ma••••@gmail.com', 'pro', '$2a$10$Xk…'], ['jo••••@outlook.com', 'free', '$2a$10$9f…'], ['sa••••@icloud.com', 'pro', '$2a$10$Qm…'], ['de••••@gmail.com', 'team', '$2a$10$Lw…']];
  return (
    <>
      <Card y={480} w={900} pad={34}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: 18}}>
          <span style={{fontFamily: MONO, fontSize: 30, fontWeight: 700}}>public.users</span><span style={{flex: 1}} />
          <Mono size={22} color={K.red} style={{border: `2px solid ${K.red}`, borderRadius: 999, padding: '4px 14px'}}>RLS · OFF</Mono>
        </div>
        {[['email', 'plan', 'password_hash'], ...rows].map((r, k) => (
          <div key={k} style={{display: 'grid', gridTemplateColumns: '1.7fr 0.6fr 1.2fr', padding: '14px 4px', borderTop: `1px solid ${K.line}`,
            fontFamily: MONO, fontSize: k ? 25 : 21, color: k ? K.ink : K.mute, opacity: interpolate(t, [0.1 + k * 0.1, 0.3 + k * 0.1], [0, 1], clamp)}}>
            {r.map((c, j) => <span key={j}>{c}</span>)}
          </div>
        ))}
      </Card>
      <div style={{position: 'absolute', top: 960, left: 160, display: 'flex', alignItems: 'center', gap: 14, opacity: eye, transform: `scale(${0.7 + 0.3 * eye})`}}>
        <svg width={60} height={40} viewBox="0 0 60 40"><path d="M2 20 Q30 -8 58 20 Q30 48 2 20 Z" fill="#fff" stroke={K.ink} strokeWidth={4} /><circle cx={30} cy={20} r={9} fill={K.ink} /></svg>
        <span style={{fontFamily: INTER, fontSize: 34, fontWeight: 800, color: '#fff'}}>anyone with the URL</span>
      </div>
      <Stamp text="170+ APPS" at={stamp} color={K.ink} x={760} y={500} rot={9} size={54} />
    </>
  );
};

const SupportScene: React.FC<SP> = ({ls, t0}) => {
  const {t, f, fps} = useT();
  const a1 = rel(ls[1]?.start ?? ls[0].end + 0.5, t0), stampAt = rel(wordAt(ls[2], 'bill', 1), t0);
  const typing = t >= a1 - 0.6 && t < a1;
  const b = sp(f, fps, a1);
  return (
    <>
      <Card y={470} w={880}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24}}>
          <div style={{width: 54, height: 54, borderRadius: 27, background: K.cobalt, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 26}}>CS</div>
          <span style={{fontSize: 32, fontWeight: 700}}>Cloud Support</span></div>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <div style={{background: K.cobalt, color: '#fff', fontSize: 34, fontWeight: 600, padding: '20px 26px', borderRadius: 28, borderBottomRightRadius: 8, maxWidth: 600}}>
            Can you reverse the $82,314 charge?</div></div>
        <div style={{display: 'flex', marginTop: 22, minHeight: 100}}>
          {(typing || t >= a1) && <div style={{background: '#efece6', fontSize: 34, fontWeight: 600, padding: '20px 26px', borderRadius: 28, borderBottomLeftRadius: 8, maxWidth: 640,
            transform: `scale(${typing ? 1 : 0.9 + 0.1 * b})`, transformOrigin: 'left bottom'}}>
            {typing ? <span style={{letterSpacing: 6}}>•••</span> : 'We follow a shared responsibility model. 🙂'}</div>}
        </div>
      </Card>
      <Stamp text="= YOUR BILL" at={stampAt} color={K.red} x={560} y={930} rot={-7} size={84} />
    </>
  );
};

const FollowScene: React.FC<SP> = ({ls, t0, dur}) => {
  const {t, f, fps} = useT();
  const tap = rel(wordAt(ls[0], 'cheaper', 1.2), t0);
  const pressed = t >= tap;
  const cur = interpolate(t, [0.2, tap - 0.05], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const pop = sp(f, fps, tap, {damping: 9, stiffness: 300, mass: 0.5});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 600, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: INTER, fontWeight: 800, fontSize: 64, color: pressed ? K.ink : '#fff', background: pressed ? '#e4e0d8' : K.cobalt,
          padding: '30px 90px', borderRadius: 26, transform: `scale(${pressed ? 0.96 + 0.04 * pop : 1})`, boxShadow: '0 20px 40px rgba(45,91,255,0.25)'}}>
          {pressed ? 'Following ✓' : 'Follow'}</div>
      </div>
      <svg width={70} height={84} viewBox="0 0 24 28" style={{position: 'absolute', left: interpolate(cur, [0, 1], [880, 600]), top: interpolate(cur, [0, 1], [1000, 690]),
        transform: `scale(${pressed && t < tap + 0.15 ? 0.85 : 1})`}}>
        <path d="M2 2 L2 22 L7.5 17 L11 25 L14.5 23.5 L11 15.5 L18 15.5 Z" fill="#fff" stroke={K.ink} strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<SP>> = {
  receipt: ReceiptScene, bignum: BigNumScene, prompt_locked: PromptLockedScene, code_key: CodeKeyScene, public_ok: PublicScene,
  flash: FlashScene, toggle: ToggleScene, counter: CounterScene, unrestricted: UnrestrictedScene, cap: CapScene, table: TableScene,
  support: SupportScene, prompt_unlock: PromptUnlockScene, follow: FollowScene,
};

/* ---------------- sound ---------------- */
export const Sfx: React.FC<{at: number; name: string; vol?: number}> = ({at, name, vol = 0.3}) => {
  const {fps} = useVideoConfig();
  return <Sequence from={Math.max(0, Math.round(at * fps))} durationInFrames={Math.round(1.2 * fps)}><Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} /></Sequence>;
};

/* ---------------- background with wipe ---------------- */
const Backdrop: React.FC<{lines: Line[]}> = ({lines}) => {
  const {t} = useT();
  let prev = 'paper', cur = 'paper', at = -9;
  for (const ln of lines) {
    const b = ln.bg ?? 'paper';
    if (ln.start - 0.1 <= t) { if (b !== cur) { prev = cur; cur = b; at = ln.start - 0.1; } }
  }
  const p = interpolate(t, [at, at + 0.35], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: BG[prev].bg}}>
      <AbsoluteFill style={{background: BG[cur].bg, clipPath: `circle(${p * 150}% at 50% 78%)`}} />
      <AbsoluteFill style={{opacity: 0.05, backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '6px 6px'}} />
    </AbsoluteFill>
  );
};

/* ---------------- cover ---------------- */
const Cover: React.FC<{lines: string[]; mouth: number[]}> = ({lines, mouth}) => (
  <AbsoluteFill style={{background: K.paper}}>
    <AbsoluteFill style={{opacity: 0.05, backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '6px 6px'}} />
    <div style={{position: 'absolute', top: 250, left: 70, right: 70, fontFamily: INTER, fontWeight: 800, fontSize: 124, lineHeight: 1.0, color: K.ink, letterSpacing: -4}}>
      {lines.map((l, k) => <div key={k} style={k === lines.length - 1 ? {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: K.red, fontSize: 150, letterSpacing: 0} : {}}>{l}</div>)}
    </div>
    <div style={{position: 'absolute', top: 720, left: 0, right: 0}}><Roll text="$82,314.44" at={-1} size={150} color={K.red} /></div>
    <Presenter mood="shocked" prevMood="shocked" moodAt={-1} gesture="hands" gestureFrom={-2} gestureTo={99} mouth={mouth.map(() => 0.55)} />
  </AbsoluteFill>
);

/* ---------------- composition ---------------- */
export const Explainer: React.FC<Props> = ({duration, lines, mouth, tally_label = 'YOUR BILL', cover}) => {
  const {fps} = useVideoConfig();
  const f = useCurrentFrame();
  const t = f / fps;
  if (cover) return <Cover lines={cover} mouth={mouth} />;

  // scene blocks (consecutive lines with the same scene)
  const blocks: {scene: string; lines: Line[]; start: number; end: number}[] = [];
  lines.forEach((ln) => {
    const last = blocks[blocks.length - 1];
    if (last && last.scene === ln.scene) last.lines.push(ln); else blocks.push({scene: ln.scene, lines: [ln], start: 0, end: 0});
  });
  blocks.forEach((b, k) => { b.start = k === 0 ? 0 : b.lines[0].start - 0.12; b.end = k + 1 < blocks.length ? blocks[k + 1].lines[0].start - 0.12 : duration; });

  const cur = [...lines].reverse().find((l) => l.start - 0.12 <= t) ?? lines[0];
  const ci = lines.indexOf(cur);
  const prevMood = (ci > 0 ? lines[ci - 1].mood : 'neutral') ?? 'neutral';
  const theme = BG[cur.bg ?? 'paper'];
  const themeAt = (tt: number) => BG[([...lines].reverse().find((l) => l.start - 0.1 <= tt) ?? lines[0]).bg ?? 'paper'];
  const tallyLines = lines.filter((l) => l.tally !== undefined && l.start <= t);
  const tallyLine = tallyLines[tallyLines.length - 1];
  const tallyFrom = tallyLines.length > 1 ? tallyLines[tallyLines.length - 2].tally : 0;
  const tallyAt = tallyLine ? (tallyLine.scene === 'bignum' ? wordAt(tallyLine, 'eighty-two', 1.2) : tallyLine.start) : 0;
  const unlockLine = lines.find((l) => l.scene === 'prompt_unlock');
  const unlockAt = unlockLine ? unlockLine.start : duration;
  const screens = screensOf(lines, duration);
  const section = cur.section ?? '';
  const gLine = cur.gesture ? cur : (ci > 0 && lines[ci - 1].gesture && t < lines[ci - 1].end + 0.5 ? lines[ci - 1] : undefined);

  // sound design
  const sfx: {at: number; name: string; vol?: number}[] = [];
  blocks.forEach((b, k) => { if (k > 0) sfx.push({at: b.start, name: 'whoosh', vol: 0.22}); });
  const L = (s: string) => lines.find((l) => l.scene === s);
  if (L('receipt')) sfx.push({at: 0.1, name: 'pop', vol: 0.3});
  if (L('bignum')) { const a = wordAt(L('bignum'), 'eighty-two', 1.2); for (let x = a - 0.55; x < a + 0.4; x += 0.06) sfx.push({at: x, name: 'tick', vol: 0.16}); sfx.push({at: a + 0.45, name: 'thud', vol: 0.45}); }
  if (L('code_key')) L('code_key')!.words.filter((w) => /^[aizAIZ][,.]?$/.test(w.w)).forEach((w) => sfx.push({at: w.start, name: 'pop', vol: 0.25}));
  if (L('public_ok')) sfx.push({at: wordAt(L('public_ok'), 'public', 3), name: 'thud', vol: 0.4});
  if (L('toggle')) { sfx.push({at: wordAt(L('toggle'), 'gemini', 0.6) + 0.15, name: 'check', vol: 0.35}, {at: wordAt(L('toggle'), 'card', 3.5), name: 'thud', vol: 0.45}); }
  if (L('counter')) { const a = wordAt(L('counter'), 'sixty-three', 2.2); for (let x = a - 0.6; x < a + 0.3; x += 0.07) sfx.push({at: x, name: 'tick', vol: 0.15}); }
  if (L('unrestricted')) sfx.push({at: wordAt(L('unrestricted'), 'unrestricted', 1), name: 'beep', vol: 0.25});
  if (L('cap')) sfx.push({at: wordAt(L('cap'), 'past', 4.5), name: 'beep', vol: 0.3});
  if (L('table')) sfx.push({at: wordAt(L('table'), 'seventy', 4.5), name: 'thud', vol: 0.45});
  const sup = lines.filter((l) => l.scene === 'support');
  if (sup[1]) sfx.push({at: sup[1].start, name: 'pop', vol: 0.3});
  if (sup[2]) sfx.push({at: wordAt(sup[2], 'bill', 1), name: 'thud', vol: 0.5});
  if (unlockLine) sfx.push({at: unlockAt, name: 'ding', vol: 0.4});
  if (L('follow')) sfx.push({at: wordAt(L('follow'), 'cheaper', 1.2), name: 'check', vol: 0.35});

  return (
    <AbsoluteFill style={{background: K.paper}}>
      <Backdrop lines={lines} />
      {blocks.map((b, k) => {
        const Comp = SCENES[b.scene];
        if (!Comp) return null;
        const kicks = b.lines.flatMap((l) => l.words.filter((w) => w.hl).map((w) => w.start - b.start));
        return (
          <Sequence key={k} from={Math.round(b.start * fps)} durationInFrames={Math.max(1, Math.round((b.end - b.start) * fps))}>
            <SceneIn kicks={kicks} instant={k === 0}><Comp ls={b.lines} t0={b.start} dur={b.end - b.start} /></SceneIn>
          </Sequence>
        );
      })}
      <Presenter mood={cur.mood ?? 'neutral'} prevMood={prevMood} moodAt={cur.start - 0.1} gesture={gLine?.gesture ?? 'none'}
        gestureFrom={gLine ? gLine.start : 0} gestureTo={gLine ? gLine.end - 0.1 : 0} mouth={mouth} scale={0.86} y={1965} />
      <Captions screens={screens} themeAt={themeAt} />
      <Header section={section} tally={tallyLine?.tally} from={tallyFrom} label={tally_label} theme={theme} tallyAt={tallyAt} />
      <PromptPill unlockAt={unlockAt} theme={theme} />
      <Audio src={staticFile('reel/voice.wav')} />
      {sfx.map((s, k) => <Sfx key={k} {...s} />)}
    </AbsoluteFill>
  );
};
