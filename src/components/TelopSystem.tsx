import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { NormalSubtitle } from './NormalSubtitle';
import { LoudSubtitle } from './LoudSubtitle';
import { NewsFlashBanner } from './NewsFlashBanner';
import type { SubtitleEntry, TelopConfig } from '../types/telop';

interface TelopSystemProps {
  /** 字幕データの配列 */
  subtitles: SubtitleEntry[];
  /** テロップ全体の設定 */
  config: TelopConfig;
}

/**
 * テロップシステムメインコンポーネント
 * すべてのテロップ要素を統合管理
 */
export const TelopSystem: React.FC<TelopSystemProps> = ({ subtitles, config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 現在の時間（秒）
  const currentTime = frame / fps;

  // 現在表示すべき字幕を取得
  const currentSubtitle = subtitles.find(
    (sub) => currentTime >= sub.startTime && currentTime < sub.endTime
  );

  // 字幕のスタイルを決定
  const getSubtitleStyle = (subtitle: SubtitleEntry): 'normal' | 'loud' => {
    // スタイルが明示的に指定されている場合はそれを使用
    if (subtitle.style === 'normal' || subtitle.style === 'loud') {
      return subtitle.style;
    }

    // 音量レベルが指定されている場合、閾値と比較
    if (subtitle.volumeLevel !== undefined) {
      // volumeLevelは0-1の値、閾値をパーセンタイルから計算
      // ここでは簡易的に閾値を直接使用（実際はすべての字幕の音量を分析して計算）
      const threshold = config.loudVolumePercentile / 100;
      return subtitle.volumeLevel >= threshold ? 'loud' : 'normal';
    }

    // デフォルトはnormal
    return 'normal';
  };

  return (
    <>
      {/* 速報バナー */}
      {config.showNewsFlash && (
        <NewsFlashBanner
          text={config.newsFlashText}
          style={config.newsFlashStyle}
          videoWidth={config.videoWidth}
          videoHeight={config.videoHeight}
        />
      )}

      {/* 字幕 */}
      {currentSubtitle && (
        <>
          {getSubtitleStyle(currentSubtitle) === 'normal' ? (
            <NormalSubtitle
              entry={currentSubtitle}
              style={config.normalStyle}
              videoWidth={config.videoWidth}
              videoHeight={config.videoHeight}
            />
          ) : (
            <LoudSubtitle
              entry={currentSubtitle}
              style={config.loudStyle}
              videoWidth={config.videoWidth}
              videoHeight={config.videoHeight}
            />
          )}
        </>
      )}
    </>
  );
};
