// 3D low-poly two-hander skit: R1 (dev) and the orange Claude buddy on a giant laptop at night.
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {EffectComposer, Bloom, DepthOfField, Vignette, ToneMapping, Noise} from '@react-three/postprocessing';
import {ToneMappingMode, BlendFunction} from 'postprocessing';
import * as THREE from 'three';
import {INTER, MONO} from '../v2/Explainer';
import {DevR1, DevMood, DevGesture} from './DevR1';
import {Buddy, BuddyEyes} from './Buddy';
import {DeskWorld, screenPoint, SCREEN_N, KEY_TOP} from './DeskWorld';
import {colX, setFonts, ScreenState} from './ScreenUI';
import {ease, easeIO, lerp, clamp01} from './lowpoly';

type Line = {who: 'dev' | 'claude'; text: string; cap?: string; start: number; end: number; shot: string;
  dev?: DevMood; claude?: BuddyEyes; gesture?: DevGesture; then?: DevGesture; gAt?: number; screen?: string};
type Props = {duration: number; lines: Line[]; mouth: Record<string, number[]>; coverMode?: boolean; cover?: string[]};

const FPS = 30;
const DEV = {x: -0.36, z: 0.06}, BUD = {x: 0.42, z: 0.12};
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------- timeline helpers ----------
const lineAt = (lines: Line[], t: number) => {
  let i = 0;
  for (let k = 1; k < lines.length; k++) if (t >= (lines[k - 1].end + lines[k].start) / 2) i = k;
  return i;
};
const cutAt = (lines: Line[], i: number) => (i === 0 ? 0 : (lines[i - 1].end + lines[i].start) / 2);
// step through keyed values, easing over tau seconds after each key
const track = (keys: {t: number; v: number}[], t: number, tau = 0.3) => {
  let v = keys[0].v;
  for (let k = 1; k < keys.length; k++) if (t >= keys[k].t) v = lerp(v, keys[k].v, ease((t - keys[k].t) / tau));
  return v;
};
const blinkAt = (t: number, seed: number) => {
  const period = 3.1 + (seed % 3) * 0.4;
  const ph = ((t + seed * 0.77) % period) / period * period;
  return ph < 0.16 ? Math.sin((ph / 0.16) * Math.PI) : 0;
};
const mouthAt = (m: number[] | undefined, f: number) => (m && m[f] !== undefined ? m[f] : 0);

// ---------- camera ----------
type Cam = {pos: THREE.Vector3; tgt: THREE.Vector3; fov: number; focus: THREE.Vector3; range: number; bokeh: number};
const panelCam = (cx: number, cy: number, d: number, fov: number, side = 0): Cam => {
  const p = screenPoint(cx, cy);
  return {pos: p.clone().addScaledVector(SCREEN_N, d).add(V(side, 0, 0)), tgt: p, fov, focus: p, range: 1.2, bokeh: 3};
};
const devHead = () => V(DEV.x, KEY_TOP + 1.0, DEV.z);
const budEyes = () => V(BUD.x, KEY_TOP + 0.5, BUD.z);
const WIDE: Cam = {pos: V(0.06, 0.82, 5.5), tgt: V(0.03, 0.9, 0), fov: 31, focus: V(0, 0.8, 0.1), range: 1.6, bokeh: 5};

