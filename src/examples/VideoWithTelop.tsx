import React, { useEffect } from 'react';
import { AbsoluteFill, Video, staticFile } from 'remotion';
import { TelopSystem } from '../components/TelopSystem';
import { youtubeTelopConfig } from '../types/youtube-style';
import type { SubtitleEntry } from '../types/telop';
import telopData from '../../video-telop-data.json';
import { loadFonts } from '../fonts';

/**
 * 実際の動画にテロップを適用（YouTube風スタイル）
 */
export const VideoWithTelop: React.FC = () => {
  // フォントを読み込む
  useEffect(() => {
    loadFonts();
  }, []);

  // JSONデータから字幕を読み込み
  const subtitles: SubtitleEntry[] = telopData.subtitles;

  // YouTube風スタイル設定
  const config = {
    ...youtubeTelopConfig,
    newsFlashText: '重要：AI自動編集',
    showNewsFlash: false,  // 速報バナーを非表示
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
