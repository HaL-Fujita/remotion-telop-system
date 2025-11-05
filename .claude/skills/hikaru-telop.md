# Hikaru風テロップスキル

hikaru.mp4スタイルのテロップを動画に適用するスキル

## 概要

このスキルを使用すると、YouTube配信者「ヒカル」風のテロップ（字幕）を動画に自動適用できます。

## 特徴

- **3つの字幕スタイル**
  - Normal（通常）: 黒文字、黄色背景、画面下部中央
  - Loud（大音量）: 赤文字、黄色背景、より大きいフォント
  - NewsFlash（速報バナー）: 白文字、赤背景、画面左上、アニメーション付き

- **音量連動機能**: 音声のRMSレベルを自動分析し、音量に応じてスタイルを切り替え
- **字幕自動生成**: Whisper APIで音声から字幕を自動生成
- **アニメーション**: スライドイン、背景色パルス効果

## 使い方

### 1. 動画に既存の字幕ファイル（SRT）がある場合

```bash
# 音声解析のみ実行
python3 src/scripts/analyze-audio.py <動画パス> 75 2>/dev/null > audio-analysis.json

# 字幕と音声データをマージ
python3 merge-data.py <字幕SRTパス> audio-analysis.json > video-telop-data.json

# 動画をpublicフォルダにコピー
cp <動画パス> public/video.mp4

# Remotionプレビュー起動
npm start
```

### 2. 字幕を自動生成する場合

```bash
# OpenAI APIキーを設定
export OPENAI_API_KEY="your-api-key"

# 字幕生成 + 音声解析（統合）
python3 src/scripts/process-video.py <動画パス> --output video-telop-data.json

# 動画をpublicフォルダにコピー
cp <動画パス> public/video.mp4

# Remotionプレビュー起動
npm start
```

### 3. Remotionで確認

ブラウザで http://localhost:3000 にアクセスし、"VideoWithTelop" コンポジションを選択

### 4. 動画を書き出し

```bash
npx remotion render src/index.ts VideoWithTelop output.mp4
```

## ファイル構成

```
remotion-telop-system/
├── src/
│   ├── components/          # テロップコンポーネント
│   │   ├── NormalSubtitle.tsx
│   │   ├── LoudSubtitle.tsx
│   │   ├── NewsFlashBanner.tsx
│   │   └── TelopSystem.tsx
│   ├── scripts/             # 処理スクリプト
│   │   ├── analyze-audio.py        # 音声解析
│   │   ├── generate-subtitles.py   # 字幕自動生成
│   │   └── process-video.py        # 統合処理
│   └── examples/
│       └── VideoWithTelop.tsx      # 動画+テロップ
├── public/
│   └── video.mp4            # 処理対象の動画
├── merge-data.py            # SRT+音声解析マージ
├── video-telop-data.json    # 生成されたテロップデータ
└── audio-analysis.json      # 音声解析結果
```

## カスタマイズ

### 速報バナーのテキストを変更

`src/examples/VideoWithTelop.tsx` を編集:

```typescript
const config = {
  ...defaultTelopConfig,
  newsFlashText: '速報：あなたのメッセージ',
};
```

### スタイルを変更

`src/types/telop.ts` の `defaultTelopConfig` を編集:

```typescript
normalStyle: {
  fontSize: 128,      // フォントサイズ
  textColor: '#000000',  // テキスト色
  backgroundColor: '#FFFF00',  // 背景色
  // ...
}
```

### 音量閾値を調整

```bash
# 80パーセンタイルを閾値にする場合
python3 src/scripts/analyze-audio.py <動画パス> 80 2>/dev/null > audio-analysis.json
```

## トラブルシューティング

### 動画が再生されない

- 動画が `public/video.mp4` に配置されているか確認
- Remotionサーバーを再起動: `npm start`

### 字幕が表示されない

- `video-telop-data.json` が生成されているか確認
- JSONファイルの内容を確認: `cat video-telop-data.json | head -50`

### 音声解析でエラー

- ffmpegがインストールされているか確認: `ffmpeg -version`
- 動画に音声トラックがあるか確認: `ffprobe <動画パス>`

## 必要な環境

- Node.js 18以上
- Python 3.8以上
- ffmpeg/ffprobe
- OpenAI API キー（字幕自動生成時のみ）

## 参考

このスキルは hikaru.mp4 の分析に基づいています：
- 字幕フォーマット: ASS (Advanced SubStation Alpha)
- フォント: MS Gothic (通常/大音量), Noto Sans JP (速報)
- 解像度: 1920x1080, 30fps
