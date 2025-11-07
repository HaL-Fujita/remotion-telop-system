#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
縦型動画用に字幕を最適化するスクリプト
1行あたりの文字数を短くして、縦型動画に適した形式にする
"""

import sys
import re

def parse_srt(srt_path):
    """SRTファイルをパースする"""
    with open(srt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # SRTエントリを分割
    entries = content.strip().split('\n\n')
    subtitles = []

    for entry in entries:
        lines = entry.strip().split('\n')
        if len(lines) >= 3:
            index = lines[0]
            timestamp = lines[1]
            text = ' '.join(lines[2:])

            # タイムスタンプをパース
            time_match = re.match(r'(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})', timestamp)
            if time_match:
                start_h, start_m, start_s, start_ms, end_h, end_m, end_s, end_ms = time_match.groups()
                start_time = int(start_h) * 3600 + int(start_m) * 60 + int(start_s) + int(start_ms) / 1000
                end_time = int(end_h) * 3600 + int(end_m) * 60 + int(end_s) + int(end_ms) / 1000

                subtitles.append({
                    'start': start_time,
                    'end': end_time,
                    'text': text
                })

    return subtitles

def split_text_for_vertical(text, max_chars=10):
    """
    テキストを縦型動画用に短く分割
    max_chars: 1行あたりの最大文字数（縦型動画用にデフォルト10文字）
    """
    # 句読点で分割を優先
    chunks = []
    current_chunk = ""

    for char in text:
        current_chunk += char

        # 句読点で区切るか、最大文字数に達したら分割
        if char in '。、！？' or len(current_chunk) >= max_chars:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = ""

    # 残りのテキスト
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks if chunks else [text]

def optimize_subtitles_for_vertical(subtitles, max_chars=10):
    """字幕を縦型動画用に最適化"""
    optimized = []
    entry_id = 1

    for sub in subtitles:
        text = sub['text']
        start_time = sub['start']
        end_time = sub['end']
        duration = end_time - start_time

        # テキストを短く分割
        chunks = split_text_for_vertical(text, max_chars)

        if len(chunks) > 1:
            # 複数に分割された場合、時間を均等に配分
            chunk_duration = duration / len(chunks)
            for i, chunk in enumerate(chunks):
                optimized.append({
                    'id': entry_id,
                    'start': start_time + (i * chunk_duration),
                    'end': start_time + ((i + 1) * chunk_duration),
                    'text': chunk
                })
                entry_id += 1
        else:
            # 分割不要の場合はそのまま
            optimized.append({
                'id': entry_id,
                'start': start_time,
                'end': end_time,
                'text': text
            })
            entry_id += 1

    return optimized

def format_timestamp_srt(seconds):
    """秒数をSRTタイムスタンプ形式に変換"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millisecs = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"

def export_srt(subtitles, output_path):
    """SRT形式で出力"""
    with open(output_path, 'w', encoding='utf-8') as f:
        for sub in subtitles:
            start = format_timestamp_srt(sub['start'])
            end = format_timestamp_srt(sub['end'])

            f.write(f"{sub['id']}\n")
            f.write(f"{start} --> {end}\n")
            f.write(f"{sub['text']}\n")
            f.write("\n")

def main():
    if len(sys.argv) < 2:
        print("Usage: python optimize_subtitles_for_vertical.py <input.srt> [output.srt] [max_chars]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else input_path.replace('.srt', '_vertical.srt')
    max_chars = int(sys.argv[3]) if len(sys.argv) > 3 else 10

    print(f"Optimizing subtitles for vertical video (max {max_chars} chars per line)...")

    # SRTファイルをパース
    subtitles = parse_srt(input_path)
    print(f"Parsed {len(subtitles)} subtitle entries")

    # 縦型動画用に最適化
    optimized = optimize_subtitles_for_vertical(subtitles, max_chars)
    print(f"Optimized to {len(optimized)} subtitle entries")

    # 出力
    export_srt(optimized, output_path)
    print(f"Optimized subtitles saved to: {output_path}")

if __name__ == '__main__':
    main()
