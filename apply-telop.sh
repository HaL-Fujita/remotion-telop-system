#!/bin/bash
# Hikaru風テロップ適用スクリプト

set -e

# 使い方
if [ $# -lt 1 ]; then
    echo "使い方: ./apply-telop.sh <動画ファイル> [字幕SRTファイル] [速報バナーテキスト]"
    echo ""
    echo "例:"
    echo "  ./apply-telop.sh video.mp4                                    # 字幕自動生成"
    echo "  ./apply-telop.sh video.mp4 subtitles.srt                      # 既存字幕を使用"
    echo "  ./apply-telop.sh video.mp4 subtitles.srt '速報：重大発表'     # バナー付き"
    exit 1
fi

VIDEO_PATH="$1"
SRT_FILE="$2"
NEWS_TEXT="${3:-速報：AIが動画編集してる}"

# 動画ファイル確認
if [ ! -f "$VIDEO_PATH" ]; then
    echo "エラー: 動画ファイルが見つかりません: $VIDEO_PATH"
    exit 1
fi

echo "============================================"
echo "Hikaru風テロップ適用"
echo "============================================"
echo "動画: $VIDEO_PATH"
echo "速報バナー: $NEWS_TEXT"
echo ""

# 音声解析
echo "[1/4] 音声解析中..."
python3 src/scripts/analyze-audio.py "$VIDEO_PATH" 75 2>/dev/null > audio-analysis.json
echo "✓ 音声解析完了"

# 字幕処理
if [ -n "$SRT_FILE" ] && [ -f "$SRT_FILE" ]; then
    echo "[2/4] 既存字幕を使用: $SRT_FILE"
    python3 merge-data.py "$SRT_FILE" audio-analysis.json > video-telop-data.json
else
    echo "[2/4] 字幕を自動生成中..."
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "エラー: OPENAI_API_KEY が設定されていません"
        echo "export OPENAI_API_KEY='your-key' を実行してください"
        exit 1
    fi
    python3 src/scripts/generate-subtitles.py "$VIDEO_PATH" --api-key "$OPENAI_API_KEY" --output subtitles.json 2>&1 | grep -v "^Extracting\|^Transcribing\|^Creating\|^Generated\|^Subtitles\|^SRT"
    python3 merge-data.py subtitles.srt audio-analysis.json > video-telop-data.json
fi
echo "✓ 字幕処理完了"

# 動画をpublicにコピー
echo "[3/4] 動画を配置中..."
mkdir -p public
cp "$VIDEO_PATH" public/video.mp4
echo "✓ 動画配置完了"

# 速報バナーテキストを更新
echo "[4/4] 設定を更新中..."
# VideoWithTelop.tsxの速報テキストを更新
sed -i "s/newsFlashText: '.*'/newsFlashText: '$NEWS_TEXT'/" src/examples/VideoWithTelop.tsx
echo "✓ 設定更新完了"

echo ""
echo "============================================"
echo "✓ テロップ適用完了！"
echo "============================================"
echo ""
echo "次のステップ:"
echo "  1. npm start でプレビュー"
echo "  2. http://localhost:3000 にアクセス"
echo "  3. 'VideoWithTelop' を選択"
echo ""
echo "動画を書き出す場合:"
echo "  npx remotion render src/index.ts VideoWithTelop output.mp4"
echo ""
