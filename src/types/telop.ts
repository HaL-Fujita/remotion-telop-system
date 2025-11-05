/**
 * テロップシステムの型定義
 * hikaru.mp4スタイルのテロップを再現するための設定とデータ構造
 */

/**
 * 字幕のスタイルタイプ
 */
export type SubtitleStyleType = 'normal' | 'loud' | 'newsflash';

/**
 * 個別の字幕エントリ
 */
export interface SubtitleEntry {
  /** 字幕のID */
  id: number;
  /** 開始時間（秒） */
  startTime: number;
  /** 終了時間（秒） */
  endTime: number;
  /** 表示するテキスト */
  text: string;
  /** 使用するスタイル（指定しない場合は音量に基づいて自動判定） */
  style?: SubtitleStyleType;
  /** この時点での音量レベル（0-1、loudスタイルの自動判定に使用） */
  volumeLevel?: number;
}

/**
 * 通常字幕のスタイル設定
 */
export interface NormalSubtitleStyle {
  /** フォントファミリー */
  fontFamily: string;
  /** フォントサイズ（px） */
  fontSize: number;
  /** テキスト色（HEX） */
  textColor: string;
  /** 背景色（HEX） */
  backgroundColor: string;
  /** 背景の透明度（0-1） */
  backgroundOpacity: number;
  /** アウトライン色（HEX） */
  outlineColor: string;
  /** アウトライン幅（px） */
  outlineWidth: number;
  /** 下からの距離（px） */
  bottomMargin: number;
  /** 左右のパディング（px） */
  horizontalPadding: number;
  /** 上下のパディング（px） */
  verticalPadding: number;
  /** 太字にするか */
  fontWeight: 'normal' | 'bold';
}

/**
 * 大音量字幕のスタイル設定
 */
export interface LoudSubtitleStyle extends NormalSubtitleStyle {
  /** Normalスタイルとの相対的なサイズ比率 */
  fontSizeMultiplier: number;
}

/**
 * 速報バナーのスタイル設定
 */
export interface NewsFlashStyle {
  /** フォントファミリー */
  fontFamily: string;
  /** フォントサイズ（px） */
  fontSize: number;
  /** テキスト色（HEX） */
  textColor: string;
  /** 背景色（HEX） */
  backgroundColor: string;
  /** 背景の透明度（0-1） */
  backgroundOpacity: number;
  /** アウトライン色（HEX） */
  outlineColor: string;
  /** アウトライン幅（px） */
  outlineWidth: number;
  /** 上からの距離（px） */
  topMargin: number;
  /** 左からの距離（px） */
  leftMargin: number;
  /** 太字にするか */
  fontWeight: 'normal' | 'bold';
  /** アニメーション設定 */
  animation: NewsFlashAnimation;
}

/**
 * 速報バナーのアニメーション設定
 */
export interface NewsFlashAnimation {
  /** スライドイン有効化 */
  enableSlideIn: boolean;
  /** スライドイン開始位置（px、負の値で左側） */
  slideInFromX: number;
  /** スライドイン最終位置（px） */
  slideInToX: number;
  /** スライドイン開始時間（フレーム） */
  slideInStartFrame: number;
  /** スライドイン終了時間（フレーム） */
  slideInEndFrame: number;
  /** 背景色パルス有効化 */
  enableColorPulse: boolean;
  /** パルスで循環する色の配列（HEX） */
  pulseColors: string[];
  /** 各色の表示時間（フレーム） */
  pulseFramesPerColor: number;
  /** フェードイン時間（ミリ秒） */
  fadeInDuration: number;
}

/**
 * 音量解析の結果
 */
export interface AudioAnalysisResult {
  /** タイムスタンプ（秒） */
  timestamp: number;
  /** RMSレベル（0-1） */
  rmsLevel: number;
  /** 大音量と判定されるか */
  isLoud: boolean;
}

/**
 * 全体のテロップ設定
 */
export interface TelopConfig {
  /** 動画の幅（px） */
  videoWidth: number;
  /** 動画の高さ（px） */
  videoHeight: number;
  /** FPS */
  fps: number;
  /** 通常字幕のスタイル */
  normalStyle: NormalSubtitleStyle;
  /** 大音量字幕のスタイル */
  loudStyle: LoudSubtitleStyle;
  /** 速報バナーのスタイル */
  newsFlashStyle: NewsFlashStyle;
  /** 速報バナーのテキスト */
  newsFlashText: string;
  /** 速報バナーを表示するか */
  showNewsFlash: boolean;
  /** 音量の閾値（パーセンタイル、0-100） */
  loudVolumePercentile: number;
}

/**
 * デフォルトのテロップ設定（hikaru.mp4スタイル）
 */
export const defaultTelopConfig: TelopConfig = {
  videoWidth: 1920,
  videoHeight: 1080,
  fps: 30,
  normalStyle: {
    fontFamily: 'MS Gothic, "Noto Sans JP", sans-serif',
    fontSize: 128,
    textColor: '#000000',
    backgroundColor: '#FFFF00',
    backgroundOpacity: 0.5,
    outlineColor: '#FFFFFF',
    outlineWidth: 2,
    bottomMargin: 30,
    horizontalPadding: 20,
    verticalPadding: 10,
    fontWeight: 'bold',
  },
  loudStyle: {
    fontFamily: 'MS Gothic, "Noto Sans JP", sans-serif',
    fontSize: 160,
    fontSizeMultiplier: 1.25,
    textColor: '#FF0000',
    backgroundColor: '#FFFF00',
    backgroundOpacity: 0.5,
    outlineColor: '#FFFFFF',
    outlineWidth: 2,
    bottomMargin: 30,
    horizontalPadding: 20,
    verticalPadding: 10,
    fontWeight: 'bold',
  },
  newsFlashStyle: {
    fontFamily: 'Noto Sans JP, sans-serif',
    fontSize: 84,
    textColor: '#FFFFFF',
    backgroundColor: '#FF0000',
    backgroundOpacity: 0.75,
    outlineColor: '#000000',
    outlineWidth: 6,
    topMargin: 15,
    leftMargin: 15,
    fontWeight: 'bold',
    animation: {
      enableSlideIn: true,
      slideInFromX: -500,
      slideInToX: 15,
      slideInStartFrame: 0,
      slideInEndFrame: 18, // 600ms at 30fps
      enableColorPulse: true,
      pulseColors: ['#FF0000', '#FFA500', '#FFFF00'], // 赤→橙→黄
      pulseFramesPerColor: 21, // 700ms at 30fps
      fadeInDuration: 300,
    },
  },
  newsFlashText: '速報：保安検査官にいじられる（再）',
  showNewsFlash: true,
  loudVolumePercentile: 75,
};
