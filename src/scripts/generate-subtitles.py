#!/usr/bin/env python3
"""
字幕自動生成スクリプト
OpenAI Whisper APIを使用して動画から字幕を自動生成します。
"""

import sys
import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import List, Dict, Optional

# OpenAI APIが利用可能かチェック
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Warning: openai package not found. Install with: pip install openai", file=sys.stderr)


def extract_audio(video_path: str, output_path: str) -> None:
    """
    動画から音声を抽出
    """
    cmd = [
        'ffmpeg',
        '-i', video_path,
        '-vn',  # 映像なし
        '-acodec', 'pcm_s16le',  # PCM 16-bit
        '-ar', '16000',  # 16kHz（Whisper推奨）
        '-ac', '1',  # モノラル
        '-y',  # 上書き
        output_path
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"Audio extraction failed: {result.stderr}")


def transcribe_with_whisper_api(audio_path: str, api_key: str, language: str = 'ja') -> Dict:
    """
    Whisper APIで音声を文字起こし
    """
    if not OPENAI_AVAILABLE:
        raise Exception("OpenAI package not installed")

    client = openai.OpenAI(api_key=api_key)

    with open(audio_path, 'rb') as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language=language,
            response_format="verbose_json",
            timestamp_granularity="word"
        )

    return transcript


def transcribe_with_whisper_local(audio_path: str, model: str = 'base') -> Dict:
    """
    ローカルのWhisperで文字起こし（whisperコマンドが必要）
    """
    cmd = [
        'whisper',
        audio_path,
        '--model', model,
        '--language', 'Japanese',
        '--output_format', 'json',
        '--output_dir', tempfile.gettempdir()
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"Whisper transcription failed: {result.stderr}")

    # JSONファイルを読み込み
    json_path = Path(audio_path).with_suffix('.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def split_text_japanese(text: str, max_length: int = 20) -> List[str]:
    """
    日本語テキストを自然な単位で分割
    """
    try:
        from janome.tokenizer import Tokenizer
        tokenizer = Tokenizer()

        # 形態素解析
        tokens = list(tokenizer.tokenize(text, wakati=True))

        chunks = []
        current_chunk = ""

        for token in tokens:
            if len(current_chunk) + len(token) <= max_length:
                current_chunk += token
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = token

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    except ImportError:
        # Janomeがない場合は単純分割
        print("Warning: janome not found, using simple splitting", file=sys.stderr)
        chunks = []
        for i in range(0, len(text), max_length):
            chunks.append(text[i:i + max_length])
        return chunks


def create_subtitle_entries(transcript: Dict, max_chars_per_line: int = 20) -> List[Dict]:
    """
    トランスクリプトから字幕エントリを作成
    """
    subtitles = []
    entry_id = 1

    # segmentsがある場合
    if 'segments' in transcript:
        for segment in transcript['segments']:
            text = segment['text'].strip()
            start_time = segment['start']
            end_time = segment['end']

            # テキストが長い場合は分割
            if len(text) > max_chars_per_line:
                chunks = split_text_japanese(text, max_chars_per_line)
                duration = end_time - start_time
                chunk_duration = duration / len(chunks)

                for i, chunk in enumerate(chunks):
                    subtitles.append({
                        'id': entry_id,
                        'startTime': start_time + (i * chunk_duration),
                        'endTime': start_time + ((i + 1) * chunk_duration),
                        'text': chunk
                    })
                    entry_id += 1
            else:
                subtitles.append({
                    'id': entry_id,
                    'startTime': start_time,
                    'endTime': end_time,
                    'text': text
                })
                entry_id += 1

    # wordsがある場合（より細かい制御）
    elif 'words' in transcript:
        current_text = ""
        current_start = None
        current_end = None

        for word in transcript['words']:
            word_text = word['word']

            if current_start is None:
                current_start = word['start']

            current_text += word_text
            current_end = word['end']

            if len(current_text) >= max_chars_per_line:
                subtitles.append({
                    'id': entry_id,
                    'startTime': current_start,
                    'endTime': current_end,
                    'text': current_text.strip()
                })
                entry_id += 1
                current_text = ""
                current_start = None

        # 残りのテキスト
        if current_text:
            subtitles.append({
                'id': entry_id,
                'startTime': current_start,
                'endTime': current_end,
                'text': current_text.strip()
            })

    else:
        # フォールバック：全体テキストのみ
        text = transcript.get('text', '')
        subtitles.append({
            'id': 1,
            'startTime': 0,
            'endTime': 10,
            'text': text
        })

    return subtitles


def export_srt(subtitles: List[Dict], output_path: str) -> None:
    """
    SRT形式で出力
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        for sub in subtitles:
            start = format_timestamp_srt(sub['startTime'])
            end = format_timestamp_srt(sub['endTime'])

            f.write(f"{sub['id']}\n")
            f.write(f"{start} --> {end}\n")
            f.write(f"{sub['text']}\n")
            f.write("\n")


def format_timestamp_srt(seconds: float) -> str:
    """
    秒をSRT形式のタイムスタンプに変換
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)

    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate-subtitles.py <video_path> [--api-key KEY] [--local] [--output OUTPUT]", file=sys.stderr)
        print("\nOptions:", file=sys.stderr)
        print("  --api-key KEY    OpenAI API key for Whisper API", file=sys.stderr)
        print("  --local          Use local Whisper installation", file=sys.stderr)
        print("  --output PATH    Output file path (default: subtitles.json)", file=sys.stderr)
        sys.exit(1)

    video_path = sys.argv[1]
    api_key = None
    use_local = False
    output_path = "subtitles.json"

    # 引数パース
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == '--api-key' and i + 1 < len(sys.argv):
            api_key = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == '--local':
            use_local = True
            i += 1
        elif sys.argv[i] == '--output' and i + 1 < len(sys.argv):
            output_path = sys.argv[i + 1]
            i += 2
        else:
            i += 1

    # 環境変数からAPIキーを取得
    if not api_key and not use_local:
        api_key = os.environ.get('OPENAI_API_KEY')

    if not Path(video_path).exists():
        print(f"Error: File not found: {video_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Generating subtitles from: {video_path}", file=sys.stderr)

    # 音声を抽出
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_audio:
        audio_path = tmp_audio.name

    try:
        print("Extracting audio...", file=sys.stderr)
        extract_audio(video_path, audio_path)

        # 文字起こし
        print("Transcribing audio...", file=sys.stderr)
        if use_local:
            transcript = transcribe_with_whisper_local(audio_path)
        elif api_key:
            transcript = transcribe_with_whisper_api(audio_path, api_key)
        else:
            print("Error: No API key provided and --local not specified", file=sys.stderr)
            print("Set OPENAI_API_KEY environment variable or use --api-key", file=sys.stderr)
            sys.exit(1)

        # 字幕エントリを作成
        print("Creating subtitle entries...", file=sys.stderr)
        subtitles = create_subtitle_entries(transcript)

        print(f"Generated {len(subtitles)} subtitle entries", file=sys.stderr)

        # JSON形式で出力
        output_data = {
            'video_path': video_path,
            'subtitles': subtitles
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        print(f"Subtitles saved to: {output_path}", file=sys.stderr)

        # SRT形式でも出力
        srt_path = Path(output_path).with_suffix('.srt')
        export_srt(subtitles, str(srt_path))
        print(f"SRT subtitles saved to: {srt_path}", file=sys.stderr)

    finally:
        # 一時ファイルを削除
        if Path(audio_path).exists():
            Path(audio_path).unlink()


if __name__ == '__main__':
    main()
