import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TelopSystem } from '../components/TelopSystem';
import { defaultTelopConfig } from '../types/telop';
import type { SubtitleEntry } from '../types/telop';

/**
 * テロップシステムのデモ
 * hikaru.mp4スタイルのテロップを表示
 */
export const TelopDemo: React.FC = () => {
  // サンプル字幕データ
  const sampleSubtitles: SubtitleEntry[] = [
    {
      id: 1,
      startTime: 0,
      endTime: 2,
      text: 'バンチョやるじゃん。',
      style: 'normal',
      volumeLevel: 0.4,
    },
    {
      id: 2,
      startTime: 2,
      endTime: 4,
      text: '東大生っぽいね。',
      style: 'normal',
      volumeLevel: 0.5,
    },
    {
      id: 3,
      startTime: 4,
      endTime: 6,
      text: '東大生ですから、',
      style: 'normal',
      volumeLevel: 0.45,
    },
    {
      id: 4,
      startTime: 6,
      endTime: 7.5,
      text: '一応。',
      style: 'loud',
      volumeLevel: 0.85,
    },
    {
      id: 5,
      startTime: 7.5,
      endTime: 9,
      text: 'すごいです！',
      style: 'loud',
      volumeLevel: 0.9,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#87CEEB',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* 背景（空のような色） */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)',
        }}
      />

      {/* テロップシステム */}
      <TelopSystem subtitles={sampleSubtitles} config={defaultTelopConfig} />

      {/* デモ用の中央テキスト */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '48px',
          color: '#333',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '20px',
          zIndex: 1,
        }}
      >
        <div>hikaru.mp4 スタイル</div>
        <div style={{ fontSize: '32px', marginTop: '20px', color: '#666' }}>
          テロップシステム デモ
        </div>
      </div>
    </AbsoluteFill>
  );
};
