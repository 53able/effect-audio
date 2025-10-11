import { promises as fs } from 'node:fs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { Effect } from 'effect';
import { render } from 'ink';
import React from 'react';
import { convertM4aToMp3 } from './converter.js';
import { type CliArgs, CliArgsSchema } from './schemas.js';
import { ConversionApp } from './ui/ConversionApp.js';

/**
 * 指定されたディレクトリからm4aファイルを再帰的に検索する
 */
const findM4aFiles = (dirPath: string, recursive = false): Effect.Effect<string[], Error, never> =>
  Effect.gen(function* () {
    const files = yield* Effect.tryPromise({
      try: () => fs.readdir(dirPath, { withFileTypes: true }),
      catch: () => new Error(`ディレクトリの読み取りに失敗しました: ${dirPath}`),
    });

    const m4aFiles: string[] = [];
    const subdirs: string[] = [];

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);

      if (file.isFile() && path.extname(file.name).toLowerCase() === '.m4a') {
        m4aFiles.push(fullPath);
      } else if (file.isDirectory() && recursive) {
        subdirs.push(fullPath);
      }
    }

    if (recursive && subdirs.length > 0) {
      const subdirResults = yield* Effect.all(subdirs.map((subdir) => findM4aFiles(subdir, true)));

      for (const subdirFiles of subdirResults) {
        m4aFiles.push(...subdirFiles);
      }
    }

    return m4aFiles;
  });

/**
 * 出力ディレクトリが存在しない場合は作成する
 */
const ensureOutputDir = (outputDir: string): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: () => fs.mkdir(outputDir, { recursive: true }),
      catch: () => new Error(`出力ディレクトリの作成に失敗しました: ${outputDir}`),
    });
  });

/**
 * CLI引数を検証し、パースする
 */
const validateAndParseArgs = (
  inputs: string[],
  options: {
    output?: string;
    quality?: number;
    bitrate?: number;
    'sample-rate'?: number;
    channels?: number;
    recursive?: boolean;
    'output-dir'?: string;
    jobs?: number;
  }
): Effect.Effect<CliArgs, Error, never> =>
  Effect.gen(function* () {
    const cliArgs: CliArgs = {
      inputs,
      output: options.output,
      quality: options.quality,
      bitrate: options.bitrate,
      'sample-rate': options['sample-rate'],
      channels: options.channels,
      recursive: options.recursive,
      'output-dir': options['output-dir'],
      jobs: options.jobs ?? 10,
    };

    return yield* Effect.try({
      try: () => CliArgsSchema.parse(cliArgs),
      catch: (error) => new Error(`引数の検証に失敗しました: ${error}`),
    });
  });

/**
 * Inkを使ったリッチなUIで複数のファイルパスを処理する
 */
