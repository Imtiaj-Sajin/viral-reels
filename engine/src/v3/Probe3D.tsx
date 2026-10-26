// 2x2 turnaround of the 3D cast, for checking the character design in the real lighting.
import React, {useLayoutEffect} from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {DevR1, DevMood} from './DevR1';
import {Buddy, BuddyEyes} from './Buddy';
import {DeskWorld, KEY_TOP} from './DeskWorld';

const Look: React.FC<{pos: number[]; tgt: number[]; fov: number}> = ({pos, tgt, fov}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(pos[0], pos[1], pos[2]); c.fov = fov; c.updateProjectionMatrix(); c.lookAt(tgt[0], tgt[1], tgt[2]);
  });
  return null;
};

const VIEWS = [
  {pos: [0.1, 1.02, 2.5], tgt: [0, 1.0, 0], fov: 30},
  {pos: [1.7, 1.1, 1.9], tgt: [0, 1.0, 0], fov: 30},
  {pos: [2.5, 1.05, 0.05], tgt: [0, 1.0, 0], fov: 30},
  {pos: [-1.4, 1.35, -1.8], tgt: [0, 0.95, 0], fov: 30},
];

export const Probe3D: React.FC<{mood?: DevMood; eyes?: BuddyEyes; buddy?: boolean}> = ({mood = 'neutral', eyes = 'neutral', buddy}) => (
  <AbsoluteFill style={{background: '#000', display: 'flex', flexWrap: 'wrap', flexDirection: 'row'}}>
    {VIEWS.map((v, i) => (
      <div key={i} style={{width: 540, height: 960}}>
        <ThreeCanvas width={540} height={960} shadows dpr={1} camera={{fov: 30, near: 0.05, far: 90, position: [0, 1, 5]}}>
          <Look pos={buddy ? [v.pos[0] * 1.1, v.pos[1] - 0.45, v.pos[2] * 1.1] : v.pos} tgt={buddy ? [0, 0.48, 0] : v.tgt} fov={v.fov} />
          <DeskWorld t={0} screen={{hl: 0, stars: 3, chat: 0, starLog: 0, fontsOk: true}} />
          {buddy
            ? <Buddy position={[0, KEY_TOP, 0]} pose={{eyes, talk: 0, look: 0, yaw: 0, blink: 0, t: 0}} />
            : <DevR1 position={[0, KEY_TOP - 0.06, 0]} pose={{mood, talk: 0, gesture: 'none', g: 0, headYaw: 0, headPitch: 0, headRoll: 0, bodyYaw: 0, blink: 0, t: 0}} />}
        </ThreeCanvas>
      </div>
    ))}
  </AbsoluteFill>
);
