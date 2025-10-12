# EffectAudio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/effect-audio.svg)](https://www.npmjs.com/package/effect-audio)
[![npm downloads](https://img.shields.io/npm/dm/effect-audio.svg)](https://www.npmjs.com/package/effect-audio)
[![Node.js](https://img.shields.io/badge/Node.js-18.0.0+-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.14.0+-blue.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Effect](https://img.shields.io/badge/Effect-3.0+-purple.svg)](https://effect.website/)
[![React](https://img.shields.io/badge/React-19.2.0+-blue.svg)](https://react.dev/)
[![Ink](https://img.shields.io/badge/Ink-6.3.1+-green.svg)](https://github.com/vadimdemedes/ink)

High-performance M4A to MP3 converter built with Effect, TypeScript, and Ink CLI UI.

## 機能

- **M4A→MP3変換**: 単一ファイル・ディレクトリ一括変換
- **再帰的ディレクトリ処理**: サブディレクトリも含めた一括処理
- **並列処理**: 複数ファイルの同時変換による高速処理
- **音質設定**: 音質・ビットレート・サンプルレート・チャンネル数の細かい調整
- **リアルタイムUI**: Ink + Reactによる美しいCLIインターフェース
- **進捗表示**: ファイル状態（待機中・処理中・完了・エラー）の可視化
- **エラーハンドリング**: 詳細なエラー情報とログ表示
- **型安全性**: Zodスキーマによる完全な型安全性
- **関数型プログラミング**: Effectライブラリによる堅牢なエラーハンドリング

## インストール

### npmからインストール（推奨）

```bash
# グローバルインストール
npm install -g effect-audio

# または
pnpm add -g effect-audio
```

### 開発用インストール

```bash
# リポジトリをクローン
git clone https://github.com/53able/effect-audio.git
cd effect-audio

# 依存関係をインストール
pnpm install
```

## ビルド

```bash
pnpm run build
```

## 使用方法

### 基本

```bash
# 単一ファイルの変換
effect-audio input.m4a

# 複数ファイルの変換
effect-audio file1.m4a file2.m4a file3.m4a

# ディレクトリ内の全m4aファイルを変換
effect-audio /path/to/directory

# 再帰的にサブディレクトリも含めて変換
effect-audio /path/to/directory --recursive

# 複数のディレクトリを同時に処理
effect-audio /path/to/music1 /path/to/music2 --recursive
```

### オプション

- `-o, --output <path>`: 出力ファイルのパス（単一ファイル変換時）
- `-q, --quality <number>`: 音質 (0-9, デフォルト: 2)
- `-b, --bitrate <number>`: ビットレート (32-320 kbps)
- `-s, --sample-rate <number>`: サンプルレート (8000-192000 Hz)
- `-c, --channels <number>`: チャンネル数 (1-2, デフォルト: 2)
- `-r, --recursive`: ディレクトリを再帰的に処理
- `-d, --output-dir <path>`: 出力ディレクトリ（一括変換時）
- `-j, --jobs <number>`: 並列処理数 (1-50, デフォルト: 10)

### 高度な使用例

```bash
# 高音質で変換（最高品質）
effect-audio input.m4a --quality 0 --bitrate 320

# 低音質で変換（ファイルサイズ重視）
effect-audio input.m4a --quality 9 --bitrate 128

# モノラル音声に変換
effect-audio input.m4a --channels 1

# 特定のサンプルレートで変換
effect-audio input.m4a --sample-rate 44100

# 再帰的に全サブディレクトリを処理し、指定ディレクトリに出力
effect-audio /path/to/music --recursive --output-dir /path/to/converted

# 並列数を増やして高速変換
effect-audio /path/to/music --recursive --jobs 20 --output-dir /path/to/converted

# 複数の設定を組み合わせた高品質変換
effect-audio /path/to/music --recursive --quality 0 --bitrate 320 --sample-rate 48000 --channels 2 --jobs 15
```

## 開発

### スクリプト

- `pnpm run dev`: 開発モードで実行
- `pnpm run build`: TypeScriptをビルド
- `pnpm run start`: ビルド済みファイルを実行
- `pnpm run lint`: リンターを実行
- `pnpm run format`: フォーマッターを実行（自動修正）
- `pnpm run check`: リンターとフォーマッターを実行（自動修正）
- `pnpm run publish:npm`: npmにパッケージを公開

### リリース

```bash
pnpm version patch  # または minor, major
git push origin main --tags
```

タグプッシュで自動的にnpm公開とGitHub Releaseが作成されます。

### 技術スタック

- **コア**: Effect 3.0+, Zod 3.22+, TypeScript 5.0+
- **CLI**: Commander 12.0+, Chalk 5.6+
- **UI**: Ink 6.3+, React 19.2+
- **音声処理**: Fluent-FFmpeg 2.1+
- **開発ツール**: Biome 1.4+, tsx 4.7+

## 要件

- Node.js 18.0.0以上
- pnpm 10.14.0以上
- FFmpeg（音声変換に必要）

## UI機能

EffectAudioは、InkとReactを使用した美しいCLI UIを提供します：

- **📊 リアルタイム進捗表示**: 全体進捗バーと現在処理中のファイルを表示
- **📁 ファイル状態管理**: 待機中⏳、処理中🔄、完了✅、エラー❌の状態を色分け表示
- **🔄 並列処理の可視化**: 複数ファイルの同時処理状況を一目で確認
- **❌ エラー詳細表示**: 変換に失敗したファイルの詳細なエラー情報を表示
- **🎉 完了通知**: 全ての変換完了時に成功メッセージを表示

## ライセンス

MIT
