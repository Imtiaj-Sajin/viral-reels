import React from 'react';
import {
  AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Montserrat';

const {fontFamily: MONT} = loadFont('normal', {weights: ['600', '700', '800', '900'], subsets: ['latin']});
const FONT = `${MONT}, "Segoe UI Emoji", sans-serif`;
const C = {
  bg1: '#0b0f24', bg2: '#1c1446', ink: '#ffffff', dim: '#9aa3c7', orange: '#ff8a3d',
  red: '#ff4d5e', green: '#38e08c', yellow: '#ffd23f', card: 'rgba(22,26,54,0.92)', slate: '#5b6290',
};
const CLIPS: Record<string, {src: string; dur: number}> = {
  grok: {src: 'clips/grok_lowbattery.mp4', dur: 1.875},
  gemini: {src: 'clips/gemini_dazed.mp4', dur: 0.917},
  chatgpt: {src: 'clips/chatgpt_ego.mp4', dur: 1.5},
  claude: {src: 'clips/claude_wave.mp4', dur: 1.958},
};

type Word = {w: string; start: number; end: number; hl: boolean};
type Line = {i: number; speaker: string; scene: string; text: string; start: number; end: number; words: Word[]};
type Cap = {line: number; speaker: string; start: number; end: number; words: Word[]};
type Props = {duration: number; lines: Line[]; captions: Cap[]; series: string; episode: number};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
const wordAt = (ln: Line | undefined, w: string, fallback = 0) => {
  if (!ln) return fallback;
  const hit = ln.words.find((x) => norm(x.w).startsWith(norm(w)));
  return hit ? hit.start : ln.start + fallback;
};
const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, t: f / fps};
};
const pop = (f: number, fps: number, at = 0, cfg = {damping: 12, stiffness: 170, mass: 0.7}) =>
  spring({frame: f - at * fps, fps, config: cfg});

/* ---------------- shared pieces ---------------- */

const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Background: React.FC = () => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 70% 10%, ${C.bg2} 0%, ${C.bg1} 60%, #05060f 100%)`}}>
      <div style={{position: 'absolute', right: -160, top: -120, width: 520, height: 520, borderRadius: 999,
        background: 'radial-gradient(circle at 35% 35%, rgba(230,232,255,0.20), rgba(160,170,255,0.04) 60%, transparent 70%)'}} />
      {Array.from({length: 90}).map((_, i) => {
        const x = rand(i) * 1080;
        const y = ((rand(i + 99) * 1920 + t * (8 + rand(i + 7) * 22)) % 1920);
        const s = 1.5 + rand(i + 3) * 3;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + rand(i) * 2) + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: 9,
          background: '#fff', opacity: 0.25 + 0.5 * tw}} />;
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

const SeriesTag: React.FC<{series: string; episode: number}> = ({series, episode}) => (
  <div style={{position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: C.ink,
      padding: '10px 26px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.18)'}}>
      <span style={{display: 'inline-block', width: 16, height: 16, borderRadius: 9, background: C.orange, marginRight: 14, verticalAlign: 'middle'}} />{series} <span style={{color: C.orange}}>#{String(episode).padStart(2, '0')}</span>
    </div>
  </div>
);

const ProgressBar: React.FC<{fixAt: number}> = ({fixAt}) => {
  const {t} = useT();
  const p = Math.min(1, t / fixAt);
  const done = t >= fixAt;
  const flash = done ? 0.6 + 0.4 * Math.abs(Math.sin((t - fixAt) * 9)) : 1;
  return (
    <div style={{position: 'absolute', bottom: 120, left: 140, right: 140}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 700, fontSize: 28,
        color: done ? C.green : C.dim, marginBottom: 12}}>
        <span>{done ? '✓ here it is' : 'keep watching'}</span><span>{done ? 'THE FIX' : 'the fix ↓'}</span>
      </div>
      <div style={{height: 14, borderRadius: 9, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
        <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 9, opacity: flash,
          background: done ? C.green : `linear-gradient(90deg, ${C.orange}, ${C.yellow})`}} />
      </div>
    </div>
  );
};