const shotCam = (shot: string, ts: number, dur: number, t: number): Cam => {
  const u = clamp01(ts / Math.max(0.5, dur));
  switch (shot) {
    case 'billopen': {
      const a = panelCam(colX(2) + 485, 420, 3.3, 34);
      const k = easeIO((ts - 0.5) / 3.3);
      const ky = easeIO((ts - 0.8) / 3.0);
      const pos = V(lerp(a.pos.x, WIDE.pos.x, k), lerp(a.pos.y, WIDE.pos.y, ky), lerp(a.pos.z - 0.12 * clamp01(ts / 0.5), WIDE.pos.z, k));
      const tgt = a.tgt.clone().lerp(WIDE.tgt, easeIO((ts - 0.6) / 3.1));
      const focus = a.focus.clone().lerp(devHead(), easeIO((ts - 1.2) / 2.4));
      return {pos, tgt, fov: lerp(34, WIDE.fov, k), focus, range: lerp(1.2, WIDE.range, k), bokeh: lerp(3, 5, k)};
    }
    case 'wide':
      return {...WIDE, pos: WIDE.pos.clone().add(V(0.12 * u - 0.06, 0, -0.25 * u))};
    case 'dev':
      return {pos: V(DEV.x + 0.42, 1.0, DEV.z + 2.55 - 0.2 * u), tgt: V(DEV.x + 0.02, 1.1, DEV.z), fov: 30, focus: devHead(), range: 0.6, bokeh: 10};
    case 'devpunch': {
      const d = lerp(2.7, 1.95, easeIO(ts / 0.22));
      return {pos: V(DEV.x + 0.25, 1.02, DEV.z + d), tgt: V(DEV.x + 0.01, 1.07, DEV.z), fov: 30, focus: devHead(), range: 0.5, bokeh: 11};
    }
    case 'devleft':
      return {pos: V(DEV.x - 0.75, 1.05, DEV.z + 2.45 - 0.15 * u), tgt: V(DEV.x - 0.02, 1.1, DEV.z), fov: 30, focus: devHead(), range: 0.6, bokeh: 10};
    case 'devlow':
      return {pos: V(DEV.x + 0.3, 0.62, DEV.z + 2.3 - 0.15 * u), tgt: V(DEV.x, 1.12, DEV.z), fov: 32, focus: devHead(), range: 0.6, bokeh: 9};
    case 'buddy':
      return {pos: V(BUD.x - 0.32, 0.5, BUD.z + 3.05 - 0.2 * u), tgt: V(BUD.x - 0.02, 0.63, BUD.z), fov: 30, focus: budEyes(), range: 0.6, bokeh: 10};
    case 'buddy2':
      return {pos: V(BUD.x + 0.55, 0.8, BUD.z + 2.6 - 0.15 * u), tgt: V(BUD.x, 0.6, BUD.z), fov: 30, focus: budEyes(), range: 0.6, bokeh: 10};
    case 'ots':
      return {pos: V(BUD.x - 0.95, 0.42, BUD.z + 2.3 - 0.12 * u), tgt: V(BUD.x, 0.6, BUD.z), fov: 30, focus: budEyes(), range: 0.5, bokeh: 10};
    case 'stare':
      return {pos: V(BUD.x, 0.55, BUD.z + 2.6 - 0.9 * easeIO(u)), tgt: V(BUD.x, 0.62, BUD.z), fov: 30, focus: budEyes(), range: 0.45, bokeh: 11};
    case 'commits':
      return panelCam(colX(0) + 480, 331, 3.15 - 0.25 * u, 36, 0.04 * u);
    case 'stars':
      return panelCam(colX(1) + 470, 598, 3.15 - 0.3 * u, 36, -0.04 * u);
    case 'final': {
      const c = panelCam(colX(1) + 470, lerp(900, 1280, easeIO(ts / 2.2)), 3.4, 40);
      return {...c, range: 1.6};
    }
  }
  return WIDE;
};

const Rig: React.FC<{cam: Cam; dof: React.MutableRefObject<any>; t: number}> = ({cam, dof, t}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const sh = V(Math.sin(t * 1.3) * 0.004 + Math.sin(t * 2.9) * 0.002, Math.sin(t * 1.7 + 1) * 0.003, 0);
    c.position.copy(cam.pos).add(sh);
    c.fov = cam.fov; c.near = 0.05; c.far = 90;
    c.updateProjectionMatrix();
    c.lookAt(cam.tgt.clone().add(sh.multiplyScalar(0.5)));
    if (dof.current) {
      dof.current.target.copy(cam.focus);
      dof.current.cocMaterial.worldFocusRange = cam.range;
      dof.current.bokehScale = cam.bokeh;
    }
  });
  return null;
};

const useFonts = () => {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender('fonts for screen texture'));
  useLayoutEffect(() => {
    setFonts(INTER, MONO);
    Promise.all([`800 100px "${INTER}"`, `600 40px "${INTER}"`, `500 40px "${MONO}"`, `700 40px "${MONO}"`].map((f) => document.fonts.load(f)))
      .then(() => setOk(true));
  }, []);
  // release only after the commit that mounts <ThreeCanvas/>, which takes its own hold in a layout effect
  useEffect(() => { if (ok) continueRender(h); }, [ok]);
  return ok;
};

