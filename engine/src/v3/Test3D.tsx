import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame} from 'remotion';
import {EffectComposer, Bloom, DepthOfField, Vignette} from '@react-three/postprocessing';

export const Test3D: React.FC<{fx?: boolean}> = ({fx = true}) => {
  const f = useCurrentFrame();
  return (
    <ThreeCanvas width={1080} height={1920} camera={{position: [0, 1.2, 4], fov: 35}} style={{background: '#0b0d22'}}>
      <ambientLight intensity={0.4} color="#6b6cff" />
      <pointLight position={[2, 3, 2]} intensity={40} color="#ffd2a0" />
      <mesh rotation={[0.3, f * 0.03, 0]} position={[0, 1, 0]}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#e07a52" flatShading roughness={0.6} />
      </mesh>
      {Array.from({length: 20}).map((_, k) => (
        <mesh key={k} position={[-3 + (k % 10) * 0.7, 2 + Math.floor(k / 10) * 0.6, -6]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#ffd68a" toneMapped={false} />
        </mesh>
      ))}
      {fx && <EffectComposer>
        <DepthOfField focusDistance={0.01} focalLength={0.04} bokehScale={8} />
        <Bloom intensity={1.4} luminanceThreshold={0.6} mipmapBlur />
        <Vignette darkness={0.6} />
      </EffectComposer>}
    </ThreeCanvas>
  );
};
