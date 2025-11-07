# 動画編集システム仕様書

## プロジェクト概要
Remotionを使用した動画テロップ自動生成システム

## 使用技術スタック

### コア技術
- **Remotion**: v4.0.372 - React ベースの動画生成フレームワーク
- **React**: v18.3.1
- **TypeScript**: v5.9.3
- **Node.js**: 実行環境

### 動画処理ツール
- **FFmpeg**: 動画メタデータ解析、エンコード
- **FFprobe**: 動画情報取得

### AI/音声処理
- **OpenAI Whisper API**: 音声文字起こし（クラウド）
- **Whisper Local**: ローカル環境での音声文字起こし
- **Python 3**: 音声解析スクリプト実行
- **Janome**: 日本語形態素解析（自然な字幕分割）
- **NumPy**: 音声データ数値計算

---

## 音声文字起こし (Whisper) 仕様

**推奨**: Whisper Local（ローカル環境）を基本とする

### 対応モード

#### 1. Whisper Local (ローカル) ⭐ 推奨
**使用条件**:
- whisperコマンドがインストール済み
- ローカルマシンで処理
- 無料

**利点**:
- ✅ オフライン動作可能
- ✅ API費用不要（完全無料）
- ✅ データがローカルに留まる（プライバシー保護）
- ✅ 使用制限なし
- ✅ APIキー不要

**使用方法（基本）**:
```bash
# デフォルト（baseモデル使用）
python3 src/scripts/generate-subtitles.py video.mp4 --local

# より高精度が必要な場合（smallモデル）
python3 src/scripts/generate-subtitles.py video.mp4 --local --model small
```

#### 2. Whisper API (クラウド) - 代替手段
**使用条件**:
- OpenAI APIキーが必要
- インターネット接続が必要
- 従量課金（有料）

**利点**:
- セットアップ不要
- 高速処理
- 最新モデル

**使用ケース**:
- Whisper Localのセットアップができない環境
- 一時的な使用

**使用方法**:
```bash
export OPENAI_API_KEY='your-api-key'
python3 src/scripts/generate-subtitles.py video.mp4
```

---

## Whisper Local セットアップ（必須）

### 初回セットアップ手順

#### 1. FFmpegのインストール
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows (WSL2使用時)
sudo apt install ffmpeg
```

#### 2. Whisperのインストール
```bash
# 推奨: pipでインストール
pip install openai-whisper

# または最新版（開発版）
pip install git+https://github.com/openai/whisper.git

# インストール確認
whisper --help
```

#### 3. Python依存パッケージ
```bash
# プロジェクトディレクトリで実行
cd /path/to/remotion-telop-system
pip install -r requirements.txt
```

#### 4. 動作確認
```bash
# テスト実行
whisper --help

# モデルダウンロード（初回のみ自動実行）
# baseモデルが自動ダウンロードされます
```

### モデル一覧
| モデル | パラメータ数 | 必要VRAM | 速度 | 精度 | 推奨用途 |
|--------|-------------|---------|------|------|----------|
| tiny | 39M | ~1GB | 最速 | 低 | テスト用 |
| base ⭐ | 74M | ~1GB | 速い | 中 | **通常使用（推奨）** |
| small | 244M | ~2GB | 普通 | 良 | 高精度が必要な場合 |
| medium | 769M | ~5GB | 遅い | 高 | プロフェッショナル用 |
| large | 1550M | ~10GB | 最遅 | 最高 | 最高品質が必要な場合 |

**推奨モデル**: `base` - 速度と精度のバランスが最適

### モデル使用例
```bash
# 基本使用（baseモデル）- 推奨
python3 src/scripts/generate-subtitles.py video.mp4 --local

# より高精度が必要な場合（smallモデル）
python3 src/scripts/generate-subtitles.py video.mp4 --local --model small

# 最高品質（処理時間長い）
python3 src/scripts/generate-subtitles.py video.mp4 --local --model medium

# 直接whisperコマンドで実行
whisper video.mp4 --model base --language Japanese
```

### モデル選択ガイド
- **通常の動画**: `base` （速度・精度バランス）
- **音声が不明瞭**: `small` または `medium`
- **テスト・確認**: `tiny`
- **本番・納品用**: `small` 以上

---

## 音声抽出設定

### FFmpeg パラメータ
```bash
ffmpeg -i input.mp4 \
  -vn \                    # 映像なし
  -acodec pcm_s16le \     # PCM 16-bit リニア
  -ar 16000 \             # サンプリングレート 16kHz (Whisper推奨)
  -ac 1 \                 # モノラル
  -y \                    # 上書き
  output.wav
