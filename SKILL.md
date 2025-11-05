# 🎬 Hikaru風テロップスキル

YouTube配信者「ヒカル」風のテロップを動画に自動適用するスキル

## ⚡ クイックスタート

### 最も簡単な方法

```bash
# 1. 字幕ファイルがある場合
./apply-telop.sh 動画.mp4 字幕.srt

# 2. 字幕を自動生成する場合（OpenAI APIキーが必要）
export OPENAI_API_KEY="your-key"
./apply-telop.sh 動画.mp4

# 3. 速報バナーのテキストをカスタマイズ
./apply-telop.sh 動画.mp4 字幕.srt "速報：重大発表"

# 4. プレビュー
npm start
# → http://localhost:3000 で "VideoWithTelop" を選択

# 5. 動画を書き出し
npx remotion render src/index.ts VideoWithTelop output.mp4
```

## 🎨 テロップスタイル

### 1. Normal（通常字幕）
- **表示位置**: 画面下部中央
- **デザイン**: 黒文字、黄色背景（半透明）
- **フォント**: MS Gothic 128px
- **用途**: 通常の会話

### 2. Loud（大音量字幕）
- **表示位置**: 画面下部中央
- **デザイン**: 赤文字、黄色背景（半透明）
- **フォント**: MS Gothic 160px（通常より25%大きい）
- **用途**: 強調したい発言、大声の部分
- **自動判定**: 音量が75パーセンタイル以上で自動切替

### 3. NewsFlash（速報バナー）
- **表示位置**: 画面左上
- **デザイン**: 白文字、赤背景（半透明）
- **フォント**: Noto Sans JP 84px
- **アニメーション**:
  - スライドイン（左から登場）
  - 背景色パルス（赤→橙→黄のサイクル）
- **表示**: 動画全体を通して常に表示

## 📖 詳細な使い方

### 方法1: ワンコマンドスクリプト

```bash
# 基本
./apply-telop.sh <動画ファイル> [字幕SRTファイル] [速報バナーテキスト]

# 例
./apply-telop.sh /mnt/c/Users/bestg/Videos/video.mp4
./apply-telop.sh video.mp4 subtitles.srt
./apply-telop.sh video.mp4 subtitles.srt "速報：新商品発表"
```

### 方法2: 手動ステップ

```bash
# ステップ1: 音声解析
python3 src/scripts/analyze-audio.py 動画.mp4 75 2>/dev/null > audio-analysis.json

# ステップ2: 字幕生成（または既存SRTを使用）
# 2a. 自動生成
export OPENAI_API_KEY="your-key"
python3 src/scripts/process-video.py 動画.mp4 --output video-telop-data.json

# 2b. 既存SRT使用
python3 merge-data.py 字幕.srt audio-analysis.json > video-telop-data.json

# ステップ3: 動画配置
cp 動画.mp4 public/video.mp4

# ステップ4: プレビュー
npm start
```

## 🎛️ カスタマイズ

### 速報バナーのテキストを変更

```typescript
// src/examples/VideoWithTelop.tsx
const config = {
  ...defaultTelopConfig,
  newsFlashText: 'あなたのメッセージ',
};
```

### 色やフォントサイズを変更

```typescript
// src/types/telop.ts
export const defaultTelopConfig: TelopConfig = {
  normalStyle: {
    fontSize: 128,              // フォントサイズ
    textColor: '#000000',       // テキスト色（黒）
    backgroundColor: '#FFFF00', // 背景色（黄色）
    backgroundOpacity: 0.5,     // 透明度
    // ...
  },
  // ...
};
```

### 音量閾値を調整

```bash
# 例: 80パーセンタイルを閾値に
python3 src/scripts/analyze-audio.py 動画.mp4 80 2>/dev/null > audio-analysis.json
```

### 速報バナーを非表示

```typescript
const config = {
  ...defaultTelopConfig,
  showNewsFlash: false,
};
```

## 📂 生成されるファイル

| ファイル | 説明 |
|---------|------|
| `audio-analysis.json` | 音声解析結果（RMSレベル、大音量区間） |
| `video-telop-data.json` | 字幕+音声データ（Remotionで使用） |
| `subtitles.srt` | 生成された字幕（SRT形式） |
| `public/video.mp4` | Remotionで使用する動画 |

## 🔧 トラブルシューティング

### 動画が再生されない

**原因**: 動画ファイルの配置ミス

**解決**:
```bash
# public/video.mp4 に動画が配置されているか確認
ls -la public/video.mp4

# 配置されていなければコピー
cp 動画.mp4 public/video.mp4

# Remotion再起動
npm start
```

### 字幕が表示されない

**原因**: video-telop-data.json が正しく生成されていない

**解決**:
```bash
# JSONファイルを確認
cat video-telop-data.json | head -50

# 再生成
python3 merge-data.py 字幕.srt audio-analysis.json > video-telop-data.json
```

### 音声解析でエラー

**原因**: ffmpegがインストールされていない

**解決**:
```bash
# ffmpeg確認
ffmpeg -version
ffprobe -version

# Ubuntu/Debianの場合
sudo apt install ffmpeg

# macOSの場合
brew install ffmpeg
```

### Whisper API エラー

**原因**: OpenAI APIキーが設定されていない

**解決**:
```bash
# APIキーを設定
export OPENAI_API_KEY="sk-..."

# 確認
echo $OPENAI_API_KEY
```

## 📊 実例

### 現在適用されている動画

- **動画**: `784013162.166093_cut.mp4` (80.72秒)
- **字幕**: 34個の字幕
- **音声解析**: 3474サンプル、閾値 0.6139
- **スタイル**: 全てNormal（音量が閾値未満）
- **速報バナー**: "速報：AIが動画編集してる"

### プレビュー

http://localhost:3000 → "VideoWithTelop" を選択

## 🎯 必要な環境

- **Node.js**: 18以上
- **Python**: 3.8以上
- **ffmpeg/ffprobe**: 音声処理用
- **OpenAI API キー**: 字幕自動生成時のみ

### Pythonパッケージ

```bash
pip3 install openai janome numpy
```

## 📚 参考情報

このスキルは hikaru.mp4 の詳細分析に基づいています：

- **元動画**: test_with_subtitles.mp4（保安検査官の動画）
- **字幕形式**: ASS (Advanced SubStation Alpha)
- **フォント**: MS Gothic（字幕）、Noto Sans JP（速報）
- **解像度**: 1920x1080
- **FPS**: 30

### 分析データ

- `/mnt/c/Users/bestg/Videos/telop_analysis/` にサンプルフレーム
- `/mnt/c/Users/bestg/Videos/test_subtitles.ass` に元のASS字幕
- 完全な分析レポートは README.md 参照

## 📝 ライセンス

ISC

---

**Created with Claude Code** 🤖
