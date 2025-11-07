import type { SubtitleEntry } from '../types/telop';

/**
 * 句点（。）で字幕を分割する
 * @param subtitles 元の字幕配列
 * @returns 句点で分割された字幕配列
 */
export function splitSubtitlesByPeriod(subtitles: SubtitleEntry[]): SubtitleEntry[] {
  const result: SubtitleEntry[] = [];

  subtitles.forEach((entry) => {
    const text = entry.text;

    // 句点で分割
    const sentences = text.split('。').filter((s) => s.trim().length > 0);

    if (sentences.length <= 1) {
      // 句点がない、または1文のみの場合はそのまま
      result.push(entry);
      return;
    }

    // 複数の文に分割された場合、時間を均等に配分
    const duration = entry.endTime - entry.startTime;
    const durationPerSentence = duration / sentences.length;

    sentences.forEach((sentence, index) => {
      // 最後のセンテンスかどうかチェック（元のテキストに句点がない場合がある）
      const isLast = index === sentences.length - 1;
      const hasTrailingPeriod = text.trim().endsWith('。');

      result.push({
        id: `${entry.id}-${index + 1}`,
        startTime: entry.startTime + index * durationPerSentence,
        endTime: entry.startTime + (index + 1) * durationPerSentence,
        text: sentence.trim() + (isLast && !hasTrailingPeriod ? '' : '。'), // 句点を戻す（最後で元々なければ追加しない）
        volumeLevel: entry.volumeLevel,
        style: entry.style,
      });
    });
  });

  return result;
}
