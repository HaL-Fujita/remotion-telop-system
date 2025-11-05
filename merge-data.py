#!/usr/bin/env python3
"""
SRT字幕ファイルと音声解析データをマージ
"""

import json
import sys


def parse_srt_time(time_str):
    """SRT時間形式をパース (HH:MM:SS,mmm -> seconds)"""
    parts = time_str.replace(',', '.').split(':')
    hours = int(parts[0])
    minutes = int(parts[1])
    seconds = float(parts[2])
    return hours * 3600 + minutes * 60 + seconds


def parse_srt(srt_path):
    """SRTファイルをパース"""
    with open(srt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    subtitles = []
    blocks = content.strip().split('\n\n')

    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) < 3:
            continue

        subtitle_id = int(lines[0])
        time_parts = lines[1].split(' --> ')
        start_time = parse_srt_time(time_parts[0])
        end_time = parse_srt_time(time_parts[1])
        text = '\n'.join(lines[2:])

        subtitles.append({
            'id': subtitle_id,
            'startTime': start_time,
            'endTime': end_time,
            'text': text
        })

    return subtitles


def split_long_text(text, max_length=15):
    """15文字を超えるテキストを文節で分割"""
    if len(text) <= max_length:
        return [text]

    # 文節の区切り文字
    breakpoints = ['、', '。', 'が', 'を', 'に', 'で', 'と', 'は', 'の', 'や', 'ね', 'よ', 'ぞ', 'か']

    # 15文字以内で最適な区切り位置を探す
    best_split = max_length
    for i in range(min(max_length, len(text))):
        if text[i] in breakpoints:
            best_split = i + 1

    # 最初の部分
    first_part = text[:best_split].strip()
    # 残りの部分（再帰的に分割）
    remaining = text[best_split:].strip()

    if remaining:
        return [first_part] + split_long_text(remaining, max_length)
    else:
        return [first_part]


def merge_with_audio_analysis(subtitles, audio_data):
    """字幕と音声解析データをマージ（20文字超は分割）"""
    analysis = audio_data['analysis_data']
    threshold = audio_data['threshold']

    enhanced_subtitles = []

    for subtitle in subtitles:
        start_time = subtitle['startTime']
        end_time = subtitle['endTime']
        mid_time = (start_time + end_time) / 2
        text = subtitle['text']

        # 該当時間の音量レベルを検索
        volume_level = 0.5
        is_loud = False

        for audio_sample in analysis:
            if abs(audio_sample['timestamp'] - mid_time) < 0.5:
                volume_level = audio_sample['rms_linear']
                is_loud = audio_sample['is_loud']
                break

        # スタイルを自動決定
        style = 'loud' if is_loud else 'normal'

        # テキストを分割（15文字超の場合）
        text_parts = split_long_text(text, max_length=15)

        if len(text_parts) == 1:
            # 分割不要
            enhanced_subtitles.append({
                **subtitle,
                'volumeLevel': volume_level,
                'style': style
            })
        else:
            # 時間を均等に分割して複数のテロップとして表示
            duration = end_time - start_time
            part_duration = duration / len(text_parts)

            for i, part in enumerate(text_parts):
                part_start = start_time + (i * part_duration)
                part_end = part_start + part_duration

                enhanced_subtitles.append({
                    'id': f"{subtitle['id']}-{i+1}",
                    'startTime': part_start,
                    'endTime': part_end,
                    'text': part,
                    'volumeLevel': volume_level,
                    'style': style
                })

    return enhanced_subtitles


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python merge-data.py <srt_file> <audio_analysis_json>")
        sys.exit(1)

    srt_file = sys.argv[1]
    audio_file = sys.argv[2]

    # SRTをパース
    subtitles = parse_srt(srt_file)
    print(f"Parsed {len(subtitles)} subtitles from SRT", file=sys.stderr)

    # 音声解析データを読み込み
    with open(audio_file, 'r', encoding='utf-8') as f:
        audio_data = json.load(f)

    print(f"Loaded audio analysis (threshold: {audio_data['threshold']:.4f})", file=sys.stderr)

    # マージ
    enhanced_subtitles = merge_with_audio_analysis(subtitles, audio_data)

    # 統計
    loud_count = sum(1 for sub in enhanced_subtitles if sub['style'] == 'loud')
    normal_count = len(enhanced_subtitles) - loud_count
    print(f"Normal: {normal_count}, Loud: {loud_count}", file=sys.stderr)

    # JSON出力
    output = {
        'videoPath': audio_data['video_path'],
        'subtitles': enhanced_subtitles,
        'audioAnalysis': {
            'threshold': audio_data['threshold'],
            'percentile': audio_data['percentile']
        }
    }

    print(json.dumps(output, indent=2, ensure_ascii=False))
