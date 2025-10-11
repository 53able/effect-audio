# EffectAudio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/effect-audio.svg)](https://www.npmjs.com/package/effect-audio)
[![npm downloads](https://img.shields.io/npm/dm/effect-audio.svg)](https://www.npmjs.com/package/effect-audio)
[![Node.js](https://img.shields.io/badge/Node.js-18.0.0+-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.14.0+-blue.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Effect](https://img.shields.io/badge/Effect-3.0+-purple.svg)](https://effect.website/)
[![React](https://img.shields.io/badge/React-19.2.0+-blue.svg)](https://react.dev/)

High-performance M4A to MP3 converter built with Effect, TypeScript, and React UI.

## 機能

- M4A→MP3変換（単一ファイル・ディレクトリ一括）
- 再帰的なディレクトリ処理
- 並列処理による高速変換
- 音質・ビットレート・サンプルレートの設定
- リアルタイム進捗表示とファイル状態の可視化
- リッチなCLI UI（Ink + React）
- 複数ファイルの同時処理
- エラーハンドリングと詳細なログ表示

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

# ディレクトリ内の全m4aファイルを変換
effect-audio /path/to/directory

# 再帰的にサブディレクトリも含めて変換
effect-audio /path/to/directory --recursive
```

### オプション

- `-o, --output <path>`: 出力ファイルのパス
- `-q, --quality <number>`: 音質 (0-9, デフォルト: 2)
- `-b, --bitrate <number>`: ビットレート (32-320 kbps)
- `-s, --sample-rate <number>`: サンプルレート (8000-192000 Hz)
- `-c, --channels <number>`: チャンネル数 (1-2, デフォルト: 2)
- `-r, --recursive`: ディレクトリを再帰的に処理
- `-d, --output-dir <path>`: 出力ディレクトリ
- `-j, --jobs <number>`: 並列処理数 (1-50, デフォルト: 10)

### 高度な使用例

```bash
# 高音質で変換
effect-audio input.m4a --quality 0 --bitrate 320

# 再帰的に全サブディレクトリを処理
effect-audio /path/to/music --recursive --output-dir /path/to/converted

# 並列数を増やして高速変換
effect-audio /path/to/music --recursive --jobs 20 --output-dir /path/to/converted
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

- **コア**: Effect, Zod, TypeScript
- **CLI**: Commander, Chalk
- **UI**: Ink, React 19.2.0
- **音声処理**: Fluent-FFmpeg
- **開発ツール**: Biome, tsx

## 要件

- Node.js 18.0.0以上
- pnpm 10.14.0以上
- FFmpeg（音声変換に必要）

## UI機能

EffectAudioは、InkとReactを使用したリッチなCLI UIを提供します：

- **リアルタイム進捗表示**: 変換中のファイルの進捗を視覚的に表示
- **ファイル状態管理**: 待機中、処理中、完了、エラーの状態を色分けして表示
- **並列処理の可視化**: 複数ファイルの同時処理状況を一目で確認
- **エラー詳細表示**: 変換に失敗したファイルの詳細なエラー情報を表示

## ライセンス

MIT