const Captions: React.FC<{caps: Cap[]}> = ({caps}) => {
  const {t, f, fps} = useT();
  const nar = caps.filter((c) => c.speaker === 'narrator');
  const cap = nar.find((c, k) => (t >= c.start - 0.05 || (k === 0 && t < c.start)) && t < c.end);
  if (!cap) return null;
  return (
    <div style={{position: 'absolute', top: 1290, left: 50, right: 50, display: 'flex', flexWrap: 'wrap',
      justifyContent: 'center', alignItems: 'center', gap: '10px 20px'}}>
      {cap.words.map((w, k) => {
        const s = pop(f, fps, w.start - 0.04, {damping: 11, stiffness: 260, mass: 0.5});
        const first = cap.start < 1.0;
        const on = first || t >= w.start - 0.04;
        const txt = w.w.replace(/^[,]+|[,]+$/g, '');
        return (
          <span key={k} style={{fontFamily: FONT, fontWeight: 900, fontSize: 96, lineHeight: 1.08, color: w.hl ? '#16122c' : C.ink,
            opacity: on ? 1 : 0, transform: `scale(${first ? 1 : 0.6 + 0.4 * s}) rotate(${w.hl ? -2 : 0}deg)`,
            background: w.hl ? C.orange : 'transparent', padding: w.hl ? '0 18px' : 0, borderRadius: 18,
            textShadow: w.hl ? 'none' : '0 6px 0 rgba(0,0,0,0.45), 0 0 30px rgba(0,0,0,0.5)',
            boxShadow: w.hl ? '0 8px 0 rgba(0,0,0,0.35)' : 'none'}}>{txt}</span>
        );
      })}
    </div>
  );
};

