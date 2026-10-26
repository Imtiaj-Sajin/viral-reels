import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INTER, SERIF, MONO} from './Explainer';
import {Avatar2, Look} from './Concepts2';
import {ToonAvatar, ToonLook} from './Toon';

type Card = {id: string; name: string; note: string; from: string; bg: string; ring: string; fg: string} &
  ({kind: 'flat'; L: Look} | {kind: 'toon'; L: ToonLook});

export const R4: Card[] = [
  {id: 'r1', name: 'Layered', note: 'original side part · stubble · denim over grey hoodie', from: 'refined G8 · less round face', bg: '#e6edf3', ring: '#bccde0', fg: '#142030',
    kind: 'flat', L: {id: 'r1', hair: 'sidepart', face: 'defined', fh: 'stubble', outfit: 'denim', mood: 'gentle', brows: 'thick', main: '#6d8bb0', dark: '#4b6688'}},
  {id: 'r2', name: 'Smart', note: 'slick back, small lift · stubble · navy blazer', from: 'refined G4 · hair per your sketch', bg: '#e8ebf1', ring: '#b8c3d9', fg: '#141a28',
    kind: 'flat', L: {id: 'r2', hair: 'slickLift', face: 'defined', fh: 'stubble', outfit: 'blazer', mood: 'calm', brows: 'thick', main: '#26324d', dark: '#161e31'}},
  {id: 'r3', name: 'Gentle', note: 'original side part · clean shave · cream knit', from: 'refined G1 · less round face', bg: '#f4efe6', ring: '#e9c9a0', fg: '#2a2118',
    kind: 'flat', L: {id: 'r3', hair: 'sidepart', face: 'defined', fh: 'clean', outfit: 'knit', mood: 'warm', brows: 'soft', main: '#efe6d6', dark: '#d8cbb3'}},
  {id: 'r4', name: 'Night Owl', note: 'original swept fringe · clean · black hoodie', from: 'refined T2 · slimmer face', bg: '#1c2433', ring: '#2c3a52', fg: '#ffffff',
    kind: 'toon', L: {id: 'r4', hair: 'fringe', fh: 'clean', mood: 'gentle', outfit: 'hoodie', c1: '#232327', c2: '#1a1a1d', c3: '#7a2a33', jaw: 'narrow'}},
  {id: 'r5', name: 'Scholar', note: 'side part · light stubble · glasses · oxford + knit vest', from: 'NEW · knowledgeable', bg: '#ece9e1', ring: '#c9cdb7', fg: '#1d2318',
    kind: 'flat', L: {id: 'r5', hair: 'sidepart', face: 'defined', fh: 'stubble', outfit: 'vest', mood: 'gentle', brows: 'thick', glasses: true, glassesStyle: 'rect',
      main: '#56604c', dark: '#3d4536'}},
  {id: 'r6', name: 'Scholar', note: 'neat side part · stubble · glasses · oxford + navy sweater', from: 'NEW · knowledgeable (avatar style)', bg: '#2f4a3d', ring: '#3e6150', fg: '#ffffff',
    kind: 'toon', L: {id: 'r6', hair: 'neat', fh: 'stubble', mood: 'smile', outfit: 'oxford', c1: '#27324a', c2: '#1d2538', glasses: true, gc: '#18181b', jaw: 'narrow'}},
];

export const R4Card: React.FC<{k: number; big?: boolean}> = ({k, big}) => {
  const c = R4[k];
  const W = big ? 1080 : 720, H = big ? 1350 : 900;
  return (
    <div style={{width: W, height: H, position: 'relative', overflow: 'hidden', background: c.bg, borderRadius: big ? 0 : 32}}>
      <div style={{position: 'absolute', left: '50%', top: H * 0.6, width: W * 0.72, height: W * 0.72, marginLeft: -W * 0.36, marginTop: -W * 0.36, borderRadius: '50%', background: c.ring}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center'}}>
        {c.kind === 'flat'
          ? <Avatar2 L={c.L} width={W * 0.66} height={W * 0.66 * 780 / 520} viewBox="40 20 520 780" />
          : <ToonAvatar L={c.L} width={W * 0.68} height={W * 0.68 * 640 / 440} />}
      </div>
      <div style={{position: 'absolute', left: big ? 60 : 36, top: big ? 56 : 30, color: c.fg}}>
        <div style={{fontFamily: MONO, fontSize: big ? 28 : 20, letterSpacing: 3, opacity: 0.7}}>{c.id.toUpperCase()} · {c.from.toUpperCase()}</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: big ? 110 : 74, lineHeight: 1}}>{c.name}</div>
        <div style={{fontFamily: INTER, fontWeight: 600, fontSize: big ? 30 : 21, opacity: 0.78, marginTop: 4}}>{c.note}</div>
      </div>
    </div>
  );
};

export const R4Sheet: React.FC = () => (
  <AbsoluteFill style={{background: '#e9e5de', padding: 50, fontFamily: INTER}}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 30}}>
      <span style={{fontSize: 60, fontWeight: 800, letterSpacing: -2, color: '#121214'}}>Pick your host</span>
      <span style={{fontFamily: MONO, fontSize: 24, color: '#8b8780', letterSpacing: 2}}>ROUND 4 · YOUR PICKS, LESS ROUND FACES · + 2 NEW</span>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 720px)', gap: 30}}>
      {R4.map((_, k) => <R4Card key={k} k={k} />)}
    </div>
  </AbsoluteFill>
);

export const R4Single: React.FC<{k: number}> = ({k}) => <AbsoluteFill><R4Card k={k} big /></AbsoluteFill>;
