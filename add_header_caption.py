#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
動画に左上キャプション（見出し）を追加するスクリプト
"""

import sys
import subprocess
import argparse

def add_header_caption(input_video, output_video, caption_text, subtitle_file=None,
                       bg_color='#ff0000', text_color='#ffffff', font_size=24):
    """
    動画に左上キャプション（見出し）を追加

    Args:
        input_video: 入力動画パス
        output_video: 出力動画パス
        caption_text: キャプションテキスト
        subtitle_file: 字幕ファイル（オプション）
        bg_color: 背景色（例：#ff0000）
        text_color: 文字色（例：#ffffff）
        font_size: フォントサイズ
    """

    # 色をffmpeg形式に変換（#rrggbb -> 0xRRGGBB）
    def hex_to_ffmpeg_color(hex_color):
        # #rrggbb -> rrggbb
        hex_color = hex_color.lstrip('#')
        # RGB形式のまま（drawtextはRGB形式）
        return f"0x{hex_color}"

    bg_ffmpeg = hex_to_ffmpeg_color(bg_color)
    text_ffmpeg = hex_to_ffmpeg_color(text_color)

    # エスケープ処理
    caption_escaped = caption_text.replace(':', '\\:').replace("'", "\\'")

    # drawtextフィルター（左上のキャプション）
    # 太字効果: 黒い縁取りを追加して文字を太く見せる
    drawtext_filter = (
        f"drawtext=text='{caption_escaped}':"
        f"fontfile=/home/lasuone/.fonts/NotoSansJP.ttf:"
        f"fontsize={font_size}:"
        f"fontcolor={text_ffmpeg}:"
        f"borderw=3:"
        f"bordercolor=black:"
        f"box=1:"
        f"boxcolor={bg_ffmpeg}@1.0:"
        f"boxborderw=15:"
        f"x=50:"
        f"y=50"
    )

    # 字幕ファイルがある場合は組み合わせる
    if subtitle_file:
        subtitle_filter = (
            f"subtitles={subtitle_file}:"
            f"force_style='FontName=Noto Sans CJK JP,FontSize=24,"
            f"PrimaryColour=&HFFFFFF,OutlineColour=&H000000,"
            f"BackColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0,"
            f"Alignment=2,MarginV=50'"
        )
        vf = f"{subtitle_filter},{drawtext_filter}"
    else:
        vf = drawtext_filter

    # ffmpegコマンド
    cmd = [
        'ffmpeg',
        '-i', input_video,
        '-vf', vf,
        '-c:a', 'copy',
        '-y',
        output_video
    ]

    print(f"Adding header caption: '{caption_text}'")
    if subtitle_file:
        print(f"With subtitles from: {subtitle_file}")
    print(f"Output: {output_video}")
    print()

    # 実行
    subprocess.run(cmd, check=True)
    print("Done!")

def main():
    parser = argparse.ArgumentParser(description='動画に左上キャプション（見出し）を追加')
    parser.add_argument('input', help='入力動画ファイル')
    parser.add_argument('output', help='出力動画ファイル')
    parser.add_argument('--caption', '-c', required=True, help='キャプションテキスト')
    parser.add_argument('--subtitles', '-s', help='字幕SRTファイル（オプション）')
    parser.add_argument('--bg-color', default='#ff0000', help='背景色（デフォルト：#ff0000）')
    parser.add_argument('--text-color', default='#ffffff', help='文字色（デフォルト：#ffffff）')
    parser.add_argument('--font-size', type=int, default=24, help='フォントサイズ（デフォルト：24）')

    args = parser.parse_args()

    add_header_caption(
        args.input,
        args.output,
        args.caption,
        args.subtitles,
        args.bg_color,
        args.text_color,
        args.font_size
    )

if __name__ == '__main__':
    main()
