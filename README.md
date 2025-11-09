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

## 概要

EffectAudioは、M4A形式の音声ファイルをMP3形式に変換するための高性能なCLIツールです。Effectライブラリによる関数型プログラミングのアプローチと、Zodによる型安全性を組み合わせることで、堅牢で信頼性の高い変換処理を実現しています。

### このツールが向いている人

- **初心者**: シンプルなコマンドで音声ファイルを変換したい人
- **上級者**: バッチ処理や高度な音質設定が必要な人
- **開発者**: 関数型プログラミングやEffectライブラリに興味がある人

## 主な機能

### コア機能

- **M4A→MP3変換**: 単一ファイルからディレクトリ一括変換まで対応
- **再帰的ディレクトリ処理**: サブディレクトリも含めた一括処理で、大規模な音楽ライブラリも効率的に変換
- **並列処理**: 複数ファイルの同時変換により、処理時間を大幅に短縮（デフォルト: 10並列、最大50並列）
- **柔軟な音質設定**: 音質・ビットレート・サンプルレート・チャンネル数を細かく調整可能

### ユーザー体験

- **リアルタイムUI**: Ink + Reactによる美しいCLIインターフェースで、処理状況を視覚的に確認
- **進捗表示**: ファイル状態（待機中⏳・処理中🔄・完了✅・エラー❌）を色分けして表示
- **エラーハンドリング**: 詳細なエラー情報とログ表示により、問題の特定と解決が容易

### 技術的な特徴

- **型安全性**: Zodスキーマによる完全な型安全性で、実行時エラーを事前に防止
- **関数型プログラミング**: Effectライブラリによる堅牢なエラーハンドリングと副作用管理
- **検証済みアーキテクチャ**: すべての入力値がZodスキーマで検証され、不正な値による予期しない動作を防止

## 要件

EffectAudioを使用するには、以下のソフトウェアがインストールされている必要があります：

