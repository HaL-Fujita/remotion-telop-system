import type { TelopConfig } from './telop';

/**
 * YouTube風テロップ設定
 * 一般的な日本のYouTube動画（ビジネス・教育系）で使われるスタイル
 */
export const youtubeTelopConfig: TelopConfig = {
  videoWidth: 1920,
  videoHeight: 1080,
  fps: 30,

  // 通常字幕: 白文字、背景なし、超太アウトライン
  normalStyle: {
    fontFamily: '"Gen Jyuu Gothic", "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    fontSize: 100,
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0,  // 背景を透明に
    outlineColor: '#000000',
    outlineWidth: 10,
    bottomMargin: 60,
    horizontalPadding: 24,
    verticalPadding: 12,
    fontWeight: 'bold',
  },

  // 大音量字幕: 黄色文字、背景なし、超太アウトライン
  loudStyle: {
    fontFamily: '"Gen Jyuu Gothic", "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    fontSize: 100,
    fontSizeMultiplier: 1.0,
    textColor: '#FFD700',  // ゴールド
    backgroundColor: '#000000',
    backgroundOpacity: 0,  // 背景を透明に
    outlineColor: '#000000',
    outlineWidth: 10,
    bottomMargin: 60,
    horizontalPadding: 28,
    verticalPadding: 14,
    fontWeight: 'bold',
  },

  // 速報バナー: 白文字、赤背景
  newsFlashStyle: {
    fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    fontSize: 48,
    textColor: '#FFFFFF',
    backgroundColor: '#E60012',  // 日本の赤
    backgroundOpacity: 0.9,
    outlineColor: '#000000',
    outlineWidth: 2,
    topMargin: 20,
    leftMargin: 20,
    fontWeight: 'bold',
    animation: {
      enableSlideIn: true,
      slideInFromX: -400,
      slideInToX: 20,
      slideInStartFrame: 0,
      slideInEndFrame: 15,  // 500ms at 30fps
      enableColorPulse: false,  // YouTubeスタイルではパルスなし
      pulseColors: ['#E60012'],
      pulseFramesPerColor: 30,
      fadeInDuration: 200,
    },
  },

  newsFlashText: '重要なお知らせ',
  showNewsFlash: true,
  loudVolumePercentile: 75,
};

/**
 * クリーンなYouTubeスタイル（速報バナーなし）
 */
export const cleanYoutubeStyle: TelopConfig = {
  ...youtubeTelopConfig,
  showNewsFlash: false,
};
