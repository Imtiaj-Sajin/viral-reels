// Night desk: the characters are toy-sized, standing on a laptop keyboard in front of its giant screen.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {SW, SH, drawScreen, ScreenState} from './ScreenUI';
import {rnd} from './lowpoly';

export const SCR = {w: 4.7, h: 4.7 * SH / SW, hinge: new THREE.Vector3(0, 0.02, -2.45), tilt: -0.14, cy: 0.13 + (4.7 * SH / SW) / 2};
const R = new THREE.Matrix4().makeRotationX(SCR.tilt);
export const SCREEN_N = new THREE.Vector3(0, 0, 1).applyMatrix4(R);
// canvas pixel -> world point on the screen surface
export const screenPoint = (cx: number, cy: number) =>
  new THREE.Vector3((cx / SW - 0.5) * SCR.w, SCR.cy + (0.5 - cy / SH) * SCR.h, 0.037).applyMatrix4(R).add(SCR.hinge);

const KEY_PITCH = 0.38, KEY_COLS = 13, KEY_ROWS = 8;
export const KEY_TOP = 0.06;

const Screen: React.FC<{state: ScreenState}> = ({state}) => {
  const {canvas, tex} = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SW; canvas.height = SH;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    return {canvas, tex};
  }, []);
  const key = JSON.stringify(state);
  useMemo(() => {
    drawScreen(canvas.getContext('2d')!, state);
    tex.needsUpdate = true;
  }, [key]);
  return (
    <group position={SCR.hinge} rotation={[SCR.tilt, 0, 0]}>
      <mesh position={[0, SCR.cy, 0]} receiveShadow>
        <boxGeometry args={[SCR.w + 0.2, SCR.h + 0.24, 0.07]} />
        <meshStandardMaterial color="#121318" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, SCR.cy, 0.037]}>
        <planeGeometry args={[SCR.w, SCR.h]} />
        <meshBasicMaterial map={tex} toneMapped={false} color="#d9dbe6" />
      </mesh>
      {/* hinge */}
      <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, SCR.w * 0.9, 12]} />
        <meshStandardMaterial color="#1c1d24" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
};

const Keyboard: React.FC = () => {
  const {keys, glow} = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mtl = new THREE.MeshStandardMaterial({color: '#20222c', roughness: 0.5, metalness: 0.1});
    const items: [number, number, number][] = [];
    for (let r = 0; r < KEY_ROWS; r++) {
      const z = -2.2 + r * KEY_PITCH;
      if (r === KEY_ROWS - 1) {
        // bottom row: modifiers + a long space bar
        [-2.28, -1.9, -1.52].forEach((x) => items.push([x, z, 0.32]));
        items.push([0, z, 2.6]);
        [1.52, 1.9, 2.28].forEach((x) => items.push([x, z, 0.32]));
      } else for (let c = 0; c < KEY_COLS; c++) items.push([-2.28 + c * KEY_PITCH, z, 0.32]);
    }
    const keys = new THREE.InstancedMesh(geo, mtl, items.length);
    const m = new THREE.Matrix4();
    items.forEach(([x, z, w], i) => {
      m.compose(new THREE.Vector3(x, 0.03, z), new THREE.Quaternion(), new THREE.Vector3(w, 0.06, 0.32));
      keys.setMatrixAt(i, m);
    });
    keys.castShadow = true; keys.receiveShadow = true;
    // under-key backlight: purple on the left fading to warm orange on the right
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 8;
    const c = cv.getContext('2d')!; const g = c.createLinearGradient(0, 0, 512, 0);
    g.addColorStop(0, '#5a48ff'); g.addColorStop(0.55, '#8a5cff'); g.addColorStop(1, '#ff8a4c');
    c.fillStyle = g; c.fillRect(0, 0, 512, 8);
    const gt = new THREE.CanvasTexture(cv); gt.colorSpace = THREE.SRGBColorSpace;
    return {keys, glow: gt};
  }, []);
  return (
    <group>
      <primitive object={keys} />
      <mesh position={[0, 0.004, -0.87]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.1, 3.0]} />
        <meshBasicMaterial map={glow} toneMapped={false} color="#9a9aa6" />
      </mesh>
    </group>
  );
};

