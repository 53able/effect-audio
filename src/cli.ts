import { promises as fs } from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { Command } from 'commander';
import { Effect } from 'effect';
import { convertM4aToMp3 } from './converter.js';
import { type CliArgs, CliArgsSchema } from './schemas.js';

// 再帰的にディレクトリからm4aファイルを取得する関数
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

    // 再帰的にサブディレクトリを処理
    if (recursive && subdirs.length > 0) {
      const subdirResults = yield* Effect.all(subdirs.map((subdir) => findM4aFiles(subdir, true)));

      for (const subdirFiles of subdirResults) {
        m4aFiles.push(...subdirFiles);
      }
    }

    return m4aFiles;
  });

// 出力ディレクトリの作成と検証
const ensureOutputDir = (outputDir: string): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: () => fs.mkdir(outputDir, { recursive: true }),
      catch: () => new Error(`出力ディレクトリの作成に失敗しました: ${outputDir}`),
    });
  });

const program = new Command();

program
  .name('effect-audio')
  .description('High-performance M4A to MP3 converter built with Effect and TypeScript')
  .version('1.0.0');

program
  .argument('<input>', '変換するm4aファイルのパス')
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
      input: string,
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
      const cliArgs: CliArgs = {
        input,
        output: options.output,
        quality: options.quality,
        bitrate: options.bitrate,
        'sample-rate': options['sample-rate'],
        channels: options.channels,
        recursive: options.recursive,
        'output-dir': options['output-dir'],
        jobs: options.jobs ?? 10,
      };

      const runConversion = Effect.gen(function* () {
        // 引数の検証
        const validatedArgs = yield* Effect.try({
          try: () => CliArgsSchema.parse(cliArgs),
          catch: (error) => new Error(`引数の検証に失敗しました: ${error}`),
        });

        // ファイルまたはディレクトリの処理
        const inputPath = path.resolve(validatedArgs.input);
        const stat = yield* Effect.tryPromise({
          try: () => fs.stat(inputPath),
          catch: () => new Error(`ファイルまたはディレクトリが見つかりません: ${inputPath}`),
        });

        if (stat.isFile()) {
          // 単一ファイルの変換
          const conversionOptions = {
            inputFile: inputPath,
            outputFile: validatedArgs.output,
            quality: validatedArgs.quality,
            bitrate: validatedArgs.bitrate,
            sampleRate: validatedArgs['sample-rate'],
            channels: validatedArgs.channels,
          };

          yield* convertM4aToMp3(conversionOptions);
        } else if (stat.isDirectory()) {
          // ディレクトリの処理
          const m4aFiles = yield* findM4aFiles(inputPath, validatedArgs.recursive || false);

          if (m4aFiles.length === 0) {
            const searchType = validatedArgs.recursive ? '再帰的に' : '';
            console.log(chalk.yellow(`⚠️  ${searchType}m4aファイルが見つかりませんでした。`));
            return;
          }

          const searchType = validatedArgs.recursive ? '再帰的に' : '';
          console.log(
            chalk.green(`✅ ${searchType}${m4aFiles.length}個のm4aファイルが見つかりました。`)
          );

          // 出力ディレクトリの設定と作成
          const outputDir = validatedArgs['output-dir'] || inputPath;
          if (validatedArgs['output-dir']) {
            yield* ensureOutputDir(outputDir);
            console.log(chalk.blue(`📁 出力ディレクトリ: ${outputDir}`));
          }

          // 進捗管理用の変数
          let completedCount = 0;
          const totalFiles = m4aFiles.length;

          // 全体進捗の表示関数
          const updateProgress = () => {
            const progress = Math.round((completedCount / totalFiles) * 100);
            const progressBar =
              '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
            process.stdout.write(
              `\r${chalk.cyan(`📊 全体進捗: ${progressBar} ${progress}% (${completedCount}/${totalFiles})`)}`
            );
          };

          // 出力ディレクトリ構造の事前作成
          if (validatedArgs['output-dir']) {
            const subdirs = new Set<string>();
            for (const inputFilePath of m4aFiles) {
              const relativePath = path.relative(inputPath, inputFilePath);
              const relativeDir = path.dirname(relativePath);
              if (relativeDir !== '.') {
                subdirs.add(path.join(outputDir, relativeDir));
              }
            }

            // 必要なサブディレクトリを作成
            for (const subdir of subdirs) {
              yield* ensureOutputDir(subdir);
            }
          }

          // 並列処理用の変換タスクを作成
          const conversionTasks = m4aFiles.map((inputFilePath) => {
            // 出力ファイルパスの生成
            let outputFilePath: string;
            if (validatedArgs['output-dir']) {
              // 出力ディレクトリが指定されている場合、相対パス構造を保持
              const relativePath = path.relative(inputPath, inputFilePath);
              const relativeDir = path.dirname(relativePath);
              const fileName = `${path.basename(inputFilePath, path.extname(inputFilePath))}.mp3`;

              if (relativeDir === '.') {
                outputFilePath = path.join(outputDir, fileName);
              } else {
                const outputSubDir = path.join(outputDir, relativeDir);
                outputFilePath = path.join(outputSubDir, fileName);
              }
            } else {
              // 出力ディレクトリが指定されていない場合、元の場所に出力
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
              // 変換開始の簡潔な表示（相対パスで表示）
              const displayPath = path.relative(process.cwd(), inputFilePath);
              console.log(chalk.blue(`🔄 開始: ${chalk.bold(displayPath)}`));

              yield* convertM4aToMp3(conversionOptions);

              // 変換完了時の進捗更新
              completedCount++;
              console.log(chalk.green(`✅ 完了: ${chalk.bold(displayPath)}`));
              updateProgress();
            });
          });

          // 全ての変換を並列実行
          const concurrency = validatedArgs.jobs || 10;
          const processingMode = validatedArgs.recursive ? '再帰的' : '通常';
          console.log(
            chalk.cyan(
              `\n🚀 ${processingMode}並列変換を開始します... ${chalk.bold(`(並列数: ${concurrency})`)}`
            )
          );
          console.log(); // 空行を追加

          yield* Effect.all(conversionTasks, { concurrency });

          // 最終的な完了メッセージ
          console.log(); // 進捗バーの後に改行
          console.log(chalk.green.bold('\n🎉 全ての変換が完了しました！'));
        }
      });

      // Effectの実行
      const result = await Effect.runPromise(
        runConversion.pipe(
          Effect.catchAll((error) => {
            console.error(chalk.red.bold('❌ エラー:'), chalk.red(error.message));
            return Effect.succeed(undefined);
          })
        )
      );

      process.exit(result === undefined ? 0 : 1);
    }
  );

// 引数の解析を手動で行う
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  program.help();
} else {
  program.parse();
}
