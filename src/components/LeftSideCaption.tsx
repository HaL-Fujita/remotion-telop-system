import React from 'react';
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface LeftSideCaptionProps {
  /** 1行目のテキスト */
  line1: string;
  /** 2行目のテキスト */
  line2: string;
  /** 背景色 */
  backgroundColor?: string;
  /** テキスト色 */
  textColor?: string;
  /** アウトライン色 */
  outlineColor?: string;
  /** フォントサイズ */
  fontSize?: number;
  /** アウトライン幅 */
  outlineWidth?: number;
}

/**
 * 左上固定の見出しコンポーネント
 * スライドインアニメーション付き
 */
export const LeftSideCaption: React.FC<LeftSideCaptionProps> = ({
  line1,
  line2,
  backgroundColor = '#FF8C00', // オレンジ色
  textColor = '#FFFFFF',
  outlineColor = '#000000',
  fontSize = 36,
  outlineWidth = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // スライドインアニメーション（左から）
  const slideIn = spring({
    frame,
    fps,
    from: -300,
    to: 0,
    config: {
      damping: 20,
      stiffness: 100,
    },
  });

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

  const baseWidth = 280;
  const baseHeight = 150;
  const scale = 1.05;
  const offset = 10; // 10%のオフセット

  return (
    <div
      style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        transform: `translateX(${slideIn}px) scale(${scale})`,
        transformOrigin: 'top left',
        zIndex: 100,
      }}
    >
      {/* 白い長方形（背景） */}
      <div
        style={{
          position: 'absolute',
          top: `${offset}%`,
          left: `${offset}%`,
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        }}
      />

      {/* オレンジの長方形（前景） */}
      <div
        style={{
          position: 'relative',
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          backgroundColor,
          borderRadius: '16px',
          padding: '20px 30px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Noto Sans JP, sans-serif',
              fontSize: `${fontSize}px`,
              color: textColor,
              fontWeight: 700,
              textShadow: createOutline(outlineColor, outlineWidth),
              lineHeight: 1.2,
            }}
          >
            {line1}
          </div>
          <div
            style={{
              fontFamily: 'Noto Sans JP, sans-serif',
              fontSize: `${fontSize}px`,
              color: textColor,
              fontWeight: 700,
              textShadow: createOutline(outlineColor, outlineWidth),
              lineHeight: 1.2,
            }}
          >
            {line2}
          </div>
        </div>
      </div>
    </div>
  );
};