const City: React.FC = () => {
  const {bld, win} = useMemo(() => {
    const bgeo = new THREE.BoxGeometry(1, 1, 1);
    const bld = new THREE.InstancedMesh(bgeo, new THREE.MeshBasicMaterial({color: '#0a0c1b'}), 46);
    const wins: THREE.Matrix4[] = [];
    const m = new THREE.Matrix4();
    for (let i = 0; i < 46; i++) {
      const w = 0.9 + rnd(i, 1) * 1.6, h = 2.5 + rnd(i, 2) * 7.5, d = 1.2, x = -18 + i * 0.8 + rnd(i, 3) * 0.6, z = -19 - rnd(i, 4) * 6;
      m.compose(new THREE.Vector3(x, h / 2 - 1, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
      bld.setMatrixAt(i, m);
      for (let yy = 0.2; yy < h - 0.4; yy += 0.42) for (let xx = -w / 2 + 0.18; xx < w / 2 - 0.12; xx += 0.3) {
        if (rnd(i * 977 + Math.round(yy * 10) * 31 + Math.round(xx * 10), 5) < 0.36)
          wins.push(new THREE.Matrix4().compose(new THREE.Vector3(x + xx, yy - 1 + 0.1, z + d / 2 + 0.01), new THREE.Quaternion(), new THREE.Vector3(0.14, 0.2, 1)));
      }
    }
    const win = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({color: new THREE.Color('#ffc870').multiplyScalar(2.2), toneMapped: false}), wins.length);
    wins.forEach((mm, i) => win.setMatrixAt(i, mm));
    return {bld, win};
  }, []);
  return <group><primitive object={bld} /><primitive object={win} /></group>;
};

const Room: React.FC = () => {
  const sky = useMemo(() => {
    const cv = document.createElement('canvas'); cv.width = 8; cv.height = 256;
    const c = cv.getContext('2d')!; const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#070a24'); g.addColorStop(0.6, '#1a1d55'); g.addColorStop(1, '#3a2a6a');
    c.fillStyle = g; c.fillRect(0, 0, 8, 256);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  // wall with a big window opening: x -7..7, y 0.6..9
  const wall = '#0d1028';
  const bulbs = Array.from({length: 17}, (_, i) => {
    const x = -6 + i * 0.75, s = (x / 6) ** 2;
    return [x, 3.25 + 0.55 * s, -5.4] as [number, number, number];
  });
  return (
    <group>
      <mesh position={[0, 6, -32]}><planeGeometry args={[90, 40]} /><meshBasicMaterial map={sky} /></mesh>
      <City />
      {[[0, -2.4, 50, 6], [0, 13, 50, 8], [-16, 5, 18, 16], [16, 5, 18, 16]].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, -8]}><boxGeometry args={[w, h, 0.3]} /><meshStandardMaterial color={wall} roughness={0.9} /></mesh>
      ))}
      {/* window mullions */}
      {[-7, -3.5, 0, 3.5, 7].map((x) => (
        <mesh key={x} position={[x, 4.8, -7.9]}><boxGeometry args={[0.16, 8.4, 0.2]} /><meshStandardMaterial color="#05060d" /></mesh>
      ))}
      {[0.6, 4.6, 9].map((y) => (
        <mesh key={y} position={[0, y, -7.9]}><boxGeometry args={[14.2, 0.14, 0.2]} /><meshStandardMaterial color="#05060d" /></mesh>
      ))}
      {/* string lights */}
      {bulbs.map((p, i) => (
        <mesh key={i} position={p}><sphereGeometry args={[0.065, 10, 8]} />
          <meshBasicMaterial color={new THREE.Color('#ffd49a').multiplyScalar(3.2)} toneMapped={false} /></mesh>
      ))}
      {/* desk */}
      <mesh position={[0, -0.39, -1]} receiveShadow><boxGeometry args={[40, 0.5, 16]} /><meshStandardMaterial color="#19151d" roughness={0.75} /></mesh>
      {/* giant mug */}
      <group position={[3.9, -0.14, 0.4]}>
        <mesh position={[0, 0.85, 0]} castShadow receiveShadow><cylinderGeometry args={[0.85, 0.8, 1.7, 14]} /><meshStandardMaterial color="#e6dfd2" roughness={0.45} flatShading /></mesh>
        <mesh position={[0, 1.69, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.78, 14]} /><meshStandardMaterial color="#2a160c" roughness={0.3} /></mesh>
        <mesh position={[-0.98, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.36, 0.1, 6, 12, Math.PI]} /><meshStandardMaterial color="#e6dfd2" roughness={0.45} flatShading /></mesh>
      </group>
    </group>
  );
};

const Dust: React.FC<{t: number}> = ({t}) => {
  const pts = useMemo(() => Array.from({length: 46}, (_, i) => ({
    x: -2.2 + rnd(i, 11) * 4.4, y: 0.25 + rnd(i, 12) * 2.6, z: -1.6 + rnd(i, 13) * 4.2, s: 0.004 + rnd(i, 14) * 0.007,
    warm: rnd(i, 15) < 0.3, ph: rnd(i, 16) * 6.28,
  })), []);
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} position={[p.x + Math.sin(t * 0.3 + p.ph) * 0.12, p.y + Math.sin(t * 0.21 + p.ph * 2) * 0.08 + t * 0.012, p.z]}>
          <sphereGeometry args={[p.s, 6, 4]} />
          <meshBasicMaterial color={new THREE.Color(p.warm ? '#ff9a7a' : '#dfe3ff').multiplyScalar(1.15)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

export const DeskWorld: React.FC<{t: number; screen: ScreenState}> = ({t, screen}) => (
  <group>
    <hemisphereLight args={['#8a84ff', '#2a2036', 1.25]} />
    <pointLight position={[0.4, 1.3, 3.2]} intensity={2.2} distance={8} color="#ffe2c8" />
    <directionalLight position={[-2.8, 4.4, 3.4]} intensity={2.4} color="#ffd2a8" castShadow
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3}
      shadow-camera-near={0.5} shadow-camera-far={14} shadow-bias={-0.0004} shadow-normalBias={0.02} />
    <pointLight position={[0, 1.5, -1.8]} intensity={9} distance={7} color="#8e9cff" />
    <pointLight position={[2.4, 1.7, 1.5]} intensity={7} distance={7} color="#ff9a66" />
    <Room />
    {/* laptop base */}
    <mesh position={[0, -0.07, -0.41]} receiveShadow castShadow><boxGeometry args={[5.6, 0.14, 4.42]} />
      <meshStandardMaterial color="#2a2c35" roughness={0.42} metalness={0.45} /></mesh>
    <mesh position={[0, 0.003, 1.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[1.9, 0.95]} />
      <meshStandardMaterial color="#30323c" roughness={0.35} metalness={0.3} /></mesh>
    <Keyboard />
    <Screen state={screen} />
    <Dust t={t} />
  </group>
);
