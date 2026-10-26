// The orange Claude buddy: a box with two eye slots, side nubs and four little legs. Feet at y=0.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {facet, faceColors, shade, rnd, lerp, clamp01} from './lowpoly';

export type BuddyEyes = 'neutral' | 'flat' | 'happy' | 'wide' | 'stare';
export type BuddyPose = {
  eyes: BuddyEyes; prevEyes?: BuddyEyes; eyesK?: number;
  talk: number; look: number; // look: -1 (towards -x) .. 1
  yaw: number; blink: number; t: number; hop?: number;
};

const ORANGE = '#dd6a43';
// eye slot: [width, height, y]
const SLOT: Record<BuddyEyes, [number, number, number]> = {
  neutral: [0.058, 0.12, 0.45],
  wide: [0.066, 0.14, 0.455],
  flat: [0.085, 0.02, 0.43],
  stare: [0.07, 0.03, 0.44],
  happy: [0.058, 0.12, 0.45],
};

const useBuddyParts = () => useMemo(() => {
  const col = (g: THREE.BufferGeometry, s: number, base = ORANGE) => faceColors(g, (_c, k) => shade(base, 0.96 + rnd(k, s) * 0.08));
  return {
    body: col(facet(new THREE.BoxGeometry(0.62, 0.48, 0.44, 2, 2, 2), 0.006, 41), 1),
    leg: col(new THREE.BoxGeometry(0.072, 0.17, 0.072), 2, '#cf5d38'),
    nub: col(new THREE.BoxGeometry(0.1, 0.075, 0.08), 3),
    eye: new THREE.BoxGeometry(1, 1, 0.012),
    caret: new THREE.BoxGeometry(0.055, 0.02, 0.012),
    m: {
      body: new THREE.MeshStandardMaterial({vertexColors: true, flatShading: true, roughness: 0.62}),
      eye: new THREE.MeshStandardMaterial({color: '#0d0b0b', roughness: 0.35}),
    },
  };
}, []);

export const Buddy: React.FC<{pose: BuddyPose; position?: [number, number, number]; scale?: number}> = ({pose, position = [0, 0, 0], scale = 1}) => {
  const P = useBuddyParts();
  const {t} = pose;
  const k = clamp01(pose.eyesK ?? 1);
  const a = SLOT[pose.prevEyes ?? pose.eyes], b = SLOT[pose.eyes];
  const happyW = (pose.eyes === 'happy' ? k : 0) + (pose.prevEyes === 'happy' && pose.eyes !== 'happy' ? 1 - k : 0);
  const w = lerp(a[0], b[0], k), h = lerp(a[1], b[1], k), ey = lerp(a[2], b[2], k);
  const talk = clamp01(pose.talk);
  const blink = clamp01(pose.blink);
  const sq = 1 + talk * 0.07, st = 1 - talk * 0.035;
  const idle = Math.sin(t * 2.1) * 0.008;
  const lookX = pose.look * 0.035;
  const eyeH = Math.max(0.012, h * (1 - blink * 0.88));
  const nubA = Math.sin(t * 9) * 0.25 * talk;

  return (
    <group position={[position[0], position[1] + (pose.hop ?? 0), position[2]]} rotation={[0, pose.yaw, 0]} scale={scale}>
      {[-0.21, -0.07, 0.07, 0.21].map((x, i) => (
        <mesh key={x} geometry={P.leg} material={P.m.body} position={[x, 0.085, (i % 2) * 0.03 - 0.015]} castShadow />
      ))}
      <group position={[0, 0.16, 0]} scale={[st, sq + idle, st]}>
        <mesh geometry={P.body} material={P.m.body} position={[0, 0.24, 0]} castShadow receiveShadow />
        <mesh geometry={P.nub} material={P.m.body} position={[-0.355, 0.2, 0]} rotation={[0, 0, nubA]} castShadow />
        <mesh geometry={P.nub} material={P.m.body} position={[0.355, 0.2, 0]} rotation={[0, 0, -nubA]} castShadow />
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.125 + lookX, ey - 0.16, 0.222]}>
            <mesh geometry={P.eye} material={P.m.eye} visible={happyW < 0.98}
              scale={[Math.max(0.002, w * (1 - happyW)), Math.max(0.002, eyeH * (1 - happyW)), 1]} />
            {/* happy: ^ ^  (never scale a mesh to exactly 0: a singular normal matrix gives NaN pixels that bloom spreads) */}
            <group visible={happyW > 0.02} scale={[Math.max(0.02, happyW), Math.max(0.02, happyW), 1]} position={[0, 0.01, 0]}>
              <mesh geometry={P.caret} material={P.m.eye} position={[-0.018, 0, 0]} rotation={[0, 0, 0.7]} />
              <mesh geometry={P.caret} material={P.m.eye} position={[0.018, 0, 0]} rotation={[0, 0, -0.7]} />
            </group>
          </group>
        ))}
      </group>
    </group>
  );
};
