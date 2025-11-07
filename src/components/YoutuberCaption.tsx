import React from 'react';
import { useCurrentFrame, spring } from 'remotion';

// テロップの見た目と配置のスタイルを定義
const baseCaptionStyle: React.CSSProperties = {
  // --- 配置（左上に固定） ---
  position: 'absolute',
  top: '40px', // 上端からの距離
  zIndex: 10, // 他の要素より手前に表示

  // --- 見た目 ---
  backgroundColor: '#FF0000', // 例: 目立つ赤色
  color: 'white',
  padding: '15px 30px',
  borderRadius: '10px',
  fontWeight: 'bold',
  fontSize: '48px', // 動画サイズに合わせて調整
  fontFamily: 'sans-serif',
};

export const YoutuberCaption: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();

  // スプリングアニメーションで左から滑り込ませる
  const slideIn = spring({
    frame: frame,
    from: -300, // 画面外（左）から開始
    to: 40, // 最終的な左からの位置（40px）
    fps: 30, // CompositionのFPSに合わせる
    config: {
      damping: 20,
      stiffness: 100,
    },
  });

  return (
    <div
      style={{
        ...baseCaptionStyle,
        // アニメーションの値を left プロパティに適用
        left: `${slideIn}px`,
      }}
    >
      {title}
    </div>
  );
};
