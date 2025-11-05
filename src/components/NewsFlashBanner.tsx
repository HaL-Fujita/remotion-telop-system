import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { NewsFlashStyle } from '../types/telop';

interface NewsFlashBannerProps {
  /** 表示するテキスト */
  text: string;
  /** スタイル設定 */
  style: NewsFlashStyle;
  /** 動画の幅 */
  videoWidth: number;
  /** 動画の高さ */
  videoHeight: number;
}

/**
 * 速報バナーコンポーネント
 * 白文字、赤背景、画面左上に表示
 * スライドイン＋背景色パルスアニメーション付き
 */
export const NewsFlashBanner: React.FC<NewsFlashBannerProps> = ({
  text,
  style,
  videoWidth,
  videoHeight,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // スライドインアニメーション
  let xPosition = style.leftMargin;
  if (style.animation.enableSlideIn) {
    const slideProgress = spring({
      frame: frame - style.animation.slideInStartFrame,
      fps,
      config: {
        damping: 200,
        stiffness: 100,
        mass: 1,
      },
    });

    xPosition = interpolate(
      slideProgress,
      [0, 1],
      [style.animation.slideInFromX, style.animation.slideInToX],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
  }

  // 背景色パルスアニメーション
  let currentBackgroundColor = style.backgroundColor;
  if (style.animation.enableColorPulse && style.animation.pulseColors.length > 0) {
    const totalPulseFrames =
      style.animation.pulseColors.length * style.animation.pulseFramesPerColor;
    const cycleFrame = frame % totalPulseFrames;
    const colorIndex = Math.floor(cycleFrame / style.animation.pulseFramesPerColor);
    const nextColorIndex = (colorIndex + 1) % style.animation.pulseColors.length;
    const frameInColor = cycleFrame % style.animation.pulseFramesPerColor;
    const transitionProgress = frameInColor / style.animation.pulseFramesPerColor;

    // 2色間を補間
    const currentColor = style.animation.pulseColors[colorIndex];
    const nextColor = style.animation.pulseColors[nextColorIndex];

    // HEX色を補間
    currentBackgroundColor = interpolateColor(currentColor, nextColor, transitionProgress);
  }

  // 透明度を計算
  const backgroundColor = `${currentBackgroundColor}${Math.round(
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

  // フェードイン
  const fadeInFrames = (style.animation.fadeInDuration / 1000) * fps;
  const opacity = interpolate(frame, [0, fadeInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: `${style.topMargin}px`,
        left: `${xPosition}px`,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        zIndex: 20,
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor,
          padding: `${style.topMargin}px ${style.leftMargin}px`,
          borderRadius: '8px',
          display: 'inline-block',
          transition: 'background-color 0.3s ease',
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
            display: 'inline-block',
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

/**
 * 2つのHEX色を補間する
 */
function interpolateColor(color1: string, color2: string, progress: number): string {
  // HEX → RGB変換
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  if (!c1 || !c2) {
    return color1;
  }

  // RGB補間
  const r = Math.round(c1.r + (c2.r - c1.r) * progress);
  const g = Math.round(c1.g + (c2.g - c1.g) * progress);
  const b = Math.round(c1.b + (c2.b - c1.b) * progress);

  // RGB → HEX変換
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
    .toString(16)
    .padStart(2, '0')}`;
}

/**
 * HEX色をRGBオブジェクトに変換
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
