import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Presenter, Mood, Gesture} from './Presenter';

// frame N*30 shows combo N (mood, gesture, mouth level)
const COMBOS: [Mood, Gesture, number][] = [
  ['neutral', 'none', 0], ['neutral', 'point', 0.6], ['shocked', 'hands', 0.8], ['smirk', 'palm', 0.3],
  ['worried', 'none', 0.5], ['happy', 'wave', 0.7],
];

export const PresenterTest: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.min(COMBOS.length - 1, Math.floor(f / 30));
  const [mood, gesture, m] = COMBOS[k];
  const mouth = Array.from({length: 400}, () => m);
  return (
    <AbsoluteFill style={{background: '#f2efe9'}}>
      <Presenter mood={mood} prevMood={mood} moodAt={-1} gesture={gesture} gestureFrom={(k * 30 - 25) / 30} gestureTo={99} mouth={mouth} />
    </AbsoluteFill>
  );
};
