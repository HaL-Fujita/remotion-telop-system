# Remotion テロップシステム スキル

## 概要
このスキルは、動画に自動的にテロップ（字幕）を追加するRemotionベースのシステムです。音声認識と音量分析を組み合わせて、適切なスタイルのテロップを生成します。

## 主な機能

### 1. 音声認識による字幕生成
- Whisper APIを使用して動画から字幕を自動生成
- SRT形式で出力

### 2. 音量分析
- ffmpegを使用して音声のRMSレベルを分析
- 音量に基づいて通常/大音量スタイルを自動判定

### 3. テロップスタイル
- **通常字幕**: 白文字、黒アウトライン、背景なし
- **大音量字幕**: ゴールド文字、黒アウトライン、背景なし
- **フォント**: 源柔ゴシック Bold
- **サイズ**: 100px
- **アウトライン**: 10px

### 4. 自動テキスト分割
- 15文字を超えるテロップは自動的に文節で分割
- 句読点や助詞を考慮した自然な分割
- 時系列で連続表示

## 使用方法

### 1. セットアップ

```bash
cd /mnt/c/Users/bestg/remotion-telop-system
npm install
```

### 2. 動画に字幕を追加

#### ステップ1: 音声分析

```bash
python3 src/scripts/analyze-audio.py /path/to/video.mp4 > audio-analysis.json
```

#### ステップ2: データをマージ

```bash
python3 merge-data.py /path/to/subtitles.srt audio-analysis.json > video-telop-data.json
```

#### ステップ3: 動画を変換（Remotion互換形式）

```bash
ffmpeg -i /path/to/video.mp4 -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k public/video.mp4 -y
```

#### ステップ4: プレビュー

```bash
npm start
```

ブラウザで http://localhost:3000 を開き、「VideoWithTelop」コンポジションを選択

## スタイル設定

### 現在の設定
- **フォント**: 源柔ゴシック Bold
- **フォントサイズ**: 100px
- **アウトライン**: 10px（黒）
- **文字数制限**: 15文字（超過時は自動分割）

### カスタマイズ方法

#### 文字数制限を変更
`merge-data.py`:
```python
text_parts = split_long_text(text, max_length=15)  # 15を変更
```

#### フォントサイズ・アウトライン変更
`src/types/youtube-style.ts`:
```typescript
normalStyle: {
  fontSize: 100,      // フォントサイズ
  outlineWidth: 10,   // アウトライン幅
}
```

## トラブルシューティング

### ホットリロードが効かない
```bash
pkill -f "npm start" && sleep 2 && npm start
```

### フォントが読み込まれない
1. `public/fonts/GenJyuuGothic-Bold.ttf` が存在することを確認
2. ブラウザでCtrl+Shift+Rでハードリフレッシュ

### 動画が再生されない
ffmpegで変換:
```bash
ffmpeg -i input.mp4 -c:v libx264 -c:a aac public/video.mp4 -y
```

## 技術スタック
- Remotion (React動画フレームワーク)
- TypeScript
- Python (音声分析)
- ffmpeg
- 源柔ゴシックフォント