const Caption: React.FC<{lines: Line[]; t: number}> = ({lines, t}) => {
  const i = lines.findIndex((l, k) => t >= l.start - 0.06 && t < Math.min(l.end + 0.7, lines[k + 1] ? lines[k + 1].start - 0.08 : 1e9));
  if (i < 0) return null;
  const l = lines[i];
  const a = clamp01((t - (l.start - 0.06)) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 455, display: 'flex', justifyContent: 'center'}}>
      <div style={{maxWidth: 860, textAlign: 'center', fontFamily: INTER, fontWeight: 600, fontSize: 52, lineHeight: 1.22,
        color: '#fff', letterSpacing: -0.3, opacity: a, transform: `translateY(${(1 - a) * 10}px)`,
        textShadow: '0 2px 18px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.6)'}}>{l.cap ?? l.text}</div>
    </div>
  );
};

export const Skit: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const fontsOk = useFonts();
  const L = p.lines;
  const t = p.coverMode ? L[2].start + 0.2 : frame / FPS;
  const f = Math.round(t * FPS);
  const i = lineAt(L, t);
  const line = L[i];
  const last = L[L.length - 1];
  const FINAL = last.end + 0.95;
  const shot = t >= FINAL ? 'final' : line.shot === 'screen' ? (line.screen ?? 'commits') : i === 0 ? 'billopen' : line.shot;
  const ts = t >= FINAL ? t - FINAL : t - cutAt(L, i);
  const dur = t >= FINAL ? p.duration - FINAL : (L[i + 1] ? cutAt(L, i + 1) : FINAL) - cutAt(L, i);
  const cam = shotCam(shot, ts, dur, t);
  const dof = React.useRef<any>(null);

  // ---- acting ----
  const moodKeys: {t: number; m: DevMood}[] = [];
  const eyeKeys: {t: number; e: BuddyEyes}[] = [];
  L.forEach((l) => { if (l.dev) moodKeys.push({t: l.start - 0.12, m: l.dev}); if (l.claude) eyeKeys.push({t: l.start - 0.1, e: l.claude}); });
  const mk = moodKeys.filter((k) => k.t <= t);
  const mood = mk.length ? mk[mk.length - 1] : moodKeys[0];
  const prevMood = mk.length > 1 ? mk[mk.length - 2].m : mood.m;
  const moodK = ease((t - mood.t) / 0.2);
  const ek = eyeKeys.filter((k) => k.t <= t);
  const eyes = ek.length ? ek[ek.length - 1] : eyeKeys[0];
  const prevEyes = ek.length > 1 ? ek[ek.length - 2].e : eyes.e;

  // gesture: active line's gesture (with an optional follow-up)
  let gesture: DevGesture = 'none', g = 0;
  L.forEach((l) => {
    if (l.who !== 'dev' || !l.gesture) return;
    const gs = l.start + (l.gAt ?? -0.1);
    const ge = l.end + 0.35;
    if (l.then) {
      const sw = l.start + 0.2;
      if (t >= gs && t < sw) { gesture = l.gesture; g = ease((t - gs) / 0.3) * (1 - ease((t - (sw - 0.15)) / 0.15)); }
      else if (t >= sw && t < ge + 0.3) { gesture = l.then; g = ease((t - sw) / 0.22) * (1 - ease((t - ge) / 0.3)); }
    } else if (t >= gs && t < ge + 0.3) { gesture = l.gesture; g = ease((t - gs) / 0.25) * (1 - ease((t - ge) / 0.3)); }
  });

  const yawKeys = L.map((l, k) => ({t: cutAt(L, k), l}));
  const devYaw = track(yawKeys.map(({t: kt, l}) => ({t: kt, v: l.shot === 'ots' ? 0.95 : l.who === 'dev' ? 0.14 : 0.24})), t, 0.35);
  const devHeadYaw = track(yawKeys.map(({t: kt, l}) => ({t: kt, v: l.shot === 'ots' ? 0.1 : l.who === 'dev' ? 0.12 : 0.3})), t, 0.3);
  const budYaw = track(yawKeys.map(({t: kt, l}) => ({t: kt, v: l.shot === 'stare' ? 0 : l.shot === 'ots' ? -0.62 : l.who === 'claude' ? -0.16 : -0.34})), t, 0.4);
  const budLook = track(yawKeys.map(({t: kt, l}) => ({t: kt, v: l.shot === 'stare' ? 0 : l.who === 'claude' ? -0.25 : -0.85})), t, 0.25);
  const pitch = {neutral: 0, worried: 0.07, shocked: -0.09, happy: -0.05, smirk: 0.02}[mood.m];
  const devHop = L.reduce((h, l) => (l.dev === 'happy' ? h + 0.045 * Math.max(0, Math.sin(clamp01((t - l.start) / 0.42) * Math.PI)) : h), 0);
  const budHop = L.reduce((h, l) => (l.claude === 'happy' ? h + 0.06 * Math.max(0, Math.sin(clamp01((t - l.start + 0.05) / 0.4) * Math.PI)) : h), 0);
  const facepalmPitch = gesture === 'facepalm' ? 0.3 * g : 0;
  const staring = shot === 'stare' || t >= FINAL;

  const screen: ScreenState = {
    hl: clamp01((t - (L[3].start + 0.6 * (L[3].end - L[3].start))) / 0.2),
    chat: t >= last.start + 0.25 ? 3 : t >= L[10].start + 1.0 ? 2 : t >= L[9].start ? 1 : 0,
    stars: t < FINAL + 0.35 ? 3 : t < FINAL + 0.75 ? 4 : t < FINAL + 1.1 ? 9 : t < FINAL + 1.45 ? 27 : 81,
    starLog: t < FINAL + 0.35 ? 0 : t < FINAL + 0.75 ? 1 : t < FINAL + 1.1 ? 2 : t < FINAL + 1.45 ? 3 : 4,
    fontsOk,
  };

  return (
    <AbsoluteFill style={{background: '#07080f'}}>
      {fontsOk && (
        <ThreeCanvas width={1080} height={1920} shadows dpr={1} gl={{antialias: false, powerPreference: 'high-performance'}}
          camera={{fov: 30, near: 0.05, far: 90, position: [0, 1, 5]}}>
          <Rig cam={cam} dof={dof} t={t} />
          <DeskWorld t={t} screen={screen} />
          <DevR1 position={[DEV.x, KEY_TOP, DEV.z]} pose={{
            mood: mood.m, prevMood, moodK, talk: mouthAt(p.mouth.dev, f), gesture, g,
            headYaw: devHeadYaw, headPitch: pitch + facepalmPitch, headRoll: mood.m === 'smirk' ? 0.08 : gesture === 'shrug' ? 0.1 * g : 0,
            bodyYaw: devYaw, blink: blinkAt(t, 1), t, hop: devHop,
          }} />
          <Buddy position={[BUD.x, KEY_TOP, BUD.z]} pose={{
            eyes: eyes.e, prevEyes, eyesK: ease((t - eyes.t) / 0.15), talk: mouthAt(p.mouth.claude, f),
            look: budLook, yaw: budYaw, blink: staring || eyes.e === 'flat' ? 0 : blinkAt(t, 2), t, hop: budHop,
          }} />
          <EffectComposer multisampling={4}>
            <DepthOfField ref={dof} target={[0, 1, 0]} worldFocusRange={1} bokehScale={5} />
            <Bloom intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur radius={0.72} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <Vignette darkness={0.62} offset={0.28} />
            <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />
          </EffectComposer>
        </ThreeCanvas>
      )}
      {!p.coverMode && <Caption lines={L} t={t} />}
      {p.coverMode && p.cover && (
        <div style={{position: 'absolute', left: 60, right: 60, top: 250, textAlign: 'center', fontFamily: INTER, fontWeight: 800,
          color: '#fff', fontSize: 104, lineHeight: 1.02, letterSpacing: -2, textShadow: '0 6px 40px rgba(0,0,0,0.7)'}}>
          {p.cover[0]}<br /><span style={{color: '#ff7a45'}}>{p.cover[1]}</span>
        </div>
      )}
      {!p.coverMode && (
        <>
          <Audio src={staticFile('reel/voice.wav')} />
          <Sequence from={Math.round(0.45 * FPS)}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.28} /></Sequence>
          <Sequence from={Math.round((L[3].start + 0.6 * (L[3].end - L[3].start)) * FPS)}><Audio src={staticFile('sfx/pop.wav')} volume={0.22} /></Sequence>
          {[0, 0.09, 0.2, 0.27, 0.36, 0.5, 0.58].map((d, k) => (
            <Sequence key={k} from={Math.round((last.end + 0.08 + d) * FPS)}><Audio src={staticFile('sfx/m_key.wav')} volume={0.32} /></Sequence>
          ))}
          {[0.35, 0.75, 1.1, 1.45].map((d, k) => (
            <Sequence key={'s' + k} from={Math.round((FINAL + d) * FPS)}><Audio src={staticFile(k === 3 ? 'sfx/ding.wav' : 'sfx/tick.wav')} volume={k === 3 ? 0.25 : 0.5} /></Sequence>
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
