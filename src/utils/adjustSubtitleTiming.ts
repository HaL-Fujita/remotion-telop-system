import type { SubtitleEntry } from '../types/telop';

/**
 * 特定のテキストの字幕タイミングを調整
 * @param subtitles 字幕配列
 * @param targetText 調整対象のテキスト
 * @param startOffset 開始時刻のオフセット（秒）
 * @param endOffset 終了時刻のオフセット（秒）
 * @returns タイミング調整後の字幕配列
 */
export function adjustSubtitleTiming(
  subtitles: SubtitleEntry[],
  targetText: string,
  startOffset: number = 0,
  endOffset: number = 0
): SubtitleEntry[] {
  return subtitles.map((entry) => {
    if (entry.text === targetText) {
      return {
        ...entry,
        startTime: Math.max(0, entry.startTime + startOffset),
        endTime: Math.max(0, entry.endTime + endOffset),
      };
    }
    return entry;
  });
}

/**
 * 特定のテキストの字幕タイミングを絶対値で設定
 * @param subtitles 字幕配列
 * @param targetText 調整対象のテキスト
 * @param startTime 開始時刻（秒）
 * @param endTime 終了時刻（秒）
 * @returns タイミング調整後の字幕配列
 */
export function setSubtitleTiming(
  subtitles: SubtitleEntry[],
  targetText: string,
  startTime: number,
  endTime: number
): SubtitleEntry[] {
  return subtitles.map((entry) => {
    if (entry.text === targetText) {
      return {
        ...entry,
        startTime,
        endTime,
      };
    }
    return entry;
  });
}

/**
 * 特定のIDの字幕以降すべてに時間オフセットを適用
 * @param subtitles 字幕配列
 * @param fromId この ID 以降の字幕にオフセットを適用
 * @param offset 時間オフセット（秒）
 * @returns オフセット適用後の字幕配列
 */
export function offsetSubtitlesFrom(
  subtitles: SubtitleEntry[],
  fromId: string,
  offset: number
): SubtitleEntry[] {
  let shouldOffset = false;

  return subtitles.map((entry) => {
    if (entry.id === fromId) {
      shouldOffset = true;
    }

    if (shouldOffset) {
      return {
        ...entry,
        startTime: Math.max(0, entry.startTime + offset),
        endTime: Math.max(0, entry.endTime + offset),
      };
    }

    return entry;
  });
}
