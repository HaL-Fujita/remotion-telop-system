import React from 'react';
import { AbsoluteFill, Video, staticFile } from 'remotion';
import { TelopSystem } from '../components/TelopSystem';
import { defaultTelopConfig } from '../types/telop';
import type { SubtitleEntry } from '../types/telop';
import telopData from '../../video-telop-data.json';

/**
 * 実際の動画にテロップを適用
 */
export const VideoWithTelop: React.FC = () => {
  // JSONデータから字幕を読み込み
  const subtitles: SubtitleEntry[] = telopData.subtitles;

  // カスタム設定（速報バナーのテキストを変更）
  const config = {
    ...defaultTelopConfig,
    newsFlashText: '速報：AIが動画編集してる',
  };

  return (
    <AbsoluteFill>
      {/* 背景動画 */}
      <Video
        src={staticFile('video.mp4')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* テロップシステム */}
      <TelopSystem subtitles={subtitles} config={config} />
    </AbsoluteFill>
  );
};
