import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HostArt, HMood, HGesture, HOST_COLORS} from './Host';
import {INTER, SERIF, MONO} from './Explainer';

const PAPER = '#f2efe9', INK = '#121214', RED = '#f0412f', MUTE = '#8b8780';

export const HostTest: React.FC = () => (
  <AbsoluteFill style={{background: PAPER, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 40}}>
    <HostArt id="a" mood="neutral" gesture="palm" width={600} height={710} />
    <HostArt id="b" mood="happy" mouth={0.6} viewBox="110 20 380 520" width={420} height={575} />
  </AbsoluteFill>
);

const Label: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: MONO, fontSize: 22, color: MUTE, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', marginTop: 8}}>{children}</div>
);

const HEAD = '92 14 416 560';

export const CharacterSheet: React.FC = () => {
  const moods: [HMood, number, string][] = [['neutral', 0, 'neutral'], ['happy', 0.55, 'happy'], ['shocked', 0, 'shocked'], ['smirk', 0, 'smirk'], ['worried', 0.25, 'worried'], ['neutral', 0.75, 'talking']];
  const poses: [HGesture, HMood, string][] = [['point', 'neutral', 'point'], ['palm', 'smirk', 'explain'], ['hands', 'shocked', 'no way'], ['wave', 'happy', 'wave']];
  return (
    <AbsoluteFill style={{background: PAPER, fontFamily: INTER, color: INK}}>
      <AbsoluteFill style={{opacity: 0.05, backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '6px 6px'}} />
      {/* title */}
      <div style={{position: 'absolute', left: 80, top: 60}}>
        <div style={{fontFamily: MONO, fontSize: 24, color: MUTE, letterSpacing: 3}}>// CHARACTER SHEET · V1</div>
        <div style={{fontSize: 92, fontWeight: 800, letterSpacing: -3, lineHeight: 1.0, marginTop: 10}}>The <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: RED, fontSize: 108}}>host</span></div>
      </div>
      {/* main figure */}
      <div style={{position: 'absolute', left: 20, top: 250}}>
        <HostArt id="main" mood="neutral" gesture="palm" width={760} height={900} clip />
      </div>
      {/* palette */}
      <div style={{position: 'absolute', left: 80, top: 1200, display: 'flex', gap: 18}}>
        {[['skin', HOST_COLORS.skin], ['hair', HOST_COLORS.hair], ['shirt', HOST_COLORS.shirt], ['stripe', HOST_COLORS.stripeDark], ['accent', RED]].map(([n, c]) => (
          <div key={n} style={{textAlign: 'center'}}><div style={{width: 84, height: 84, borderRadius: 20, background: c, border: '3px solid rgba(0,0,0,0.12)'}} />
            <Label>{n}</Label></div>
        ))}
      </div>
      {/* expressions */}
      <div style={{position: 'absolute', left: 860, top: 80, fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: INK}}>EXPRESSIONS</div>
      <div style={{position: 'absolute', left: 860, top: 130, display: 'grid', gridTemplateColumns: 'repeat(3, 330px)', gap: 22}}>
        {moods.map(([m, mo, label], k) => (
          <div key={k} style={{background: '#fff', borderRadius: 28, padding: '16px 0 14px', boxShadow: '0 14px 30px rgba(30,20,10,0.10)'}}>
            <div style={{display: 'flex', justifyContent: 'center'}}><HostArt id={`e${k}`} mood={m} mouth={mo} viewBox={HEAD} width={262} height={353} clip /></div>
            <Label>{label}</Label>
          </div>
        ))}
      </div>
      {/* poses */}
      <div style={{position: 'absolute', left: 860, top: 1040, fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: INK}}>POSES</div>
      <div style={{position: 'absolute', left: 860, top: 1090, display: 'flex', gap: 22}}>
        {poses.map(([gst, m, label], k) => (
          <div key={k} style={{width: 238, background: '#fff', borderRadius: 28, padding: '14px 0 12px', boxShadow: '0 14px 30px rgba(30,20,10,0.10)', overflow: 'hidden'}}>
            <div style={{display: 'flex', justifyContent: 'center'}}><HostArt id={`p${k}`} mood={m} gesture={gst} mouth={k === 1 ? 0.4 : 0} viewBox="-110 0 840 900" width={226} height={242} clip /></div>
            <Label>{label}</Label>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* single transparent renders */
export const HostSingle: React.FC<{mood?: HMood; gesture?: HGesture; mouth?: number; head?: boolean}> = ({mood = 'neutral', gesture = 'none', mouth = 0, head}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    {head ? <HostArt id="s" mood={mood} mouth={mouth} viewBox={HEAD} width={1000} height={1346} clip />
      : <HostArt id="s" mood={mood} gesture={gesture} mouth={mouth} width={1140} height={1350} clip />}
  </AbsoluteFill>
);
