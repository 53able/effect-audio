import { promises as fs } from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { Command } from 'commander';
import { Effect } from 'effect';
import { convertM4aToMp3 } from './converter.js';
import { type CliArgs, CliArgsSchema } from './schemas.js';

/**
 * 指定されたディレクトリからm4aファイルを再帰的に検索する
 * @param dirPath - 検索対象のディレクトリパス
 * @param recursive - 再帰的にサブディレクトリを検索するかどうか
 * @returns 見つかったm4aファイルのパス配列を含むEffect
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

    // 再帰的にサブディレクトリを処理
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
 * @param outputDir - 作成するディレクトリのパス
 * @returns ディレクトリ作成処理を含むEffect
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
 * @param inputs - 入力ファイルまたはディレクトリのパス配列
 * @param options - CLIオプション
 * @returns 検証済みのCLI引数を含むEffect
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
 * 進捗表示を管理するオブジェクトを作成する
 * @param totalFiles - 処理対象の総ファイル数
 * @returns 進捗更新メソッドを含むオブジェクト
 */
const createProgressManager = (totalFiles: number) => {
  let completedCount = 0;

  const updateProgress = () => {
    const progress = Math.round((completedCount / totalFiles) * 100);
    const progressBar =
      '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
    process.stdout.write(
      `\r${chalk.cyan(`📊 全体進捗: ${progressBar} ${progress}% (${completedCount}/${totalFiles})`)}`
    );
  };

  const incrementProgress = () => {
    completedCount++;
    updateProgress();
  };

  return { updateProgress, incrementProgress };
};

/**
 * 複数のファイルパスを処理する
 * @param inputPaths - 入力ファイルまたはディレクトリのパス配列
 * @param validatedArgs - 検証済みのCLI引数
 * @returns 複数ファイル処理を含むEffect
 */
const processMultipleInputs = (
  inputPaths: string[],
  validatedArgs: CliArgs
): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
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
        // 単一ファイルの場合
        if (path.extname(resolvedPath).toLowerCase() === '.m4a') {
          allM4aFiles.push(resolvedPath);
        } else {
          console.log(chalk.yellow(`⚠️  m4aファイルではありません: ${resolvedPath}`));
        }
      } else if (stat.isDirectory()) {
        // ディレクトリの場合
        const m4aFiles = yield* findM4aFiles(resolvedPath, validatedArgs.recursive || false);
        allM4aFiles.push(...m4aFiles);
      }
    }

    if (allM4aFiles.length === 0) {
      console.log(chalk.yellow('⚠️  m4aファイルが見つかりませんでした。'));
      return;
    }

    console.log(chalk.green(`✅ ${allM4aFiles.length}個のm4aファイルが見つかりました。`));

    // 出力ディレクトリの設定と作成
    if (outputDir) {
      yield* ensureOutputDir(outputDir);
      console.log(chalk.blue(`📁 出力ディレクトリ: ${outputDir}`));
    }

    // 進捗管理の初期化
    const progressManager = createProgressManager(allM4aFiles.length);

    // 並列処理用の変換タスクを作成
    const conversionTasks = allM4aFiles.map((inputFilePath) => {
      // 出力ファイルパスの生成
      let outputFilePath: string;
      if (outputDir) {
        // 出力ディレクトリが指定されている場合、ファイル名のみを使用
        const fileName = `${path.basename(inputFilePath, path.extname(inputFilePath))}.mp3`;
        outputFilePath = path.join(outputDir, fileName);
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
        console.log(chalk.green(`✅ 完了: ${chalk.bold(displayPath)}`));
        progressManager.incrementProgress();
      });
    });

    // 全ての変換を並列実行
    const concurrency = validatedArgs.jobs || 10;
    console.log(
      chalk.cyan(`\n🚀 並列変換を開始します... ${chalk.bold(`(並列数: ${concurrency})`)}`)
    );
    console.log(); // 空行を追加

    yield* Effect.all(conversionTasks, { concurrency });

    // 最終的な完了メッセージ
    console.log(); // 進捗バーの後に改行
    console.log(chalk.green.bold('\n🎉 全ての変換が完了しました！'));
  });

/**
 * Commander.jsを使用したCLIプログラムの設定
 */
const program = new Command();

program
  .name('effect-audio')
  .description('High-performance M4A to MP3 converter built with Effect and TypeScript')
  .version('1.0.8');

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
        // 引数の検証
        const validatedArgs = yield* validateAndParseArgs(inputs, options);

        // 複数ファイルの処理
        yield* processMultipleInputs(validatedArgs.inputs, validatedArgs);
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

/**
 * コマンドライン引数の解析とヘルプ表示の処理
 */
program.parse();
