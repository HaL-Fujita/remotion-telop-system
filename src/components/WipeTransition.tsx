import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface WipeTransitionProps {
  duration: number;
}

export const WipeTransition: React.FC<WipeTransitionProps> = ({ duration }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [0, duration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
        clipPath: `inset(0 ${100 - progress * 100}% 0 0)`,
        zIndex: 100,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 120,
          fontWeight: 'bold',
          color: 'white',
          opacity: interpolate(progress, [0.3, 0.5, 0.7], [0, 1, 0]),
          textShadow: '0 0 30px rgba(255, 255, 255, 0.8)',
          fontFamily: 'sans-serif',
        }}
      >
        いざ実食！
      </div>
    </div>
  );
};