- **Node.js**: 18.0.0以上（[公式サイト](https://nodejs.org/)からダウンロード）
- **pnpm**: 10.14.0以上（開発時のみ、[インストール方法](https://pnpm.io/installation)）
- **FFmpeg**: 音声変換に必要（[インストール方法](#ffmpegのインストール)）

### FFmpegのインストール

FFmpegは音声変換のコアエンジンです。以下のコマンドでインストールできます：

**macOS (Homebrew)**
```bash
brew install ffmpeg
```

**Ubuntu/Debian**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows (Chocolatey)**
```bash
choco install ffmpeg
```

**その他のOS**: [FFmpeg公式サイト](https://ffmpeg.org/download.html)を参照してください。

インストール後、以下のコマンドで確認できます：
```bash
ffmpeg -version
```

## インストール

### npmからインストール（推奨）

グローバルにインストールすることで、どこからでも`effect-audio`コマンドを使用できます：

```bash
# npmを使用する場合
npm install -g effect-audio

# pnpmを使用する場合（推奨）
pnpm add -g effect-audio
```

インストール後、以下のコマンドで動作確認できます：
```bash
effect-audio --version
```

### 開発用インストール

ソースコードからビルドして使用する場合：

```bash
# リポジトリをクローン
git clone https://github.com/53able/effect-audio.git
cd effect-audio

# 依存関係をインストール
pnpm install

# ビルド
pnpm run build
```

ビルド後、以下のコマンドで実行できます：
```bash
pnpm run start
# または開発モードで実行
pnpm run dev
```

## 使用方法

### クイックスタート

最もシンプルな使用方法は、M4Aファイルを指定するだけです：

```bash
effect-audio input.m4a
```

このコマンドは、`input.m4a`と同じディレクトリに`input.mp3`を生成します。

### 基本的な使用方法

#### 単一ファイルの変換

```bash
# 基本的な変換（デフォルト設定）
effect-audio input.m4a

# 出力ファイル名を指定
effect-audio input.m4a --output output.mp3
```

#### 複数ファイルの変換

```bash
# 複数のファイルを一度に変換
effect-audio file1.m4a file2.m4a file3.m4a
```

#### ディレクトリ内の全ファイルを変換

```bash
# ディレクトリ内の全m4aファイルを変換（サブディレクトリは含まない）
effect-audio /path/to/directory

# 再帰的にサブディレクトリも含めて変換
effect-audio /path/to/directory --recursive
```

#### 複数のディレクトリを同時に処理

```bash
# 複数のディレクトリを同時に処理
effect-audio /path/to/music1 /path/to/music2 --recursive
```

### コマンドラインオプション

EffectAudioは豊富なオプションを提供しています。すべてのオプションは組み合わせて使用できます。

#### 出力設定

- `-o, --output <path>`: 出力ファイルのパス（単一ファイル変換時のみ有効）
  - 例: `effect-audio input.m4a --output custom-output.mp3`

- `-d, --output-dir <path>`: 出力ディレクトリ（一括変換時）
  - 例: `effect-audio /path/to/music --output-dir /path/to/converted`
  - 指定したディレクトリが存在しない場合は自動的に作成されます

#### 音質設定

- `-q, --quality <number>`: 音質 (0-9, デフォルト: 2)
  - `0`: 最高品質（ファイルサイズ大）
  - `9`: 最低品質（ファイルサイズ小）
  - 例: `effect-audio input.m4a --quality 0`

- `-b, --bitrate <number>`: ビットレート (32-320 kbps)
  - 一般的な値: 128 (標準), 192 (高品質), 320 (最高品質)
  - 例: `effect-audio input.m4a --bitrate 320`

- `-s, --sample-rate <number>`: サンプルレート (8000-192000 Hz)
  - 一般的な値: 44100 (CD品質), 48000 (DVD品質)
  - 例: `effect-audio input.m4a --sample-rate 48000`

- `-c, --channels <number>`: チャンネル数 (1-2, デフォルト: 2)
  - `1`: モノラル
  - `2`: ステレオ
  - 例: `effect-audio input.m4a --channels 1`

#### 処理設定

- `-r, --recursive`: ディレクトリを再帰的に処理
  - サブディレクトリ内のM4Aファイルも含めて変換します
  - 例: `effect-audio /path/to/music --recursive`

- `-j, --jobs <number>`: 並列処理数 (1-50, デフォルト: 10)
  - 同時に処理するファイル数を指定します
  - より多くの並列処理により高速化できますが、システムリソースを多く消費します
  - 例: `effect-audio /path/to/music --jobs 20`

### 実践的な使用例

#### 高音質変換（最高品質）

音楽ライブラリを最高品質で変換する場合：

```bash
effect-audio input.m4a --quality 0 --bitrate 320 --sample-rate 48000
```

#### ファイルサイズ重視（低音質）

ストレージ容量を節約したい場合：

```bash
effect-audio input.m4a --quality 9 --bitrate 128
```

#### モノラル音声への変換

ポッドキャストや音声のみのコンテンツを変換する場合：

```bash
effect-audio input.m4a --channels 1
```

#### 大規模な音楽ライブラリの一括変換

再帰的に全サブディレクトリを処理し、指定ディレクトリに出力：

```bash
effect-audio /path/to/music --recursive --output-dir /path/to/converted
```

#### 高速変換（並列処理を増やす）

並列数を増やして処理を高速化（システムリソースに余裕がある場合）：

```bash
effect-audio /path/to/music --recursive --jobs 20 --output-dir /path/to/converted
```

#### 複数の設定を組み合わせた高品質変換

すべての設定を組み合わせて最適化：

```bash
effect-audio /path/to/music \
  --recursive \
  --quality 0 \
  --bitrate 320 \
  --sample-rate 48000 \
  --channels 2 \
  --jobs 15 \
  --output-dir /path/to/converted
```

## UI機能

EffectAudioは、InkとReactを使用した美しいCLIインターフェースを提供します。従来のテキストベースのCLIとは異なり、リアルタイムで更新される視覚的な進捗表示により、処理状況を一目で把握できます。

### 主なUI機能

- **📊 リアルタイム進捗表示**: 全体進捗バーと現在処理中のファイルを表示
  - 全体の進捗率（パーセンテージ）を表示
  - 現在処理中のファイル名を表示

- **📁 ファイル状態管理**: 各ファイルの状態を色分けして表示
  - ⏳ **待機中**: まだ処理が開始されていないファイル
  - 🔄 **処理中**: 現在変換中のファイル
  - ✅ **完了**: 正常に変換が完了したファイル
  - ❌ **エラー**: 変換に失敗したファイル

- **🔄 並列処理の可視化**: 複数ファイルの同時処理状況を一目で確認
  - 並列処理数に応じて、複数のファイルが同時に「処理中」状態で表示されます

- **❌ エラー詳細表示**: 変換に失敗したファイルの詳細なエラー情報を表示
  - エラーが発生したファイル名とエラーメッセージを表示
  - 問題の特定と解決が容易になります

- **🎉 完了通知**: 全ての変換完了時に成功メッセージを表示
  - 処理が完了すると、成功メッセージと共にアプリケーションが終了します

## トラブルシューティング

### よくある問題と解決方法

#### FFmpegが見つからない

**エラーメッセージ**: `FFmpeg not found` または類似のメッセージ

**解決方法**:
1. FFmpegがインストールされているか確認: `ffmpeg -version`
2. インストールされていない場合は、[要件セクション](#要件)を参照してインストール
3. インストール後もエラーが続く場合は、PATH環境変数にFFmpegが含まれているか確認

#### ファイルが見つからない

**エラーメッセージ**: `ファイルが見つかりません: <path>`

**解決方法**:
1. ファイルパスが正しいか確認（相対パスと絶対パスの違いに注意）
2. ファイルが存在するか確認: `ls <path>` または `dir <path>` (Windows)
3. ファイル名にスペースが含まれる場合は、引用符で囲む: `effect-audio "my file.m4a"`

#### 変換に失敗する

**エラーメッセージ**: `変換中にエラーが発生しました`

**解決方法**:
1. 入力ファイルが破損していないか確認
2. 入力ファイルが実際にM4A形式か確認（拡張子が`.m4a`でも、実際の形式が異なる場合があります）
3. 出力ディレクトリに書き込み権限があるか確認
4. ディスク容量が十分にあるか確認

#### 並列処理が遅い

**症状**: 処理が予想より遅い

**解決方法**:
1. `--jobs`オプションで並列数を調整（デフォルトは10）
2. システムリソース（CPU、メモリ）を確認
3. ディスクI/Oがボトルネックになっている可能性があるため、SSDの使用を検討

### サポート

問題が解決しない場合は、[GitHub Issues](https://github.com/53able/effect-audio/issues)で報告してください。問題を報告する際は、以下の情報を含めてください：

- エラーメッセージの全文
- 使用したコマンド
- オペレーティングシステムとバージョン
- Node.jsのバージョン（`node --version`）
- FFmpegのバージョン（`ffmpeg -version`）

## アーキテクチャ

EffectAudioは、関数型プログラミングの原則に基づいて設計されています。

### 技術スタック

- **コア**: Effect 3.0+, Zod 3.22+, TypeScript 5.0+
  - Effect: 副作用管理とエラーハンドリング
  - Zod: 実行時型検証と型安全性
  - TypeScript: コンパイル時型チェック

- **CLI**: Commander 12.0+, Chalk 5.6+
  - Commander: コマンドライン引数の解析
  - Chalk: ターミナルでの色付き出力

- **UI**: Ink 6.3+, React 19.2+
  - Ink: ReactベースのCLI UIライブラリ
  - React: UIコンポーネントの構築

- **音声処理**: Fluent-FFmpeg 2.1+
  - FFmpegのNode.jsラッパー

- **開発ツール**: Biome 1.4+, tsx 4.7+
  - Biome: リンターとフォーマッター
  - tsx: TypeScriptの直接実行

### 設計原則

1. **型安全性**: すべての入力値はZodスキーマで検証され、型安全性が保証されます
2. **エラーハンドリング**: Effectライブラリによる明示的なエラーハンドリングにより、予期しないエラーを防止
3. **関数型プログラミング**: 副作用をEffectで管理し、参照透過性を維持
4. **検証済みアーキテクチャ**: すべての設定値が検証され、不正な値による予期しない動作を防止

## 開発

### 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/53able/effect-audio.git
cd effect-audio

# 依存関係をインストール
pnpm install

# ビルド
pnpm run build
```

### 開発スクリプト

- `pnpm run dev`: 開発モードで実行（TypeScriptを直接実行、ホットリロードなし）
- `pnpm run build`: TypeScriptをビルド（`dist/`ディレクトリに出力）
- `pnpm run start`: ビルド済みファイルを実行
- `pnpm run lint`: リンターを実行（エラーのみ表示）
- `pnpm run format`: フォーマッターを実行（自動修正）
- `pnpm run check`: リンターとフォーマッターを実行（自動修正）
- `pnpm run publish:npm`: npmにパッケージを公開

### リリースプロセス

1. バージョンを更新:
   ```bash
   pnpm version patch  # パッチバージョン（バグ修正）
   # または
   pnpm version minor  # マイナーバージョン（新機能）
   # または
   pnpm version major  # メジャーバージョン（破壊的変更）
   ```

2. 変更をプッシュ:
   ```bash
   git push origin main --tags
   ```

タグプッシュで自動的にnpm公開とGitHub Releaseが作成されます。

### コントリビューション

コントリビューションを歓迎します！以下の手順に従ってください：

1. リポジトリをフォーク
2. 機能ブランチを作成: `git checkout -b feature/amazing-feature`
3. 変更をコミット: `git commit -m 'Add amazing feature'`
4. ブランチをプッシュ: `git push origin feature/amazing-feature`
5. プルリクエストを作成

コントリビューションの際は、以下の点にご注意ください：

- コードは既存のスタイルに従ってください（Biomeで自動フォーマットされます）
- 新しい機能には適切なテストを追加してください
- ドキュメントを更新してください
- コミットメッセージは明確で説明的にしてください

## ライセンス

MIT
