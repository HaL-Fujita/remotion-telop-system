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


def merge_with_audio_analysis(subtitles, audio_data):
    """字幕と音声解析データをマージ"""
    analysis = audio_data['analysis_data']
    threshold = audio_data['threshold']

    enhanced_subtitles = []

    for subtitle in subtitles:
        start_time = subtitle['startTime']
        end_time = subtitle['endTime']
        mid_time = (start_time + end_time) / 2

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

        enhanced_subtitles.append({
            **subtitle,
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
