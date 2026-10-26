// Low-poly 3D version of the approved host R1: side-part hair, defined face, stubble,
// denim jacket over a grey hoodie. Feet at y=0, about 1.3 units tall.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {deform, facet, faceColors, shade, mix, rnd, surfaceZ, lerp, clamp01} from './lowpoly';

export type DevMood = 'neutral' | 'worried' | 'shocked' | 'happy' | 'smirk';
export type DevGesture = 'none' | 'hands' | 'point' | 'facepalm' | 'shrug' | 'cheer';
export type DevPose = {
  mood: DevMood; prevMood?: DevMood; moodK?: number; // moodK: 0 = prevMood, 1 = mood
  talk: number; gesture: DevGesture; g: number;
  headYaw: number; headPitch: number; headRoll: number; bodyYaw: number;
  blink: number; t: number; hop?: number;
};

const SKIN = '#eac6a8', SKIN_MID = '#dcaa88', HAIR = '#2a1c15', STUB = '#6e5140';
const DENIM = '#4f7fc2', DENIM_D = '#3a5f96', HOOD = '#7f838b', HOOD_L = '#a0a3aa', PANTS = '#2b2f3d', SHOE = '#e8e5df';
const MOUTH = '#3a1913';

type Face = {eye: [number, number]; eyeY: number; brow: [number, number, number, number]; mw: number; mh: number;
  smile: number; o: number; mrot: number; mdx: number};
const FACES: Record<DevMood, Face> = {
  neutral: {eye: [1, 1], eyeY: 0, brow: [0, 0.07, 0, -0.07], mw: 0.07, mh: 0.014, smile: 0, o: 0, mrot: 0, mdx: 0},
  worried: {eye: [1, 1], eyeY: 0, brow: [0.016, 0.34, 0.016, -0.34], mw: 0.058, mh: 0.014, smile: 0, o: 0, mrot: -0.08, mdx: 0},
  shocked: {eye: [1.28, 1.28], eyeY: 0.004, brow: [0.04, 0.14, 0.04, -0.14], mw: 0.05, mh: 0.02, smile: 0, o: 1, mrot: 0, mdx: 0},
  happy: {eye: [0.62, 0.62], eyeY: 0.004, brow: [0.02, 0, 0.02, 0], mw: 0.08, mh: 0.012, smile: 1, o: 0, mrot: 0, mdx: 0},
  smirk: {eye: [0.95, 0.78], eyeY: 0, brow: [-0.004, -0.12, 0.034, -0.16], mw: 0.06, mh: 0.013, smile: 0.35, o: 0, mrot: 0.2, mdx: 0.016},
};
const blendFace = (a: Face, b: Face, k: number): Face => ({
  eye: [lerp(a.eye[0], b.eye[0], k), lerp(a.eye[1], b.eye[1], k)], eyeY: lerp(a.eyeY, b.eyeY, k),
  brow: a.brow.map((v, i) => lerp(v, b.brow[i], k)) as Face['brow'],
  mw: lerp(a.mw, b.mw, k), mh: lerp(a.mh, b.mh, k), smile: lerp(a.smile, b.smile, k), o: lerp(a.o, b.o, k),
  mrot: lerp(a.mrot, b.mrot, k), mdx: lerp(a.mdx, b.mdx, k),
});

// [armN.x, armN.z, armP.x, armP.z] (N = the arm on -x, P = the arm on +x)
const ARMS: Record<DevGesture, [number, number, number, number]> = {
  none: [0, -0.13, 0, 0.13],
  hands: [-0.45, -1.95, -0.45, 1.95],
  point: [0, -0.13, -1.05, 1.0],
  facepalm: [-2.75, 0.42, 0, 0.16],
  shrug: [-1.05, -0.6, -1.05, 0.6],
  cheer: [-1.45, -0.3, -1.45, 0.3],
};

// never scale a lit mesh to exactly 0 (singular normal matrix -> NaN pixels, which bloom then spreads)
const nz = (v: number) => Math.max(0.002, v);

