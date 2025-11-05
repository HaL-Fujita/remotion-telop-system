import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { SubtitleEntry, NormalSubtitleStyle } from '../types/telop';

interface NormalSubtitleProps {
  /** 字幕エントリ */
  entry: SubtitleEntry;
  /** スタイル設定 */
  style: NormalSubtitleStyle;
  /** 動画の幅 */
  videoWidth: number;
  /** 動画の高さ */
  videoHeight: number;
}

/**
 * 通常字幕コンポーネント
 * 黒文字、黄色背景、画面下部中央に表示
 */
export const NormalSubtitle: React.FC<NormalSubtitleProps> = ({
  entry,
  style,
  videoWidth,
  videoHeight,
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

  // 透明度を計算（RGBA形式に変換）
  const backgroundColor = `${style.backgroundColor}${Math.round(
    style.backgroundOpacity * 255
  )
    .toString(16)
    .padStart(2, '0')}`;

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

  // 背景が透明の場合は背景ボックスを表示しない
  const showBackground = style.backgroundOpacity > 0;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: `${style.bottomMargin}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: `${videoWidth * 0.9}px`,
        zIndex: 10,
      }}
    >
      {showBackground ? (
        <div
          style={{
            backgroundColor,
            padding: `${style.verticalPadding}px ${style.horizontalPadding}px`,
            borderRadius: '8px',
            display: 'inline-block',
          }}
        >
          <span
            style={{
              fontFamily: style.fontFamily,
              fontSize: `${style.fontSize}px`,
              color: style.textColor,
              fontWeight: style.fontWeight,
              textShadow: createOutline(style.outlineColor, style.outlineWidth),
              whiteSpace: 'nowrap',
              textAlign: 'center',
              display: 'inline-block',
              lineHeight: 1.3,
            }}
          >
            {entry.text}
          </span>
        </div>
      ) : (
        <span
          style={{
            fontFamily: style.fontFamily,
            fontSize: `${style.fontSize}px`,
            color: style.textColor,
            fontWeight: style.fontWeight,
            textShadow: createOutline(style.outlineColor, style.outlineWidth),
            whiteSpace: 'nowrap',
            textAlign: 'center',
            display: 'inline-block',
            lineHeight: 1.3,
          }}
        >
          {entry.text}
        </span>
      )}
    </div>
  );
};