```

### 仕様詳細
| パラメータ | 値 | 理由 |
|-----------|-----|------|
| コーデック | PCM 16-bit | 非圧縮、高品質 |
| サンプリングレート | 16kHz | Whisper最適化 |
| チャンネル | 1 (モノラル) | 処理速度向上 |
| フォーマット | WAV | 互換性最高 |

---

## 字幕生成フロー

### 処理ステップ
1. **音声抽出**: 動画から音声トラックを抽出（WAV形式）
2. **文字起こし**: Whisper（API/Local）で音声をテキスト化
3. **セグメント化**: タイムスタンプ付きセグメントに分割
4. **日本語処理**: 形態素解析で自然な区切りに調整
5. **字幕生成**: JSON・SRT形式で出力

### 出力形式

#### JSON形式
```json
{
  "video_path": "video.mp4",
  "subtitles": [
    {
      "id": 1,
      "startTime": 0.0,
      "endTime": 2.5,
      "text": "朝ごはんでーす。"
    }
  ]
}
```

#### SRT形式
```srt
1
00:00:00,000 --> 00:00:02,500
朝ごはんでーす。

2
00:00:03,000 --> 00:00:05,000
このね、鮭が
```

---

## 字幕テキスト分割

### 日本語形態素解析 (Janome)
```python
from janome.tokenizer import Tokenizer

# 自然な単位で分割
text = "このね、鮭がうまい。"
# → ["このね、", "鮭が", "うまい。"]
```

### 設定
| パラメータ | 値 | 説明 |
|-----------|-----|------|
| max_chars_per_line | 20 | 1行あたりの最大文字数 |
| 分割方法 | 形態素解析 | 自然な単語境界で分割 |
| フォールバック | 文字数制限 | Janome未インストール時 |

---

## Whisper パラメータ詳細

### Whisper API
```python
client.audio.transcriptions.create(
    model="whisper-1",           # APIモデル（固定）
    file=audio_file,             # 音声ファイル
    language="ja",               # 日本語指定
    response_format="verbose_json"  # 詳細JSONレスポンス
)
```

### Whisper Local
```bash
whisper audio.wav \
  --model base \              # モデル選択
  --language Japanese \       # 言語指定
  --output_format json \      # 出力形式
  --output_dir /tmp           # 出力ディレクトリ
```

### レスポンス構造
```json
{
  "text": "全体のテキスト",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 2.5,
      "text": "セグメントテキスト"
    }
  ],
  "language": "ja"
}
```

---

## トラブルシューティング (Whisper)

### Whisper Localが動作しない
```bash
# インストール確認
whisper --help

# パスを確認
which whisper

# 再インストール
pip uninstall openai-whisper
pip install openai-whisper
```

### 音声抽出エラー
```bash
# FFmpegインストール確認
ffmpeg -version

# 手動で音声抽出テスト
ffmpeg -i video.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 test.wav
```

### メモリ不足エラー
- より小さいモデルを使用: `--model tiny` または `--model base`
- GPU使用を無効化: CPU処理に切り替え

### 文字起こし精度が低い
1. より大きいモデルを使用: `--model medium` または `--model large`
2. 音声品質を確認: ノイズ除去が必要な場合あり
3. 言語を明示的に指定: `--language Japanese`

---

## 動画設定仕様

### フレームレート設定
**重要**: 元動画のフレームレートに完全一致させる必要があります

| 項目 | 設定値 | 理由 |
|------|--------|------|
| fps | 29.97 (30000/1001) | 日本の標準動画フレームレート |
| 整数fps使用 | ❌ 禁止 | フレーム補間によるブレが発生 |

**ブレの原因**:
- 29.97fps → 30fps 変換時にフレームタイミングのずれが累積
- フレーム補間/ドロップが発生し、カクつきとして視認される

### 解像度設定
**原則**: 元動画の解像度と一致させる

| 元動画 | Remotion設定 |
|--------|--------------|
| 1280x720 | width: 1280, height: 720 |
| 1920x1080 | width: 1920, height: 1080 |

**アップスケール禁止**: 画質劣化とブレの原因になる

### durationInFrames 計算
```python
duration_in_frames = int(動画の秒数 * fps)

# 例: 68.015秒、29.97fps の場合
# 68.015 * 29.97 = 2038 フレーム
```

---

## レンダリング設定

### コマンド
```bash
npx remotion render src/index.ts VideoWithTelop output.mp4 \
  --codec h264 \
  --crf 18 \
  --pixel-format yuv420p