const processMultipleInputsWithInk = (
  inputPaths: string[],
  validatedArgs: CliArgs
): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    // 入力パスが空の場合は何もしない
    if (!inputPaths || inputPaths.length === 0) {
      return;
    }

    // ヘルプオプションが含まれている場合は何もしない
    if (inputPaths.some((path) => path.startsWith('--'))) {
      return;
    }

    const allM4aFiles: string[] = [];
    const outputDir = validatedArgs['output-dir'];

    // 各入力パスを処理
    for (const inputPath of inputPaths) {
      const resolvedPath = path.resolve(inputPath);
      const stat = yield* Effect.tryPromise({
        try: () => fs.stat(resolvedPath),
        catch: () => new Error(`ファイルまたはディレクトリが見つかりません: ${resolvedPath}`),
      });

      if (stat.isFile()) {
        if (path.extname(resolvedPath).toLowerCase() === '.m4a') {
          allM4aFiles.push(resolvedPath);
        }
      } else if (stat.isDirectory()) {
        const m4aFiles = yield* findM4aFiles(resolvedPath, validatedArgs.recursive || false);
        allM4aFiles.push(...m4aFiles);
      }
    }

    if (allM4aFiles.length === 0) {
      throw new Error('m4aファイルが見つかりませんでした。');
    }

    // 出力ディレクトリの設定と作成
    if (outputDir) {
      yield* ensureOutputDir(outputDir);
    }

    // ファイルリストを初期化
    const initialFiles = allM4aFiles.map((filePath) => ({
      path: path.relative(process.cwd(), filePath),
      status: 'pending' as const,
    }));

    // Inkアプリのレンダリング
    const { waitUntilExit } = render(
      React.createElement(ConversionApp, {
        totalFiles: allM4aFiles.length,
        files: initialFiles,
        onComplete: () => {
          // アプリ終了処理
        },
      })
    );

    // 並列処理用の変換タスクを作成
    const conversionTasks = allM4aFiles.map((inputFilePath) => {
      let outputFilePath: string;
      if (outputDir) {
        const fileName = `${path.basename(inputFilePath, path.extname(inputFilePath))}.mp3`;
        outputFilePath = path.join(outputDir, fileName);
      } else {
        const outputFileName = `${path.basename(inputFilePath, path.extname(inputFilePath))}.mp3`;
        outputFilePath = path.join(path.dirname(inputFilePath), outputFileName);
      }

      const conversionOptions = {
        inputFile: inputFilePath,
        outputFile: outputFilePath,
        quality: validatedArgs.quality,
        bitrate: validatedArgs.bitrate,
        sampleRate: validatedArgs['sample-rate'],
        channels: validatedArgs.channels,
      };

      return Effect.gen(function* () {
        const displayPath = path.relative(process.cwd(), inputFilePath);

        // ファイル処理開始を通知
        if (global.updateFileStatus) {
          global.updateFileStatus(displayPath, 'processing', undefined);
        }

        try {
          yield* convertM4aToMp3(conversionOptions);

          // ファイル処理完了を通知
          if (global.updateFileStatus) {
            global.updateFileStatus(displayPath, 'completed', undefined);
          }
        } catch (error) {
          // ファイル処理エラーを通知
          if (global.updateFileStatus) {
            global.updateFileStatus(
              displayPath,
              'error',
              error instanceof Error ? error.message : 'Unknown error'
            );
          }
          throw error;
        }
      });
    });

    // 全ての変換を並列実行
    const concurrency = validatedArgs.jobs || 10;

    try {
      yield* Effect.all(conversionTasks, { concurrency });

      // 全ての変換が完了したら少し待ってから終了
      yield* Effect.sleep('2 seconds');
    } catch (error) {
      // エラーが発生してもUIは継続表示
      console.error('変換中にエラーが発生しました:', error);
    }

    // Inkアプリの終了を待つ
    yield* Effect.promise(() => waitUntilExit());
  });

/**
 * Commander.jsを使用したCLIプログラムの設定
 */
const program = new Command();

// package.jsonからバージョンを読み込み
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

program
  .name('effect-audio')
  .description('High-performance M4A to MP3 converter built with Effect and TypeScript')
  .version(packageJson.version);

program
  .argument('<inputs...>', '変換するm4aファイルまたはディレクトリのパス（複数指定可能）')
  .option('-o, --output <path>', '出力ファイルのパス')
  .option('-q, --quality <number>', '音質 (0-9, デフォルト: 2)', '2')
  .option('-b, --bitrate <number>', 'ビットレート (32-320 kbps)')
  .option('-s, --sample-rate <number>', 'サンプルレート (8000-192000 Hz)')
  .option('-c, --channels <number>', 'チャンネル数 (1-2, デフォルト: 2)', '2')
  .option('-r, --recursive', 'ディレクトリを再帰的に処理')
  .option('-d, --output-dir <path>', '出力ディレクトリ')
  .option('-j, --jobs <number>', '並列処理数 (デフォルト: 10)', '10')
  .action(
    async (
      inputs: string[],
      options: {
        output?: string;
        quality?: number;
        bitrate?: number;
        'sample-rate'?: number;
        channels?: number;
        recursive?: boolean;
        'output-dir'?: string;
        jobs?: number;
      }
    ) => {
      const runConversion = Effect.gen(function* () {
        const validatedArgs = yield* validateAndParseArgs(inputs, options);

        // InkベースのリッチUIで処理
        yield* processMultipleInputsWithInk(validatedArgs.inputs, validatedArgs);
      });

      const result = await Effect.runPromise(
        runConversion.pipe(
          Effect.catchAll((error) => {
            console.error('❌ エラー:', error.message);
            return Effect.succeed(undefined);
          })
        )
      );

      process.exit(result === undefined ? 0 : 1);
    }
  );

program.parse();