/* enter animation: quick whip + blur */
const Enter: React.FC<{children: React.ReactNode; from?: number; dir?: number; instant?: boolean}> = ({children, from = 0, dir = 1, instant}) => {
  const {f, fps} = useT();
  if (instant) return <AbsoluteFill>{children}</AbsoluteFill>;
  const s = pop(f, fps, from, {damping: 15, stiffness: 190, mass: 0.8});
  const blur = interpolate(f - from * fps, [0, 7], [16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{transform: `translateX(${(1 - s) * 520 * dir}px) scale(${0.86 + 0.14 * s})`, filter: `blur(${blur}px)`,
      opacity: interpolate(s, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>
  );
};

const ChatCard: React.FC<{msgs: {me: boolean; text: string; at: number}[]; title?: string; top?: number}> = ({msgs, title = 'AI Assistant', top = 420}) => {
  const {t, f, fps} = useT();
  return (
    <div style={{position: 'absolute', top, left: 80, width: 920, borderRadius: 44, background: C.card, padding: 36,
      border: '2px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', fontFamily: FONT}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28}}>
        <div style={{width: 62, height: 62, borderRadius: 99, background: `linear-gradient(135deg, ${C.orange}, #7b5cff)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>🤖</div>
        <div style={{color: C.ink, fontWeight: 800, fontSize: 36}}>{title}</div>
        <div style={{width: 14, height: 14, borderRadius: 9, background: C.green, marginLeft: 4}} />
      </div>
      {msgs.map((m, k) => {
        const typing = !m.me && t >= m.at - 0.45 && t < m.at;
        if (t < m.at && !typing) return null;
        const s = m.at <= 0 ? 1 : pop(f, fps, typing ? m.at - 0.45 : m.at);
        return (
          <div key={k} style={{display: 'flex', justifyContent: m.me ? 'flex-end' : 'flex-start', marginBottom: 22}}>
            <div style={{maxWidth: 700, padding: '26px 32px', borderRadius: 34, fontSize: 50, fontWeight: 700, lineHeight: 1.25,
              color: m.me ? '#1b1033' : C.ink, background: m.me ? C.orange : 'rgba(255,255,255,0.10)',
              borderBottomRightRadius: m.me ? 8 : 34, borderBottomLeftRadius: m.me ? 34 : 8,
              transform: `scale(${0.7 + 0.3 * s})`, transformOrigin: m.me ? 'right bottom' : 'left bottom', opacity: s}}>
              {typing ? <span style={{letterSpacing: 6}}>•••</span> : m.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ClipCard: React.FC<{clip: string; sceneDur: number; accent: string; badge?: React.ReactNode; bubble?: {words: Word[]}}> =
  ({clip, sceneDur, accent, badge, bubble}) => {
    const {t, f, fps} = useT();
    const c = CLIPS[clip];
    const rate = Math.min(1, (c.dur / Math.max(0.1, sceneDur)) * 0.97);
    const zoom = 1 + 0.06 * Math.min(1, t / Math.max(0.5, sceneDur));
    return (
      <>
        <div style={{position: 'absolute', top: 330, left: 100, width: 880, height: 880, borderRadius: 56, overflow: 'hidden',
          border: `6px solid ${accent}`, boxShadow: `0 0 70px ${accent}66, 0 30px 80px rgba(0,0,0,0.6)`}}>
          <div style={{width: '100%', height: '100%', transform: `scale(${zoom})`}}>
            <OffthreadVideo src={staticFile(c.src)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        </div>
        {badge}
        {bubble && <SpeechBubble words={bubble.words} accent={accent} />}
      </>
    );
  };

const SpeechBubble: React.FC<{words: Word[]; accent: string}> = ({words, accent}) => {
  const {t, f, fps} = useT();
  const first = words[0]?.start ?? 0;
  const s = pop(f, fps, first - 0.1);
  return (
    <div style={{position: 'absolute', top: 1150, left: 70, right: 70, display: 'flex', justifyContent: 'center',
      transform: `scale(${0.6 + 0.4 * s})`, opacity: s}}>
      <div style={{position: 'relative', background: '#fff', borderRadius: 40, padding: '30px 44px', maxWidth: 900,
        boxShadow: `0 14px 0 ${accent}`, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#141029', textAlign: 'center', lineHeight: 1.15}}>
        <div style={{position: 'absolute', top: -34, left: '50%', marginLeft: -30, width: 0, height: 0,
          borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: '36px solid #fff'}} />
        {words.map((w, k) => (
          <span key={k} style={{opacity: t >= w.start - 0.03 ? 1 : 0.12}}>{w.w} </span>
        ))}
      </div>
    </div>
  );
};

const Stamp: React.FC<{text: string; at: number; color: string; x: number; y: number; rot?: number; size?: number}> =
  ({text, at, color, x, y, rot = -8, size = 64}) => {
    const {t, f, fps} = useT();
    if (t < at) return null;
    const s = pop(f, fps, at, {damping: 9, stiffness: 260, mass: 0.6});
    return (
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${2.2 - 1.2 * s})`,
        opacity: Math.min(1, s * 1.5), fontFamily: FONT, fontWeight: 900, fontSize: size, color, letterSpacing: 2,
        border: `7px solid ${color}`, borderRadius: 18, padding: '6px 24px', background: 'rgba(10,10,25,0.75)', whiteSpace: 'nowrap'}}>{text}</div>
    );
  };

/* ---------------- scenes ---------------- */

const HookScene: React.FC<{ln: Line}> = ({ln}) => (
  <Enter instant>
    <ChatCard msgs={[
      {me: true, text: 'I told you my name 2 minutes ago 😤', at: 0},
      {me: false, text: 'Nice to meet you! 😊 What’s your name?', at: Math.max(0.55, wordAt(ln, 'ignoring') - ln.start - 0.1)},
    ]} />
  </Enter>
);

const GrokScene: React.FC<{dur: number}> = ({dur}) => {
  const {t} = useT();
  const blink = 0.55 + 0.45 * Math.abs(Math.sin(t * 10));
  return (
    <Enter dir={-1}>
      <ClipCard clip="grok" sceneDur={dur} accent={C.red} badge={
        <div style={{position: 'absolute', top: 290, left: 130, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#fff',
          background: C.red, padding: '10px 26px', borderRadius: 999, opacity: blink, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>🔋 MEMORY 2%</div>} />
    </Enter>
  );
};

const BarScene: React.FC<{l3: Line; l4?: Line; l5?: Line; t0: number}> = ({l3, l4, l5, t0}) => {
  const {t: tl, f, fps} = useT();
  const t = tl + t0; // absolute time
  const ctx = wordAt(l3, 'context', 1.5);
  const fillStart = l4 ? l4.start : 99, fillEnd = l4 ? l4.end : 99;
  const full = l5 ? wordAt(l5, 'full', 0.5) : 99;
  const push = l5 ? wordAt(l5, 'pushed', 1.5) : 99;
  const pushEnd = l5 ? l5.end + 0.2 : 99;
  const N = 7, CW = 112, GAP = 12, BX = 104, BY = 780, BW = 872, BH = 196;
  // chips: 0 present at start; 1..6 arrive during l4; 7..8 arrive during the push
  const arrive = (k: number) => (k === 0 ? -1 : k <= 6 ? fillStart + ((k - 1) / 6) * (fillEnd - fillStart) * 0.95 : push + (k - 7) * 0.45);
  const shift = interpolate(t, [push, pushEnd], [0, 2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const count = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((k) => t >= arrive(k)).length;
  const pct = t < full ? Math.round(Math.min(96, 4 + (Math.min(count, 7) / 7) * 92)) : 100;
  const isFull = t >= full;
  const col = pct < 55 ? C.green : pct < 85 ? C.yellow : C.red;
  const shake = isFull ? Math.sin(tl * 60) * 6 * Math.max(0, 1 - (t - full) * 2.5) : 0;
  const labelSwap = t >= ctx;
  const ls = pop(f, fps, ctx - t0, {damping: 9, stiffness: 240, mass: 0.6});
  return (
    <Enter>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontFamily: FONT}}>
        <div style={{fontSize: 40, fontWeight: 700, color: C.dim, letterSpacing: 3}}>EVERY CHAT HAS A</div>
        <div style={{display: 'inline-block', marginTop: 16, fontSize: 84, fontWeight: 900, color: labelSwap ? '#16122c' : C.ink,
          background: labelSwap ? C.orange : 'transparent', padding: '4px 30px', borderRadius: 22,
          transform: labelSwap ? `scale(${1.5 - 0.5 * ls}) rotate(-2deg)` : 'none'}}>{labelSwap ? 'CONTEXT WINDOW' : 'MEMORY LIMIT'}</div>
      </div>
      <div style={{position: 'absolute', left: BX - 14, top: BY - 14, width: BW + 28, height: BH + 28, borderRadius: 60,
        border: `6px solid ${isFull ? C.red : 'rgba(255,255,255,0.35)'}`, transform: `translateX(${shake}px)`,
        boxShadow: isFull ? `0 0 60px ${C.red}88` : 'none'}} />
      {Array.from({length: 9}).map((_, k) => {
        const at = arrive(k);
        if (t < at) return null;
        const s = k === 0 ? 1 : pop(f, fps, at - t0, {damping: 13, stiffness: 200, mass: 0.6});
        const slot = k - shift;
        const fall = Math.max(0, -slot) ; // >0 once pushed out on the left
        const x = BX + Math.max(slot, -1.2) * (CW + GAP) - fall * 40;
        const y = BY + 14 + (1 - s) * 420 + fall * fall * 520;
        const me = k % 2 === 0;
        const op = slot > N - 0.4 ? interpolate(slot, [N - 0.4, N], [1, 0], {extrapolateRight: 'clamp'}) : Math.max(0, 1 - fall * 0.9);
        return (
          <div key={k} style={{position: 'absolute', left: x, top: y, width: CW, height: BH - 28, borderRadius: 26, opacity: op,
            background: fall > 0 ? C.red : me ? C.orange : C.slate, transform: `translateX(${shake}px) rotate(${fall * -35}deg)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontFamily: FONT, fontWeight: 900, fontSize: 40, color: me ? '#1b1033' : '#fff'}}>
            <div style={{fontSize: 40}}>{me ? 'YOU' : 'AI'}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: BY + BH + 40, left: 0, right: 0, textAlign: 'center', fontFamily: FONT,
        fontWeight: 900, fontSize: 72, color: col, transform: `translateX(${shake}px)`}}>
        {isFull ? 'FULL · 100%' : `${pct}% used`}
      </div>
    </Enter>
  );
};

const GeminiScene: React.FC<{ln: Line; dur: number}> = ({ln, dur}) => {
  const {t} = useT();
  return (
    <Enter dir={-1}>
      <ClipCard clip="gemini" sceneDur={dur} accent="#7aa7ff" bubble={{words: ln.words.map((w) => ({...w, start: w.start - (ln.start - 0.12)}))}}
        badge={<div style={{position: 'absolute', top: 360, right: 150, fontSize: 110, transform: `rotate(${Math.sin(t * 6) * 12}deg)`}}>❓</div>} />
    </Enter>
  );
};

const RulesScene: React.FC<{l7: Line; l8?: Line; t0: number}> = ({l7, l8, t0}) => {
  const {t: tl, f, fps} = useT();
  const t = tl + t0;
  const hour = wordAt(l7, 'hour', 0.6), forgets = wordAt(l7, 'forgets', 1.5);
  const guess = l8 ? wordAt(l8, 'guessing', 1) : 99;
  const rules = ['Keep answers short', 'No emojis', 'Call me Sam'];
  return (
    <Enter>
      <div style={{position: 'absolute', top: 400, left: 140, width: 800, borderRadius: 30, background: '#fff4cf', padding: '44px 52px',
        transform: 'rotate(-2deg)', boxShadow: '0 30px 70px rgba(0,0,0,0.55)', fontFamily: FONT}}>
        <div style={{fontSize: 52, fontWeight: 900, color: '#2a1f00', marginBottom: 26}}>📌 My rules</div>
        {rules.map((r, k) => {
          const gone = forgets + k * 0.28;
          const p = interpolate(t, [gone, gone + 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const g = interpolate(t, [guess - 0.3 + k * 0.12, guess + k * 0.12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div key={k} style={{position: 'relative', fontSize: 50, fontWeight: 800, color: '#3a2c00', margin: '18px 0', opacity: 1 - 0.75 * p}}>
              {g > 0.5 ? <span style={{color: C.red, fontWeight: 900, display: 'inline-block', transform: `rotate(${Math.sin(tl * 7 + k) * 6}deg)`}}>{['??? probably short', '??? some emojis 😂', '??? hi there, Steve'][k]}</span> : <>✓ {r}</>}
              {g <= 0.5 && <div style={{position: 'absolute', left: 0, top: '52%', height: 8, borderRadius: 4, background: C.red, width: `${p * 100}%`}} />}
            </div>
          );
        })}
      </div>
      <Stamp text="1 HOUR LATER" at={hour - t0} color={C.red} x={760} y={390} rot={8} size={52} />
    </Enter>
  );
};

const GptScene: React.FC<{ln: Line; dur: number}> = ({ln, dur}) => (
  <Enter dir={-1}>
    <ClipCard clip="chatgpt" sceneDur={dur} accent="#19c37d" bubble={{words: ln.words.map((w) => ({...w, start: w.start - (ln.start - 0.12)}))}} />
  </Enter>
);

const FixScene: React.FC<{ln: Line; t0: number}> = ({ln, t0}) => {
  const {f, fps} = useT();
  const no = 0.03, fix = wordAt(ln, "here's", 0.7) - t0;
  const s1 = pop(f, fps, no, {damping: 8, stiffness: 260, mass: 0.6});
  const s2 = pop(f, fps, fix, {damping: 9, stiffness: 220, mass: 0.6});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontSize: 300,
        transform: `scale(${s1 * (1 - s2 * 0.25)})`, opacity: 1 - s2 * 0.85}}>❌</div>
      <div style={{position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: s2}}>
        <div style={{transform: `scale(${2 - s2}) rotate(-4deg)`, fontFamily: FONT, fontWeight: 900, fontSize: 130, color: '#0b2a1a',
          background: C.green, padding: '10px 50px', borderRadius: 34, boxShadow: '0 14px 0 rgba(0,0,0,0.35)'}}>THE FIX</div>
      </div>
    </AbsoluteFill>
  );
};

const PromptScene: React.FC<{ln: Line; t0: number}> = ({ln, t0}) => {
  const {t: tl} = useT();
  const t = tl + t0;
  const full = 'Summarize everything important from this chat.';
  const a = wordAt(ln, 'summarize', 0.4), b = ln.end - 0.15;
  const n = Math.round(interpolate(t, [a - 0.1, b], [0, full.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const done = n >= full.length;
  return (
    <Enter>
      <div style={{position: 'absolute', top: 470, left: 70, width: 940, fontFamily: FONT}}>
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: 26}}><div style={{fontSize: 44, fontWeight: 900, color: '#0b2a1a', background: C.green, padding: '8px 30px', borderRadius: 20, transform: 'rotate(-3deg)'}}>THE FIX</div></div>
        <div style={{fontSize: 38, fontWeight: 800, color: C.dim, letterSpacing: 3, marginBottom: 18, textAlign: 'center'}}>TYPE THIS INTO YOUR CHAT</div>
        <div style={{borderRadius: 40, background: C.card, border: `4px solid ${done ? C.green : 'rgba(255,255,255,0.25)'}`, padding: '40px 44px',
          display: 'flex', alignItems: 'flex-end', gap: 24, boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}}>
          <div style={{flex: 1, fontSize: 58, fontWeight: 800, color: C.ink, lineHeight: 1.25, minHeight: 220}}>
            {n === 0 ? <span style={{color: C.slate}}>Ask anything…</span> : <>“{full.slice(0, n)}</>}{n > 0 && !done && <span style={{opacity: Math.floor(tl * 4) % 2 ? 1 : 0, color: C.orange}}>|</span>}{done && '”'}
          </div>
          <div style={{width: 96, height: 96, borderRadius: 99, background: done ? C.green : C.slate, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 52, color: '#fff', fontWeight: 900}}>↑</div>
        </div>
      </div>
    </Enter>
  );
};

const StepsScene: React.FC<{ln: Line; t0: number}> = ({ln, t0}) => {
  const {f, fps, t: tl} = useT();
  const t = tl + t0;
  const steps = [['📋', 'Copy the summary', wordAt(ln, 'copy', 0)], ['➕', 'Open a new chat', wordAt(ln, 'open', 0.8)], ['📥', 'Paste it in', wordAt(ln, 'paste', 1.6)]] as const;
  return (
    <Enter>
      <div style={{position: 'absolute', top: 430, left: 90, width: 900, fontFamily: FONT}}>
        {steps.map(([icon, label, at], k) => {
          const on = t >= at;
          const s = pop(f, fps, at - t0, {damping: 10, stiffness: 240, mass: 0.6});
          return (
            <div key={k} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '34px 40px', marginBottom: 30, borderRadius: 36,
              background: on ? 'rgba(56,224,140,0.16)' : C.card, border: `4px solid ${on ? C.green : 'rgba(255,255,255,0.15)'}`,
              transform: `scale(${on ? 1 + 0.06 * (1 - s) : 0.96})`, opacity: on ? 1 : 0.45}}>
              <div style={{fontSize: 72}}>{icon}</div>
              <div style={{flex: 1, fontSize: 58, fontWeight: 900, color: C.ink}}>{label}</div>
              <div style={{width: 84, height: 84, borderRadius: 99, background: on ? C.green : 'transparent', border: `5px solid ${on ? C.green : C.slate}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, color: '#0b2a1a', fontWeight: 900,
                transform: `scale(${on ? s : 1})`}}>{on ? '✓' : ''}</div>
            </div>
          );
        })}
      </div>
    </Enter>
  );
};

const ClaudeScene: React.FC<{dur: number}> = ({dur}) => {
  const {t} = useT();
  const p = interpolate(t, [0.1, 0.9], [100, 3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const col = p > 55 ? C.red : p > 20 ? C.yellow : C.green;
  return (
    <Enter dir={-1}>
      <ClipCard clip="claude" sceneDur={dur} accent={C.orange} badge={
        <div style={{position: 'absolute', top: 290, left: 130, display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT, fontWeight: 900,
          fontSize: 40, color: '#0b2a1a', background: col, padding: '10px 26px', borderRadius: 999, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
          ✨ NEW CHAT · {Math.round(p)}% used</div>} />
    </Enter>
  );
};

const SendScene: React.FC<{ln: Line; t0: number; dur: number}> = ({ln, t0, dur}) => {
  const {f, fps, t} = useT();
  const sendAt = wordAt(ln, 'send', 0) - t0;
  const s = pop(f, fps, sendAt);
  const pulse = 1 + 0.06 * Math.sin(t * 9);
  const fly = interpolate(t, [dur - 0.75, dur - 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  return (
    <Enter>
      <ChatCard top={310} title="Your friend’s AI" msgs={[
        {me: true, text: 'WHY DON’T YOU REMEMBER ANYTHING 😭', at: 0.05},
        {me: false, text: 'Hi! How can I help you today? 😊', at: 0.75},
      ]} />
      <div style={{position: 'absolute', top: 1035, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: s}}>
        <div style={{transform: `scale(${(0.6 + 0.4 * s) * pulse})`, fontFamily: FONT, fontWeight: 900, fontSize: 58, color: '#1b1033',
          background: C.orange, padding: '22px 54px', borderRadius: 999, boxShadow: '0 12px 0 rgba(0,0,0,0.35)', display: 'flex', gap: 22, alignItems: 'center'}}>
          SEND TO A FRIEND
          <span style={{display: 'inline-block', transform: `translate(${fly * 700}px, ${-fly * 900}px) rotate(${fly * -20}deg)`, fontSize: 64}}>➤</span>
        </div>
      </div>
    </Enter>
  );
};

/* ---------------- sound ---------------- */

const Sfx: React.FC<{at: number; name: string; vol?: number}> = ({at, name, vol = 0.35}) => {
  const {fps} = useVideoConfig();
  return (
    <Sequence from={Math.max(0, Math.round(at * fps))} durationInFrames={Math.round(1.2 * fps)}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
    </Sequence>
  );
};

/* ---------------- composition ---------------- */

const Cover: React.FC<{title: string[]; series: string; episode: number}> = ({title, series, episode}) => (
  <AbsoluteFill style={{backgroundColor: C.bg1}}>
    <Background />
    <GrokScene dur={2} />
    <div style={{position: 'absolute', top: 1240, left: 40, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900,
      fontSize: 118, lineHeight: 1.02, color: C.ink, textShadow: '0 8px 0 rgba(0,0,0,0.5)'}}>
      {title.map((ln, k) => (
        <div key={k}><span style={k === title.length - 1 ? {background: C.orange, color: '#16122c', padding: '0 24px', borderRadius: 22,
          display: 'inline-block', transform: 'rotate(-2deg)', marginTop: 14} : {}}>{ln}</span></div>
      ))}
    </div>
    <SeriesTag series={series} episode={episode} />
  </AbsoluteFill>
);

export const Reel: React.FC<Props & {cover?: string[]}> = ({duration, lines, captions, series, episode, cover}) => {
  const {fps} = useVideoConfig();
  if (cover) return <Cover title={cover} series={series} episode={episode} />;
  const L = (scene: string) => lines.filter((l) => l.scene === scene);
  const blocks: {scene: string; start: number; end: number; lines: Line[]}[] = [];
  const merged = (s: string) => (s.startsWith('bar_') ? 'bar' : s);
  for (const ln of lines) {
    const key = merged(ln.scene);
    const last = blocks[blocks.length - 1];
    if (last && last.scene === key) last.lines.push(ln);
    else blocks.push({scene: key, start: ln.start, end: ln.end, lines: [ln]});
  }
  blocks.forEach((b, k) => { b.start = k === 0 ? 0 : b.lines[0].start - 0.12; b.end = k + 1 < blocks.length ? blocks[k + 1].lines[0].start - 0.12 : duration; });
  const fixLine = L('fix_title')[0];
  const fixAt = fixLine ? wordAt(fixLine, "here's", 0.7) : duration;

  const sfx: {at: number; name: string; vol?: number}[] = [];
  blocks.forEach((b, k) => { if (k > 0 && !['fix_title'].includes(b.scene)) sfx.push({at: b.start, name: 'whoosh', vol: 0.28}); });
  const g = (s: string) => L(s)[0];
  if (g('hook_chat')) sfx.push({at: 0.02, name: 'pop'}, {at: Math.max(0.55, wordAt(g('hook_chat'), 'ignoring')) - 0.1 + 0.0, name: 'pop'});
  if (g('grok_card')) sfx.push({at: g('grok_card').start + 0.1, name: 'beep', vol: 0.3});
  if (g('bar_intro')) sfx.push({at: wordAt(g('bar_intro'), 'context', 1.5), name: 'thud', vol: 0.45});
  if (g('bar_fill')) for (let k = 0; k < 6; k++) sfx.push({at: g('bar_fill').start + (k / 6) * (g('bar_fill').end - g('bar_fill').start) * 0.95, name: 'pop', vol: 0.22});
  if (g('bar_overflow')) sfx.push({at: wordAt(g('bar_overflow'), 'full', 0.5), name: 'thud', vol: 0.45}, {at: wordAt(g('bar_overflow'), 'pushed', 1.5), name: 'whoosh', vol: 0.22});
  if (g('rules_fade')) sfx.push({at: wordAt(g('rules_fade'), 'hour', 0.6), name: 'thud', vol: 0.45});
  if (fixLine) sfx.push({at: wordAt(fixLine, "doesn't", 0), name: 'thud', vol: 0.5}, {at: fixAt, name: 'ding', vol: 0.4});
  if (g('prompt_card')) { const a = wordAt(g('prompt_card'), 'summarize', 0.4), b = g('prompt_card').end - 0.15; for (let x = a; x < b; x += 0.11) sfx.push({at: x, name: 'tick', vol: 0.18}); }
  if (g('steps')) ['copy', 'open', 'paste'].forEach((w, k) => sfx.push({at: wordAt(g('steps'), w, k * 0.8), name: 'check', vol: 0.3}));
  if (g('send_cta')) sfx.push({at: wordAt(g('send_cta'), 'send', 0), name: 'pop'}, {at: duration - 0.75, name: 'send', vol: 0.35});

  const scene = (b: (typeof blocks)[number]) => {
    const dur = b.end - b.start, ln = b.lines[0];
    switch (b.scene) {
      case 'hook_chat': return <HookScene ln={ln} />;
      case 'grok_card': return <GrokScene dur={dur} />;
      case 'bar': return <BarScene l3={b.lines.find((l) => l.scene === 'bar_intro') ?? ln} l4={b.lines.find((l) => l.scene === 'bar_fill')} l5={b.lines.find((l) => l.scene === 'bar_overflow')} t0={b.start} />;
      case 'gemini_card': return <GeminiScene ln={{...ln}} dur={dur} />;
      case 'rules_fade': return <RulesScene l7={ln} l8={b.lines[1]} t0={b.start} />;
      case 'gpt_card': return <GptScene ln={ln} dur={dur} />;
      case 'fix_title': return <FixScene ln={ln} t0={b.start} />;
      case 'prompt_card': return <PromptScene ln={ln} t0={b.start} />;
      case 'steps': return <StepsScene ln={ln} t0={b.start} />;
      case 'claude_card': return <ClaudeScene dur={dur} />;
      case 'send_cta': return <SendScene ln={ln} t0={b.start} dur={dur} />;
      default: return null;
    }
  };

  return (
    <AbsoluteFill style={{backgroundColor: C.bg1}}>
      <Background />
      {blocks.map((b, k) => (
        <Sequence key={k} from={Math.round(b.start * fps)} durationInFrames={Math.max(1, Math.round((b.end - b.start) * fps))}>
          {scene(b)}
        </Sequence>
      ))}
      <Captions caps={captions} />
      <SeriesTag series={series} episode={episode} />
      <ProgressBar fixAt={fixAt} />
      <Audio src={staticFile('reel/voice.wav')} />
      {sfx.map((s, k) => <Sfx key={k} {...s} />)}
    </AbsoluteFill>
  );
};