const mat = (color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({color, flatShading: true, roughness: 0.78, metalness: 0, ...opts});
const vmat = (opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({vertexColors: true, flatShading: true, roughness: 0.8, metalness: 0, ...opts});

const useDevParts = () => useMemo(() => {
  // head: longer oval, tapered jaw, flatter face (so it reads as a face, not a ball)
  const head = facet(deform(new THREE.IcosahedronGeometry(0.28, 2), (v) => {
    v.x *= 0.9; v.y *= 1.12; v.z *= 0.95;
    const s = Math.min(1, Math.max(0, (0.02 - v.y) / 0.33));
    v.x *= 1 - 0.32 * s ** 1.3; v.z *= 1 - 0.07 * s;
    if (v.y < -0.26) v.y = -0.26 + (v.y + 0.26) * 0.4;
    if (v.z > 0.18) v.z = 0.18 + (v.z - 0.18) * 0.7;
  }), 0.005, 3);
  const headC = faceColors(head, (c, k) => {
    const stub = (c.y < -0.075 && c.z > 0.02) || (c.y < -0.02 && Math.abs(c.x) > 0.16 && c.z > -0.08);
    return stub ? mix(SKIN, STUB, 0.5 + rnd(k, 4) * 0.08) : shade(SKIN, 0.96 + rnd(k, 2) * 0.07);
  });
  const probe = new THREE.Mesh(headC, new THREE.MeshBasicMaterial());
  probe.updateMatrixWorld();
  const z = (x: number, y: number) => surfaceZ(probe, x, y);

  // hair: one shell displaced above a hairline (high at the front, low at the nape), a shallow
  // side-part groove, a fringe edge that overhangs the forehead, and a few swept locks on top
  const hairCol = (g: THREE.BufferGeometry, s: number) => faceColors(g, (_c, k) => shade(HAIR, 0.78 + rnd(k, s) * 0.5));
  const shell = hairCol(facet(deform(new THREE.IcosahedronGeometry(0.3, 2), (v) => {
    const d = v.clone().normalize();
    const az = Math.atan2(d.x, d.z);
    const fr = Math.max(0, Math.cos(az)), bk = Math.max(0, -Math.cos(az));
    const line = 0.5 * fr + 0.2 * (1 - fr - bk) - 0.5 * bk;
    if (d.y < line) { v.copy(d.multiplyScalar(0.16)); return; }
    const k = Math.min(1, (d.y - line) / 0.3);
    const part = Math.exp(-(((d.x + 0.3) / 0.1) ** 2)) * Math.max(0, d.z);
    const r = 0.288 + k * (0.028 + 0.05 * Math.max(0, d.z) + 0.026 * Math.max(0, d.x)) - part * 0.022 * k;
    v.copy(d.multiplyScalar(r));
    if (fr > 0.55 && d.y - line < 0.22) { v.z += 0.026; v.y += 0.008; }
    v.x *= 0.93; v.y *= 1.1; v.z *= 0.98;
  }), 0.007, 7), 1);
  const lock = (r1: number, r2: number, h: number, seed: number) =>
    hairCol(facet(deform(new THREE.CylinderGeometry(r1, r2, h, 5, 1), (v) => { v.z *= 0.42; }), 0.005, seed), seed);
  const locks = [
    {g: lock(0.02, 0.07, 0.25, 11), p: [0.03, 0.29, 0.17], r: [0.75, 0.15, -1.34]},
    {g: lock(0.018, 0.06, 0.19, 13), p: [0.15, 0.255, 0.18], r: [0.8, 0.4, -1.72]},
    {g: lock(0.015, 0.05, 0.12, 14), p: [-0.16, 0.265, 0.14], r: [0.7, -0.35, 1.9]},
  ];
  const side = hairCol(facet(new THREE.BoxGeometry(0.03, 0.1, 0.06, 1, 2, 1), 0.004, 21), 3);

  const nose = facet(new THREE.ConeGeometry(0.032, 0.065, 4), 0.003, 5);
  const ear = facet(deform(new THREE.IcosahedronGeometry(0.055, 0), (v) => { v.x *= 0.45; v.z *= 0.75; }), 0.004, 6);
  const eye = new THREE.SphereGeometry(0.031, 10, 8);
  const glint = new THREE.SphereGeometry(0.008, 6, 4);
  const brow = new THREE.BoxGeometry(0.088, 0.021, 0.022);
  const mouthBox = new THREE.BoxGeometry(1, 1, 0.026);
  const smileArc = new THREE.TorusGeometry(0.034, 0.008, 4, 10, Math.PI);
  const oMouth = new THREE.SphereGeometry(0.03, 10, 8);

  // body
  const torso = faceColors(facet(deform(new THREE.CylinderGeometry(0.17, 0.205, 0.37, 7, 2), (v) => { v.z *= 0.72; }), 0.006, 30),
    (_c, k) => shade(DENIM, 0.94 + rnd(k, 3) * 0.1));
  const panel = new THREE.BoxGeometry(0.1, 0.31, 0.03);
  const lapel = new THREE.BoxGeometry(0.045, 0.3, 0.03);
  const hood = facet(new THREE.TorusGeometry(0.1, 0.052, 5, 9), 0.006, 31);
  const hoodBack = facet(deform(new THREE.IcosahedronGeometry(0.1, 0), (v) => { v.x *= 1.45; v.y *= 0.8; v.z *= 0.6; }), 0.006, 32);
  const string = new THREE.CylinderGeometry(0.007, 0.007, 0.1, 4);
  const neck = new THREE.CylinderGeometry(0.068, 0.075, 0.09, 6);
  const sleeve = facet(new THREE.CylinderGeometry(0.05, 0.057, 0.3, 6), 0.004, 33);
  const cuff = new THREE.CylinderGeometry(0.059, 0.059, 0.035, 6);
  const hand = facet(new THREE.IcosahedronGeometry(0.054, 0), 0.006, 34);
  const leg = new THREE.BoxGeometry(0.1, 0.22, 0.12);
  const shoe = facet(new THREE.BoxGeometry(0.11, 0.06, 0.17), 0.004, 35);

  const m = {
    skin: vmat(), skinMid: mat(SKIN_MID), hair: vmat({roughness: 0.9, side: THREE.DoubleSide}), eye: mat('#120e0d', {roughness: 0.25, flatShading: false}),
    glint: new THREE.MeshBasicMaterial({color: '#ffffff'}), brow: mat('#1f1510'), mouth: mat(MOUTH, {roughness: 0.6}),
    denim: vmat(), denimD: mat(DENIM_D), hood: mat(HOOD), hoodL: mat(HOOD_L), string: mat('#ece9e3'),
    skinFlat: mat(SKIN), pants: mat(PANTS), shoe: mat(SHOE), denimFlat: mat(DENIM),
  };
  const zEye = z(0.094, 0.02), zBrow = z(0.094, 0.1), zNose = z(0, -0.035), zMouth = z(0, -0.135);
  return {head: headC, shell, locks, side, nose, ear, eye, glint, brow, mouthBox, smileArc, oMouth,
    torso, panel, lapel, hood, hoodBack, string, neck, sleeve, cuff, hand, leg, shoe, m, zEye, zBrow, zNose, zMouth};
}, []);

const Arm: React.FC<{P: ReturnType<typeof useDevParts>; x: number; rx: number; rz: number; lift: number}> = ({P, x, rx, rz, lift}) => (
  <group position={[x, 0.585 + lift, lift * 2.2]} rotation={[rx, 0, rz]}>
    <mesh geometry={P.sleeve} material={P.m.denimFlat} position={[0, -0.15, 0]} castShadow />
    <mesh geometry={P.cuff} material={P.m.hood} position={[0, -0.3, 0]} castShadow />
    <mesh geometry={P.hand} material={P.m.skinFlat} position={[0, -0.35, 0]} castShadow />
  </group>
);

export const DevR1: React.FC<{pose: DevPose; position?: [number, number, number]; scale?: number}> = ({pose, position = [0, 0, 0], scale = 1}) => {
  const P = useDevParts();
  const {t} = pose;
  const face = blendFace(FACES[pose.prevMood ?? pose.mood], FACES[pose.mood], clamp01(pose.moodK ?? 1));
  const g = clamp01(pose.g);
  const base = ARMS.none, tgt = ARMS[pose.gesture];
  const sway = Math.sin(t * 1.7) * 0.03;
  const arm = base.map((v, i) => lerp(v, tgt[i], g) + (i % 2 ? (i < 2 ? -1 : 1) * sway * (1 - g) : 0));
  const lift = pose.gesture === 'shrug' ? 0.03 * g : pose.gesture === 'facepalm' ? 0.035 * g : 0;
  const breathe = 1 + Math.sin(t * 2.3) * 0.012;
  const talk = clamp01(pose.talk);
  const hop = pose.hop ?? 0;
  const blink = clamp01(pose.blink);
  const eyeS = (k: number) => [1 * face.eye[k] ** 0.3, Math.max(0.08, face.eye[k] * (1 - blink * 0.92)), 0.42] as [number, number, number];
  const smileOn = clamp01(face.smile * (1 - talk * 1.6));
  const boxH = face.mh + talk * 0.05 + face.o * 0.004;
  const headBob = talk * 0.012 + Math.sin(t * 2.3 + 0.6) * 0.004;
  const mz = P.zMouth;

  return (
    <group position={[position[0], position[1] + hop, position[2]]} rotation={[0, pose.bodyYaw, 0]} scale={scale}>
      {/* legs + shoes */}
      {[-0.065, 0.065].map((x) => (
        <group key={x}>
          <mesh geometry={P.leg} material={P.m.pants} position={[x, 0.15, 0]} castShadow />
          <mesh geometry={P.shoe} material={P.m.shoe} position={[x, 0.03, 0.025]} castShadow receiveShadow />
        </group>
      ))}
      {/* torso: open denim jacket over the grey hoodie */}
      <group position={[0, 0.25, 0]} scale={[1, breathe, 1]}>
        <mesh geometry={P.torso} material={P.m.denim} position={[0, 0.185, 0]} castShadow />
        <mesh geometry={P.panel} material={P.m.hoodL} position={[0, 0.17, 0.135]} />
        <mesh geometry={P.lapel} material={P.m.denimD} position={[-0.068, 0.185, 0.132]} rotation={[0, 0.35, 0.05]} />
        <mesh geometry={P.lapel} material={P.m.denimD} position={[0.068, 0.185, 0.132]} rotation={[0, -0.35, -0.05]} />
        <mesh geometry={P.string} material={P.m.string} position={[-0.028, 0.29, 0.15]} />
        <mesh geometry={P.string} material={P.m.string} position={[0.028, 0.29, 0.15]} />
      </group>
      <mesh geometry={P.hood} material={P.m.hood} position={[0, 0.635, -0.04]} rotation={[Math.PI / 2 - 0.35, 0, 0]} scale={[1.15, 1, 0.85]} castShadow />
      <mesh geometry={P.hoodBack} material={P.m.hood} position={[0, 0.6, -0.11]} castShadow />
      <mesh geometry={P.neck} material={P.m.skinFlat} position={[0, 0.655, 0]} />
      <Arm P={P} x={-0.205} rx={arm[0]} rz={arm[1]} lift={lift} />
      <Arm P={P} x={0.205} rx={arm[2]} rz={arm[3]} lift={pose.gesture === 'shrug' ? lift : 0} />

      {/* head */}
      <group position={[0, 0.945 + headBob, 0]} rotation={[pose.headPitch, pose.headYaw, pose.headRoll]}>
        <mesh geometry={P.head} material={P.m.skin} castShadow receiveShadow />
        <mesh geometry={P.ear} material={P.m.skinMid} position={[-0.248, -0.01, -0.01]} />
        <mesh geometry={P.ear} material={P.m.skinMid} position={[0.248, -0.01, -0.01]} />
        <mesh geometry={P.nose} material={P.m.skinMid} position={[0, -0.035, P.zNose + 0.012]} rotation={[Math.PI / 2, 0, Math.PI / 4]} />
        {/* eyes */}
        {[-1, 1].map((s, k) => (
          <group key={s} position={[s * 0.094, 0.02 + face.eyeY, P.zEye - 0.006]} scale={eyeS(k)}>
            <mesh geometry={P.eye} material={P.m.eye} />
            <mesh geometry={P.glint} material={P.m.glint} position={[0.009, 0.012, 0.028]} />
          </group>
        ))}
        {/* brows */}
        {[-1, 1].map((s, k) => (
          <mesh key={s} geometry={P.brow} material={P.m.brow}
            position={[s * 0.094, 0.098 + face.brow[k * 2], P.zBrow - 0.002]} rotation={[0, s * 0.28, face.brow[k * 2 + 1]]} />
        ))}
        {/* mouth */}
        <group position={[face.mdx, -0.135, mz - 0.003]} rotation={[0, 0, face.mrot * (1 - talk * 0.6)]}>
          <mesh geometry={P.mouthBox} material={P.m.mouth} visible={smileOn < 0.97 && face.o * (1 - talk) < 0.97}
            scale={[nz(face.mw * (1 - talk * 0.2) * (1 - smileOn)), nz(boxH * (1 - face.o * (1 - talk))), 1]} />
          <mesh geometry={P.smileArc} material={P.m.mouth} rotation={[0, 0, Math.PI]} position={[0, 0.02, 0.004]} visible={smileOn > 0.03}
            scale={[nz(smileOn * (face.mw / 0.068)), nz(smileOn * 0.75), 1]} />
          <mesh geometry={P.oMouth} material={P.m.mouth} visible={face.o > 0.03}
            scale={[nz(face.o * (0.8 + talk * 0.3)), nz(face.o * (1 + talk * 0.5)), nz(face.o * 0.35)]} />
        </group>
        {/* hair */}
        <mesh geometry={P.shell} material={P.m.hair} castShadow />
        {P.locks.map((l, i) => (
          <mesh key={i} geometry={l.g} material={P.m.hair} position={l.p as any} rotation={l.r as any} castShadow />
        ))}
      </group>
    </group>
  );
};
