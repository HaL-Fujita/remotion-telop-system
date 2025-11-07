import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import type { SubtitleEntry } from '../types/telop';
import highlightKeywords from '../data/highlight-keywords.json';

interface KeywordHighlightSubtitleProps {
  /** 字幕エントリ */
  entry: SubtitleEntry;
  /** 動画の幅 */
  videoWidth: number;
  /** 動画の高さ */
  videoHeight: number;
  /** 通常文字の色 */
  normalColor?: string;
  /** 強調文字の色 */
  highlightColor?: string;
  /** 通常フォントサイズ */
  normalFontSize?: number;
  /** 強調フォントサイズ倍率 */
  highlightSizeMultiplier?: number;
  /** 縁取り色 */
  outlineColor?: string;
  /** 縁取り幅 */
  outlineWidth?: number;
  /** 背景色（透明の場合は null） */
  backgroundColor?: string | null;
  /** 背景の透明度 */
  backgroundOpacity?: number;
  /** 画面下部からのマージン */
  bottomMargin?: number;
}

interface TextSegment {
  text: string;
  isHighlight: boolean;
  keyword?: string;
  category?: string;
}

/**
 * キーワード強調字幕コンポーネント
 * 感情表現などのキーワードを自動検出して色・サイズ・アニメーション付きで表示
 */
export const KeywordHighlightSubtitle: React.FC<KeywordHighlightSubtitleProps> = ({
  entry,
  videoWidth,
  videoHeight,
  normalColor = '#FFFFFF',
  highlightColor = '#FF0000',
  normalFontSize = 48,
  highlightSizeMultiplier = 1.4,
  outlineColor = '#000000',
  outlineWidth = 3,
  backgroundColor = null,
  backgroundOpacity = 0.7,
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

  // テキストをキーワードでセグメント分割（カテゴリ情報も含む）
  const segments = parseTextWithKeywords(entry.text, highlightKeywords);

  // デバッグ: セグメントをログ出力
  if (frameInEntry === 0) {
    console.log('Text:', entry.text);
    console.log('Segments:', segments);
  }

  // カテゴリごとの色を決定
  const getCategoryColor = (category?: string): string => {
    if (category === '食べ物') return '#FFFF00'; // 黄色
    return highlightColor; // デフォルトは赤
  };

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

  // 背景スタイル
  const bgStyle = backgroundColor
    ? {
        backgroundColor: `${backgroundColor}${Math.round(backgroundOpacity * 255)
          .toString(16)
          .padStart(2, '0')}`,
        padding: '12px 20px',
        borderRadius: '8px',
      }
    : {};

  // 特定のテキストに対するフォントサイズ調整
  const getAdjustedFontSize = (baseSize: number): number => {
    if (entry.text === 'グリーンティーフルーツマフィン') {
      return baseSize * 0.7;
    }
    return baseSize;
  };

  const adjustedNormalFontSize = getAdjustedFontSize(normalFontSize);
  const adjustedHighlightFontSize = getAdjustedFontSize(normalFontSize * highlightSizeMultiplier);

  // テキストが15文字を超える場合、15文字で改行
  const splitTextIntoLines = (segs: TextSegment[]): TextSegment[][] => {
    const lines: TextSegment[][] = [];
    let currentLine: TextSegment[] = [];
    let currentLength = 0;

    for (const seg of segs) {
      const segLength = seg.text.length;

      if (currentLength + segLength > 15 && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [seg];
        currentLength = segLength;
      } else {
        currentLine.push(seg);
        currentLength += segLength;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  };

  const lines = splitTextIntoLines(segments);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: `${bottomMargin}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: `${videoWidth * 0.9}px`,
        zIndex: 10,
        gap: '8px',
      }}
    >
      {lines.map((lineSegments, lineIndex) => (
        <div key={lineIndex} style={{ ...bgStyle, display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
          {lineSegments.map((segment, index) => {
          if (segment.isHighlight) {
            const segmentColor = getCategoryColor(segment.category);

            // キーワード：アニメーションなし、サイズ統一
            return (
              <span
                key={index}
                style={{
                  fontFamily: 'Noto Sans JP, sans-serif',
                  fontSize: `${adjustedNormalFontSize}px`,
                  color: segmentColor,
                  fontWeight: 900,
                  textShadow: createOutline(outlineColor, outlineWidth),
                  display: 'inline-block',
                  lineHeight: 1.3,
                }}
              >
                {segment.text}
              </span>
            );
          } else {
            // 通常テキスト
            return (
              <span
                key={index}
                style={{
                  fontFamily: 'Noto Sans JP, sans-serif',
                  fontSize: `${adjustedNormalFontSize}px`,
                  color: normalColor,
                  fontWeight: 900,
                  textShadow: createOutline(outlineColor, outlineWidth),
                  display: 'inline-block',
                  lineHeight: 1.3,
                }}
              >
                {segment.text}
              </span>
            );
          }
        })}
        </div>
      ))}
    </div>
  );
};

/**
 * テキストをキーワードで分割してセグメント配列を作成（カテゴリ情報付き）
 */
function parseTextWithKeywords(text: string, keywordsByCategory: Record<string, string[]>): TextSegment[] {
  const segments: TextSegment[] = [];
  let remainingText = text;
  let position = 0;

  // すべてのキーワードとカテゴリをマップに保存
  const keywordToCategoryMap = new Map<string, string>();
  const allKeywords: string[] = [];

  Object.entries(keywordsByCategory).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      keywordToCategoryMap.set(keyword, category);
      allKeywords.push(keyword);
    });
  });

  // キーワードを長い順にソート（長いキーワードを優先的にマッチ）
  const sortedKeywords = [...allKeywords].sort((a, b) => b.length - a.length);

  while (position < text.length) {
    let foundKeyword: string | null = null;
    let foundIndex = -1;

    // 現在位置から最も近いキーワードを検索
    for (const keyword of sortedKeywords) {
      const index = remainingText.indexOf(keyword);
      if (index !== -1 && (foundIndex === -1 || index < foundIndex)) {
        foundKeyword = keyword;
        foundIndex = index;
      }
    }

    if (foundKeyword && foundIndex !== -1) {
      // キーワードの前のテキスト（通常テキスト）
      if (foundIndex > 0) {
        segments.push({
          text: remainingText.substring(0, foundIndex),
          isHighlight: false,
        });
      }

      // キーワード（強調テキスト）
      segments.push({
        text: foundKeyword,
        isHighlight: true,
        keyword: foundKeyword,
        category: keywordToCategoryMap.get(foundKeyword),
      });

      // 残りのテキストを更新
      remainingText = remainingText.substring(foundIndex + foundKeyword.length);
      position += foundIndex + foundKeyword.length;
    } else {
      // キーワードが見つからない場合、残り全部を通常テキストとして追加
      segments.push({
        text: remainingText,
        isHighlight: false,
      });
      break;
    }
  }

  return segments;
}
