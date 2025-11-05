import React from 'react';
import { Composition } from 'remotion';
import { TelopDemo } from './examples/TelopDemo';

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
    </>
  );
};
