import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './Reel';
import {PresenterTest} from './v2/PresenterTest';
import {Explainer} from './v2/Explainer';
import {Mystery} from './v2/Mystery';
import {Mystery2} from './v2/Mystery2';
import {Test3D} from './v3/Test3D';
import {Skit} from './v3/Skit';
import {Probe3D} from './v3/Probe3D';
import {CharacterSheet, HostTest, HostSingle} from './v2/CharacterSheet';
import {ConceptSheet, ConceptSingle} from './v2/Concepts';
import {ConceptSheet2, ConceptSingle2} from './v2/Concepts2';
import {ToonSheet, ToonSingle, ToonProbe} from './v2/Toon';
import {R4Sheet, R4Single} from './v2/Round4';

export const FPS = 30;

export const Root: React.FC = () => (
  <>
  <Composition id="Explainer" component={Explainer as any} width={1080} height={1920} fps={FPS} durationInFrames={30 * 60}
    defaultProps={{duration: 60, lines: [], mouth: []}}
    calculateMetadata={({props}: any) => ({durationInFrames: Math.ceil(props.duration * FPS)})} />
  <Composition id="Mystery" component={Mystery as any} width={1080} height={1920} fps={FPS} durationInFrames={30 * 60}
    defaultProps={{duration: 60, lines: [], mouth: []}}
    calculateMetadata={({props}: any) => ({durationInFrames: Math.ceil(props.duration * FPS)})} />
  <Composition id="HostTest" component={HostTest} width={1080} height={720} fps={30} durationInFrames={1} />
  <Composition id="CharacterSheet" component={CharacterSheet} width={1920} height={1440} fps={30} durationInFrames={1} />
  <Composition id="HostSingle" component={HostSingle as any} width={1200} height={1400} fps={30} durationInFrames={1} defaultProps={{mood: 'neutral', gesture: 'none'}} />
  <Composition id="ConceptSheet" component={ConceptSheet} width={2340} height={1990} fps={30} durationInFrames={1} />
  <Composition id="ConceptSingle" component={ConceptSingle as any} width={1080} height={1350} fps={30} durationInFrames={1} defaultProps={{k: 0}} />
  <Composition id="ConceptSheet2" component={ConceptSheet2} width={2412} height={1600} fps={30} durationInFrames={1} />
  <Composition id="ConceptSingle2" component={ConceptSingle2 as any} width={1080} height={1350} fps={30} durationInFrames={1} defaultProps={{k: 0}} />
  <Composition id="ToonSheet" component={ToonSheet} width={2412} height={1720} fps={30} durationInFrames={1} />
  <Composition id="ToonSingle" component={ToonSingle as any} width={1080} height={1350} fps={30} durationInFrames={1} defaultProps={{k: 0}} />
  <Composition id="ToonProbe" component={ToonProbe} width={1200} height={1000} fps={30} durationInFrames={1} />
  <Composition id="R4Sheet" component={R4Sheet} width={2320} height={2030} fps={30} durationInFrames={1} />
  <Composition id="R4Single" component={R4Single as any} width={1080} height={1350} fps={30} durationInFrames={1} defaultProps={{k: 0}} />
  <Composition id="Mystery2" component={Mystery2 as any} width={1080} height={1920} fps={FPS} durationInFrames={30 * 60}
    defaultProps={{duration: 60, lines: [], mouth: []}}
    calculateMetadata={({props}: any) => ({durationInFrames: Math.ceil(props.duration * FPS)})} />
  <Composition id="Skit" component={Skit as any} width={1080} height={1920} fps={FPS} durationInFrames={30 * 30}
    defaultProps={{duration: 30, lines: [], mouth: {}}}
    calculateMetadata={({props}: any) => ({durationInFrames: Math.ceil(props.duration * FPS)})} />
  <Composition id="Probe3D" component={Probe3D as any} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{}} />
  <Composition id="Test3D" component={Test3D} width={1080} height={1920} fps={30} durationInFrames={60} />
  <Composition id="PresenterTest" component={PresenterTest} width={1080} height={1920} fps={30} durationInFrames={180} />
  <Composition
    id="Reel"
    component={Reel as any}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={30 * 40}
    defaultProps={{duration: 40, lines: [], captions: [], series: 'BOT BRAIN', episode: 1}}
    calculateMetadata={({props}: any) => ({durationInFrames: Math.ceil(props.duration * FPS)})}
  />
  </>
);