```

### パラメータ詳細
| パラメータ | 値 | 説明 |
|-----------|-----|------|
| codec | h264 | H.264コーデック使用 |
| crf | 18 | 品質設定（0-51, 低いほど高品質） |
| pixel-format | yuv420p | 標準ピクセルフォーマット |
| concurrency | 8x | デフォルト並列レンダリング数 |

---

## テロップ・字幕仕様

### フォント設定
| 項目 | 設定値 |
|------|--------|
| フォントファミリー | Noto Sans JP |
| フォントウェイト | 900 (Black - 最大の太さ) |
| フォントサイズ | 87px (全文字統一) |
| 行の高さ | 1.3 |

### 色設定
| 要素 | カラーコード | 説明 |
|------|-------------|------|
| 通常文字 | #FFFFFF | 白 |
| キーワード（強調） | #FF0000 | 赤 |
| 食べ物カテゴリ | #FFFF00 | 黄色 |
| アウトライン | #000000 | 黒 |

### アウトライン（縁取り）
- **幅**: 4.2px
- **実装方法**: text-shadow を使用した多重シャドウ
- **範囲**: -4.2px から +4.2px の全方向

### アニメーション
**現在の仕様**: 無効化

過去に実装していたアニメーション:
- ~~バウンスアニメーション~~ (削除済み)
- ~~スケール変換~~ (削除済み)
- ~~キーワード強調時の拡大~~ (削除済み)

**理由**: シンプルで読みやすい字幕を優先

### 配置
- **位置**: 画面下部中央
- **bottomMargin**: 56px
- **最大幅**: 画面幅の90%
- **自動改行**: 15文字で改行

---

## キーワード検出システム

### 実装ファイル
- `src/data/highlight-keywords.json`

### カテゴリ定義
```json
{
  "感情表現": ["うまい", "やばい", "すごい"],
  "食べ物": ["鮭", "ラーメン", "マフィン"]
}
```

### 処理フロー
1. テキストをキーワードで分割
2. カテゴリに応じて色を適用
3. 全て同じフォントサイズで表示（サイズ変更なし）

---

## 見出しコンポーネント (LeftSideCaption)

### 配置・サイズ
| 項目 | 値 |
|------|-----|
| 位置 | 左上 (top: 40px, left: 40px) |
| スケール | 1.05 (元の1.5から70%に縮小) |
| ベース幅 | 280px |
| ベース高さ | 150px |

### スタイル
- **背景色**: オレンジ (#FF8C00)
- **テキスト色**: 白 (#FFFFFF)
- **アニメーション**: 左からスライドイン
- **影付き**: 二重背景（白+オレンジ）

---

## プロジェクト構造

```
remotion-telop-system/
├── src/
│   ├── index.ts                    # エントリーポイント
│   ├── Root.tsx                    # Composition定義
│   ├── components/
│   │   ├── KeywordHighlightSubtitle.tsx  # メイン字幕コンポーネント
│   │   ├── SpecialAnimationSubtitle.tsx  # 特殊アニメーション字幕
│   │   └── LeftSideCaption.tsx           # 見出しコンポーネント
│   ├── examples/
│   │   └── VideoWithTelop.tsx      # 実装例
│   ├── data/
│   │   └── highlight-keywords.json # キーワード定義
│   └── scripts/
│       ├── analyze-audio.py        # 音声解析
│       └── generate-subtitles.py   # 字幕生成
├── public/
│   └── video.mp4                   # 入力動画
├── out/                            # 出力ディレクトリ
├── apply-telop.sh                  # 自動処理スクリプト
└── remotion.config.ts              # Remotion設定
```

---

## ワークフロー

### 1. 動画準備
```bash
# 動画をpublicディレクトリにコピー
cp "元動画.mp4" public/video.mp4

# メタデータ確認
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate \
  -show_entries format=duration \
  -of json public/video.mp4
```

### 2. Root.tsx設定
```typescript
<Composition
  id="VideoWithTelop"
  component={VideoWithTelop}
  durationInFrames={2260}  // 計算値
  fps={29.97}              // 元動画に一致
  width={1280}             // 元動画に一致
  height={720}             // 元動画に一致
  defaultProps={{}}
/>
```

### 3. レンダリング
```bash
npx remotion render src/index.ts VideoWithTelop out/output.mp4 \
  --codec h264 \
  --crf 18 \
  --pixel-format yuv420p
```

---

## トラブルシューティング

### ブレが発生する場合
1. ✅ フレームレートが元動画と一致しているか確認
2. ✅ 解像度が元動画と一致しているか確認
3. ✅ durationInFramesが正確に計算されているか確認

### 字幕が表示されない場合
1. ✅ `public/video.mp4` が存在するか確認
2. ✅ `video-telop-data.json` が生成されているか確認
3. ✅ フォントが読み込まれているか確認

---

## 最適化のポイント

### パフォーマンス
- **並列レンダリング**: デフォルト8並列
- **CRF値**: 18で高品質と速度のバランス
- **キャッシュ**: Bundling結果をキャッシュ

### 品質
- **元動画設定の完全一致**: ブレを防止
- **高CRF値回避**: 18以下推奨
- **yuv420p使用**: 互換性最大化

---

## 更新履歴

### 最新の変更 (2025年)
- フォントサイズを87pxに統一
- フォントウェイトを900に変更
- アニメーションを全て無効化
- アウトライン幅を4.2pxに増加
- 見出しスケールを1.05に調整（70%縮小）
- highlightSizeMultiplierを1.0に設定（サイズ統一）

### 主要な修正
- フレームレート不一致によるブレ問題を解決
- 解像度アップスケールによる画質劣化を解消
- テロップスタイルをシンプル化
