import React from 'react';
import { Composition } from 'remotion';
import { TelopDemo } from './examples/TelopDemo';
import { VideoWithTelop } from './examples/VideoWithTelop';
import { ConcatenatedVideo } from './examples/ConcatenatedVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TelopDemo"
        component={TelopDemo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="VideoWithTelop"
        component={VideoWithTelop}
        durationInFrames={2260}
        fps={29.97}
        width={1280}
        height={720}
        defaultProps={{}}
      />
      <Composition
        id="ConcatenatedVideo"
        component={ConcatenatedVideo}
        durationInFrames={3654}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
