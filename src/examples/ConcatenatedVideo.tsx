import React from 'react';
import { AbsoluteFill, Video, Sequence, staticFile } from 'remotion';
import { WipeTransition } from '../components/WipeTransition';

export const ConcatenatedVideo: React.FC = () => {
  const video1Duration = 40 * 30; // 40 seconds at 30fps = 1200 frames
  const transitionDuration = 30; // 1 second transition at 30fps
  const video2Duration = 2424; // ~80.8 seconds at 30fps

  return (
    <AbsoluteFill>
      {/* First video - first 40 seconds of video_2_rendered.mp4 */}
      <Sequence from={0} durationInFrames={video1Duration}>
        <Video
          src={staticFile('video_2_first_40s.mp4')}
          style={{ width: '100%', height: '100%' }}
        />
      </Sequence>

      {/* Transition animation */}
      <Sequence from={video1Duration} durationInFrames={transitionDuration}>
        <WipeTransition duration={transitionDuration} />
      </Sequence>

      {/* Second video - 2_rendered.mp4 */}
      <Sequence from={video1Duration + transitionDuration} durationInFrames={video2Duration}>
        <Video
          src={staticFile('2_rendered.mp4')}
          style={{ width: '100%', height: '100%' }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
