#!/usr/bin/env python3
"""
動画処理統合スクリプト
字幕生成と音声解析を統合し、Remotionで使用可能なデータを生成します。
"""

import sys
import json
import subprocess
from pathlib import Path
from typing import Dict, List


def run_subtitle_generation(video_path: str, api_key: str = None) -> Dict:
    """
    字幕生成スクリプトを実行
    """
    script_dir = Path(__file__).parent
    generate_script = script_dir / 'generate-subtitles.py'

    cmd = ['python3', str(generate_script), video_path]

    if api_key:
        cmd.extend(['--api-key', api_key])

    output_path = 'subtitles.json'
    cmd.extend(['--output', output_path])

    print(f"Running subtitle generation...", file=sys.stderr)
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise Exception(f"Subtitle generation failed: {result.stderr}")

    print(result.stderr, file=sys.stderr)

    # 生成されたJSONを読み込み
    with open(output_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def run_audio_analysis(video_path: str, percentile: float = 75.0) -> Dict:
    """
    音声解析スクリプトを実行
    """
    script_dir = Path(__file__).parent
    analyze_script = script_dir / 'analyze-audio.py'

    cmd = ['python3', str(analyze_script), video_path, str(percentile)]

    print(f"Running audio analysis...", file=sys.stderr)
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise Exception(f"Audio analysis failed: {result.stderr}")

    print(result.stderr, file=sys.stderr)

    # JSON出力をパース
    return json.loads(result.stdout)


def merge_subtitle_and_audio_data(subtitle_data: Dict, audio_data: Dict) -> List[Dict]:
    """
    字幕データと音声データをマージ
    """
    subtitles = subtitle_data['subtitles']
    analysis = audio_data['analysis_data']
    threshold = audio_data['threshold']

    # 各字幕エントリに対して、その時間帯の音量レベルを取得
    enhanced_subtitles = []

    for subtitle in subtitles:
        start_time = subtitle['startTime']
        end_time = subtitle['endTime']
        mid_time = (start_time + end_time) / 2

        # 該当時間の音量レベルを検索
        volume_level = 0.5  # デフォルト値
        is_loud = False

        for audio_sample in analysis:
            if abs(audio_sample['timestamp'] - mid_time) < 0.5:  # 0.5秒の範囲
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


def main():
    if len(sys.argv) < 2:
        print("Usage: python process-video.py <video_path> [--api-key KEY] [--percentile N] [--output OUTPUT]", file=sys.stderr)
        print("\nOptions:", file=sys.stderr)
        print("  --api-key KEY       OpenAI API key for Whisper API", file=sys.stderr)
        print("  --percentile N      Volume percentile threshold (default: 75)", file=sys.stderr)
        print("  --output PATH       Output file path (default: telop-data.json)", file=sys.stderr)
        sys.exit(1)

    video_path = sys.argv[1]
    api_key = None
    percentile = 75.0
    output_path = "telop-data.json"

    # 引数パース
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == '--api-key' and i + 1 < len(sys.argv):
            api_key = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == '--percentile' and i + 1 < len(sys.argv):
            percentile = float(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == '--output' and i + 1 < len(sys.argv):
            output_path = sys.argv[i + 1]
            i += 2
        else:
            i += 1

    if not Path(video_path).exists():
        print(f"Error: File not found: {video_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Processing video: {video_path}", file=sys.stderr)
    print(f"=" * 60, file=sys.stderr)

    try:
        # 字幕生成
        subtitle_data = run_subtitle_generation(video_path, api_key)
        print(f"✓ Generated {len(subtitle_data['subtitles'])} subtitles", file=sys.stderr)

        # 音声解析
        audio_data = run_audio_analysis(video_path, percentile)
        print(f"✓ Analyzed audio with threshold {audio_data['threshold']:.4f}", file=sys.stderr)

        # データをマージ
        enhanced_subtitles = merge_subtitle_and_audio_data(subtitle_data, audio_data)
        print(f"✓ Merged subtitle and audio data", file=sys.stderr)

        # 最終出力データを作成
        output_data = {
            'videoPath': video_path,
            'subtitles': enhanced_subtitles,
            'audioAnalysis': {
                'threshold': audio_data['threshold'],
                'percentile': audio_data['percentile']
            }
        }

        # JSON出力
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        print(f"=" * 60, file=sys.stderr)
        print(f"✓ Telop data saved to: {output_path}", file=sys.stderr)

        # 統計情報
        loud_count = sum(1 for sub in enhanced_subtitles if sub['style'] == 'loud')
        normal_count = len(enhanced_subtitles) - loud_count
        print(f"\nStatistics:", file=sys.stderr)
        print(f"  Total subtitles: {len(enhanced_subtitles)}", file=sys.stderr)
        print(f"  Normal style: {normal_count}", file=sys.stderr)
        print(f"  Loud style: {loud_count}", file=sys.stderr)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
