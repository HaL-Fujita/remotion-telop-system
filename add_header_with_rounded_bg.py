#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
角丸背景付きの見出しキャプションを追加するスクリプト
"""

import sys
import subprocess
import argparse
from PIL import Image, ImageDraw, ImageFont
import tempfile
import os

def create_rounded_rectangle_with_text(text, width, height, bg_color, text_color,
                                       corner_radius=20, font_size=84, padding=15):
    """
    角丸の背景に文字を描画した画像を生成
    """
    # 画像を作成（透明背景）
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 角丸の矩形を描画
    draw.rounded_rectangle(
        [(0, 0), (width, height)],
        radius=corner_radius,
        fill=bg_color
    )

    # フォントを読み込む
    try:
        font = ImageFont.truetype('/home/lasuone/.fonts/NotoSansJP.ttf', font_size)
    except:
        font = ImageFont.load_default()

    # テキストのバウンディングボックスを取得
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # テキストを中央に配置
    text_x = (width - text_width) // 2
    text_y = (height - text_height) // 2 - bbox[1]

    # テキストを描画（太字効果のため複数回描画）
    for offset_x in [-2, -1, 0, 1, 2]:
        for offset_y in [-2, -1, 0, 1, 2]:
            if offset_x != 0 or offset_y != 0:
                draw.text((text_x + offset_x, text_y + offset_y), text,
                         font=font, fill=(0, 0, 0, 255))  # 黒い縁取り

    # メインのテキストを描画
    draw.text((text_x, text_y), text, font=font, fill=text_color)

    return img

def add_header_with_rounded_bg(input_video, output_video, caption_text, subtitle_file=None,
                                bg_color='#ff0000', text_color='#ffffff', font_size=84,
                                x=50, y=50):
    """
    角丸背景付きの見出しを追加
    """

    # 色をRGBAタプルに変換
    def hex_to_rgba(hex_color):
        hex_color = hex_color.lstrip('#')
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        return (r, g, b, 255)

    bg_rgba = hex_to_rgba(bg_color)
    text_rgba = hex_to_rgba(text_color)

    # テキストの幅と高さを推定（文字数 * フォントサイズ + パディング）
    text_length = len(caption_text)
    estimated_width = text_length * font_size + 60
    estimated_height = font_size + 60

    # 角丸背景付きの画像を生成
    img = create_rounded_rectangle_with_text(
        caption_text,
        estimated_width,
        estimated_height,
        bg_rgba,
        text_rgba,
        corner_radius=25,
        font_size=font_size,
        padding=30
    )

    # 一時ファイルに保存
    temp_img = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
    img.save(temp_img.name, 'PNG')
    temp_img.close()

    try:
        # 字幕フィルターとオーバーレイフィルターを組み合わせる
        if subtitle_file:
            subtitle_filter = (
                f"subtitles={subtitle_file}:"
                f"force_style='FontName=Noto Sans CJK JP,FontSize=24,"
                f"PrimaryColour=&HFFFFFF,OutlineColour=&H000000,"
                f"BackColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0,"
                f"Alignment=2,MarginV=50'"
            )
            # ffmpegコマンド（字幕あり）
            cmd = [
                'ffmpeg',
                '-i', input_video,
                '-i', temp_img.name,
                '-filter_complex', f'[0:v]{subtitle_filter}[v];[v][1:v]overlay={x}:{y}',
                '-c:a', 'copy',
                '-y',
                output_video
            ]
        else:
            # ffmpegコマンド（字幕なし）
            cmd = [
                'ffmpeg',
                '-i', input_video,
                '-i', temp_img.name,
                '-filter_complex', f'[0:v][1:v]overlay={x}:{y}',
                '-c:a', 'copy',
                '-y',
                output_video
            ]

        print(f"Adding rounded header caption: '{caption_text}'")
        if subtitle_file:
            print(f"With subtitles from: {subtitle_file}")
        print(f"Output: {output_video}")
        print()

        # 実行
        subprocess.run(cmd, check=True)
        print("Done!")

    finally:
        # 一時ファイルを削除
        if os.path.exists(temp_img.name):
            os.unlink(temp_img.name)

def main():
    parser = argparse.ArgumentParser(description='角丸背景付きの見出しを追加')
    parser.add_argument('input', help='入力動画ファイル')
    parser.add_argument('output', help='出力動画ファイル')
    parser.add_argument('--caption', '-c', required=True, help='キャプションテキスト')
    parser.add_argument('--subtitles', '-s', help='字幕SRTファイル（オプション）')
    parser.add_argument('--bg-color', default='#ff0000', help='背景色（デフォルト：#ff0000）')
    parser.add_argument('--text-color', default='#ffffff', help='文字色（デフォルト：#ffffff）')
    parser.add_argument('--font-size', type=int, default=84, help='フォントサイズ（デフォルト：84）')
    parser.add_argument('--x', type=int, default=50, help='X座標（デフォルト：50）')
    parser.add_argument('--y', type=int, default=50, help='Y座標（デフォルト：50）')

    args = parser.parse_args()

    add_header_with_rounded_bg(
        args.input,
        args.output,
        args.caption,
        args.subtitles,
        args.bg_color,
        args.text_color,
        args.font_size,
        args.x,
        args.y
    )

if __name__ == '__main__':
    main()
