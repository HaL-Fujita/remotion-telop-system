import type { SubtitleEntry } from '../types/telop';

/**
 * JSON形式の字幕データを読み込む
 */
export function loadSubtitlesFromJson(jsonData: any): SubtitleEntry[] {
  if (!jsonData || !jsonData.subtitles) {
    throw new Error('Invalid subtitle data format');
  }

  return jsonData.subtitles.map((sub: any) => ({
    id: sub.id,
    startTime: sub.startTime,
    endTime: sub.endTime,
    text: sub.text,
    style: sub.style,
    volumeLevel: sub.volumeLevel,
  }));
}

/**
 * SRT形式の字幕データをパースする
 */
export function parseSrtSubtitles(srtContent: string): SubtitleEntry[] {
  const subtitles: SubtitleEntry[] = [];
  const blocks = srtContent.trim().split('\n\n');

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;

    const id = parseInt(lines[0], 10);
    const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);

    if (!timeMatch) continue;

    const startTime =
      parseInt(timeMatch[1], 10) * 3600 +
      parseInt(timeMatch[2], 10) * 60 +
      parseInt(timeMatch[3], 10) +
      parseInt(timeMatch[4], 10) / 1000;

    const endTime =
      parseInt(timeMatch[5], 10) * 3600 +
      parseInt(timeMatch[6], 10) * 60 +
      parseInt(timeMatch[7], 10) +
      parseInt(timeMatch[8], 10) / 1000;

    const text = lines.slice(2).join('\n');

    subtitles.push({
      id,
      startTime,
      endTime,
      text,
    });
  }

  return subtitles;
}

/**
 * 字幕データを時間でフィルタリング
 */
export function filterSubtitlesByTime(
  subtitles: SubtitleEntry[],
  startTime: number,
  endTime: number
): SubtitleEntry[] {
  return subtitles.filter(
    (sub) => sub.endTime > startTime && sub.startTime < endTime
  );
}

/**
 * 字幕データをソート
 */
export function sortSubtitles(subtitles: SubtitleEntry[]): SubtitleEntry[] {
  return [...subtitles].sort((a, b) => a.startTime - b.startTime);
}
