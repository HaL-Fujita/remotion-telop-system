import React, { useEffect, useMemo } from 'react';
import { AbsoluteFill, Video, staticFile, useVideoConfig } from 'remotion';
import { KeywordHighlightSubtitle } from '../components/KeywordHighlightSubtitle';
import { SpecialAnimationSubtitle } from '../components/SpecialAnimationSubtitle';
import { LeftSideCaption } from '../components/LeftSideCaption';
import type { SubtitleEntry } from '../types/telop';
import telopData from '../../video-telop-data.json';
import { loadFonts } from '../fonts';
import { splitSubtitlesByPeriod } from '../utils/splitByPeriod';
import { setSubtitleTiming, offsetSubtitlesFrom } from '../utils/adjustSubtitleTiming';

/**
 * 実際の動画にテロップを適用（キーワード強調スタイル）
 */
export const VideoWithTelop: React.FC = () => {
  const { width, height } = useVideoConfig();

  // フォントを読み込む
  useEffect(() => {
    loadFonts();
  }, []);

  // JSONデータから字幕を読み込み、句点で分割し、タイミング調整
  const subtitles: SubtitleEntry[] = useMemo(() => {
    const original: SubtitleEntry[] = telopData.subtitles;

    // 元の音声タイミングを保持しつつ、句点で分割
    const split = splitSubtitlesByPeriod(original);

    // 個別調整
    return split.map((entry) => {
      // 「朝ごはんでーす。」を1.5秒から表示
      if (entry.text === '朝ごはんでーす。') {
        return {
          ...entry,
          startTime: 1.5,
          endTime: 2.5,
        };
      }
      // 「このね、鮭が」を3秒から表示
      if (entry.text === 'このね、鮭が') {
        const duration = entry.endTime - entry.startTime;
        return {
          ...entry,
          startTime: 3.0,
          endTime: 3.0 + duration,
        };
      }
      // 「うまい。」を5秒から7秒まで表示
      if (entry.text === 'うまい。') {
        return {
          ...entry,
          startTime: 5.0,
          endTime: 7.0,
        };
      }
      // 「あと、日本食的なもの」を7秒から表示
      if (entry.text === 'あと、日本食的なもの') {
        const duration = entry.endTime - entry.startTime;
        return {
          ...entry,
          startTime: 7.0,
          endTime: 7.0 + duration,
        };
      }
      return entry;
    });
  }, []);

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

      {/* 左上の見出し */}
      <LeftSideCaption line1="江の島" line2="名物ラーメン" />

      {/* キーワード強調字幕 */}
      {subtitles.map((entry, index) => {
        return (
          <KeywordHighlightSubtitle
            key={index}
            entry={entry}
            videoWidth={width}
            videoHeight={height}
            normalColor="#FFFFFF"
            highlightColor="#FF0000"
            normalFontSize={87}
            highlightSizeMultiplier={1.0}
            outlineColor="#000000"
            outlineWidth={4.2}
            backgroundColor={null}
            backgroundOpacity={0.7}
            bottomMargin={56}
          />
        );
      })}
    </AbsoluteFill>
  );
};
