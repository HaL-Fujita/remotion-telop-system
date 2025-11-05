# Remotion Telop System

hikaru.mp4スタイルのテロップ（字幕・速報バナー）を再現するRemotion用コンポーネントシステム

## 特徴

- **3つの字幕スタイル**
  - Normal（通常）: 黒文字、黄色背景、画面下部中央
  - Loud（大音量）: 赤文字、黄色背景、画面下部中央（通常より大きい）
  - NewsFlash（速報バナー）: 白文字、赤背景、画面左上、アニメーション付き

- **音量連動機能**
  - 動画音声のRMSレベルを自動分析
  - 音量に応じてNormal/Loudスタイルを自動切替

- **アニメーション**
  - NewsFlashバナー: スライドイン + 背景色パルス効果
  - カスタマイズ可能なタイミング設定

- **字幕自動生成**
  - OpenAI Whisper API連携
  - 日本語の自然な改行処理
  - SRT/JSON出力対応

## インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd remotion-telop-system

# 依存関係をインストール
npm install

# Python依存関係（字幕生成・音声解析用）
pip3 install openai janome numpy
```

## 使い方

### 1. デモを実行

```bash
npm start
```

ブラウザで `http://localhost:3000` にアクセスすると、テロップシステムのデモが表示されます。

### 2. 基本的な使用方法

```typescript
import { TelopSystem } from './components/TelopSystem';
import { defaultTelopConfig } from './types/telop';
import type { SubtitleEntry } from './types/telop';

const MyVideo: React.FC = () => {
  const subtitles: SubtitleEntry[] = [
    {
      id: 1,
      startTime: 0,
      endTime: 2,
      text: 'こんにちは',
      style: 'normal',
      volumeLevel: 0.5,
    },
    // ... more subtitles
  ];

  return (
    <AbsoluteFill>
      {/* 背景動画など */}

      {/* テロップシステム */}
      <TelopSystem
        subtitles={subtitles}
        config={defaultTelopConfig}
      />
    </AbsoluteFill>
  );
};
```

### 3. 動画から字幕を自動生成

```bash
# OpenAI API キーを設定
export OPENAI_API_KEY="your-api-key"

# 字幕生成 + 音声解析（統合スクリプト）
python3 src/scripts/process-video.py path/to/video.mp4 --output telop-data.json

# 生成されたデータをRemotion で使用
```

生成された `telop-data.json`:

```json
{
  "videoPath": "video.mp4",
  "subtitles": [
    {
      "id": 1,
      "startTime": 0.0,
      "endTime": 2.5,
      "text": "こんにちは",
      "volumeLevel": 0.45,
      "style": "normal"
    },
    ...
  ],
  "audioAnalysis": {
    "threshold": 0.753,
    "percentile": 75
  }
}
```

### 4. カスタマイズ

#### スタイルをカスタマイズ

```typescript
import { defaultTelopConfig } from './types/telop';
import type { TelopConfig } from './types/telop';

const customConfig: TelopConfig = {
  ...defaultTelopConfig,
  normalStyle: {
    ...defaultTelopConfig.normalStyle,
    fontSize: 150,  // フォントサイズを変更
    textColor: '#FFFFFF',  // 白文字に変更
  },
  newsFlashText: '速報：カスタムメッセージ',
};
```

#### 速報バナーを非表示

```typescript
const config: TelopConfig = {
  ...defaultTelopConfig,
  showNewsFlash: false,
};
```

#### アニメーションをカスタマイズ

```typescript
const config: TelopConfig = {
  ...defaultTelopConfig,
  newsFlashStyle: {
    ...defaultTelopConfig.newsFlashStyle,
    animation: {
      enableSlideIn: true,
      slideInFromX: -800,  // スライド開始位置
      slideInToX: 20,
      slideInStartFrame: 0,
      slideInEndFrame: 30,  // 30フレーム = 1秒（30fps時）
      enableColorPulse: true,
      pulseColors: ['#FF0000', '#FF6600', '#FFFF00'],  // 赤→橙→黄
      pulseFramesPerColor: 20,
      fadeInDuration: 500,
    },
  },
};
```

## スクリプト

### 字幕生成

```bash
# Whisper API使用（推奨）
python3 src/scripts/generate-subtitles.py video.mp4 --api-key YOUR_KEY --output subtitles.json

# ローカルWhisper使用（whisperコマンドが必要）
python3 src/scripts/generate-subtitles.py video.mp4 --local --output subtitles.json
```

### 音声解析

