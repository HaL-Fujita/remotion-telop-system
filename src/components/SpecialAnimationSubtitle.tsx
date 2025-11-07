import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { SubtitleEntry } from '../types/telop';

interface SpecialAnimationSubtitleProps {
  /** 字幕エントリ */
  entry: SubtitleEntry;
  /** 動画の幅 */
  videoWidth: number;
  /** 動画の高さ */
  videoHeight: number;
  /** 文字色 */
  textColor?: string;
  /** 縁取り色 */
  outlineColor?: string;
  /** フォントサイズ */
  fontSize?: number;
  /** 縁取り幅 */
  outlineWidth?: number;
  /** 画面下部からのマージン */
  bottomMargin?: number;
}

/**
 * 特別アニメーション字幕コンポーネント
 * 1文字ずつ順番に跳ねるアニメーション
 */
export const SpecialAnimationSubtitle: React.FC<SpecialAnimationSubtitleProps> = ({
  entry,
  videoWidth,
  videoHeight,
  textColor = '#FFFFFF',
  outlineColor = '#FF69B4', // ピンク
  fontSize = 96,
  outlineWidth = 5,
  bottomMargin = 80,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // フレーム数を秒に変換
  const currentTime = frame / fps;

  // この字幕が表示される時間範囲内かチェック
  const isVisible = currentTime >= entry.startTime && currentTime < entry.endTime;

  if (!isVisible) {
    return null;
  }

  // 字幕表示開始からの経過フレーム数
  const entryStartFrame = entry.startTime * fps;
  const frameInEntry = frame - entryStartFrame;

  // テキストを1文字ずつ配列に
  const characters = entry.text.split('');

  // テキストシャドウでアウトラインを作成
  const createOutline = (color: string, width: number): string => {
    const offsets = [];
    for (let x = -width; x <= width; x++) {
      for (let y = -width; y <= width; y++) {
        if (x !== 0 || y !== 0) {
          offsets.push(`${x}px ${y}px 0 ${color}`);
        }
      }
    }
    return offsets.join(', ');
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: `${bottomMargin}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        zIndex: 10,
      }}
    >
      {characters.map((char, index) => {
        // 各文字が跳ねるタイミングをずらす（3フレームずつ遅延）
        const charDelay = index * 3;
        const charFrameInEntry = Math.max(0, frameInEntry - charDelay);

        // バウンスアニメーション
        const bounceProgress = spring({
          frame: charFrameInEntry,
          fps,
          config: {
            damping: 10,
            stiffness: 300,
            mass: 0.3,
          },
        });

        // Y軸の跳ね（上下移動）
        const bounceY = interpolate(
          bounceProgress,
          [0, 0.3, 0.6, 1],
          [20, -30, -10, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

        // スケールアニメーション（少し大きくなる）
        const scale = interpolate(bounceProgress, [0, 0.5, 1], [0.5, 1.2, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // 回転アニメーション（少し回る）
        const rotation = interpolate(
          bounceProgress,
          [0, 0.3, 0.6, 1],
          [0, -10, 5, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

        // フェードイン
        const opacity = interpolate(bounceProgress, [0, 0.2], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <span
            key={index}
            style={{
              fontFamily: 'Noto Sans JP, sans-serif',
              fontSize: `${fontSize}px`,
              color: textColor,
              fontWeight: 700,
              textShadow: createOutline(outlineColor, outlineWidth),
              display: 'inline-block',
              transform: `translateY(${bounceY}px) scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center bottom',
              opacity,
              marginRight: char === '。' ? '0px' : '2px',
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};