```bash
# RMSレベルを分析（デフォルト：75パーセンタイル）
python3 src/scripts/analyze-audio.py video.mp4 > audio-analysis.json

# パーセンタイルを指定
python3 src/scripts/analyze-audio.py video.mp4 80 > audio-analysis.json
```

### 統合処理

```bash
# 字幕生成 + 音声解析を一度に実行
python3 src/scripts/process-video.py video.mp4 \
  --api-key YOUR_KEY \
  --percentile 75 \
  --output telop-data.json
```

## プロジェクト構造

```
remotion-telop-system/
├── src/
│   ├── components/          # Remotionコンポーネント
│   │   ├── NormalSubtitle.tsx      # 通常字幕
│   │   ├── LoudSubtitle.tsx        # 大音量字幕
│   │   ├── NewsFlashBanner.tsx     # 速報バナー
│   │   ├── TelopSystem.tsx         # メインシステム
│   │   └── index.ts
│   ├── types/               # TypeScript型定義
│   │   ├── telop.ts                # テロップ型定義
│   │   └── index.ts
│   ├── utils/               # ユーティリティ
│   │   ├── loadSubtitles.ts        # 字幕ローダー
│   │   └── index.ts
│   ├── scripts/             # Python スクリプト
│   │   ├── generate-subtitles.py   # 字幕自動生成
│   │   ├── analyze-audio.py        # 音声解析
│   │   └── process-video.py        # 統合処理
│   ├── examples/            # サンプル
│   │   └── TelopDemo.tsx           # デモコンポーネント
│   ├── Root.tsx             # Remotion ルート
│   └── index.ts             # エントリポイント
├── example-data.json        # サンプルデータ
├── tsconfig.json
├── package.json
└── README.md
```

## API リファレンス

### コンポーネント

#### `<TelopSystem>`

テロップシステムのメインコンポーネント

**Props:**
- `subtitles: SubtitleEntry[]` - 字幕データ配列
- `config: TelopConfig` - テロップ設定

#### `<NormalSubtitle>`

通常字幕コンポーネント

**Props:**
- `entry: SubtitleEntry` - 字幕エントリ
- `style: NormalSubtitleStyle` - スタイル設定
- `videoWidth: number` - 動画幅
- `videoHeight: number` - 動画高さ

#### `<LoudSubtitle>`

大音量字幕コンポーネント（NormalSubtitleと同じProps）

#### `<NewsFlashBanner>`

速報バナーコンポーネント

**Props:**
- `text: string` - 表示テキスト
- `style: NewsFlashStyle` - スタイル設定
- `videoWidth: number` - 動画幅
- `videoHeight: number` - 動画高さ

### 型定義

#### `SubtitleEntry`

```typescript
interface SubtitleEntry {
  id: number;
  startTime: number;      // 秒
  endTime: number;        // 秒
  text: string;
  style?: 'normal' | 'loud' | 'newsflash';
  volumeLevel?: number;   // 0-1
}
```

#### `TelopConfig`

```typescript
interface TelopConfig {
  videoWidth: number;
  videoHeight: number;
  fps: number;
  normalStyle: NormalSubtitleStyle;
  loudStyle: LoudSubtitleStyle;
  newsFlashStyle: NewsFlashStyle;
  newsFlashText: string;
  showNewsFlash: boolean;
  loudVolumePercentile: number;
}
```

詳細は `src/types/telop.ts` を参照してください。

## 必要な環境

- Node.js 18以上
- Python 3.8以上
- ffmpeg（音声処理用）
- ffprobe（音声解析用）

### Python パッケージ

```bash
pip3 install openai janome numpy
```

### システムツール

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# https://ffmpeg.org/download.html からダウンロード
```

## トラブルシューティング

### Remotionが起動しない

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### Python スクリプトエラー

```bash
# 必要なパッケージを再インストール
pip3 install --upgrade openai janome numpy
```

### ffmpegが見つからない

```bash
# インストールを確認
ffmpeg -version
ffprobe -version

# パスを確認
which ffmpeg
which ffprobe
```

### Whisper API エラー

```bash
# APIキーを確認
echo $OPENAI_API_KEY

# 環境変数を設定
export OPENAI_API_KEY="your-api-key-here"
```

## ライセンス

ISC

## 参考

このプロジェクトは hikaru.mp4 の分析に基づいています：

- **字幕フォーマット**: ASS (Advanced SubStation Alpha)
- **フォント**: MS Gothic (通常/大音量), Noto Sans JP (速報)
- **解像度**: 1920x1080
- **FPS**: 30

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 作者

Created with Claude Code
