import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Effect } from 'effect';
import ffmpeg from 'fluent-ffmpeg';
import { type ConversionOptions, ConversionOptionsSchema } from './schemas.js';

export class ConversionError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ConversionError';
  }
}

export class FileNotFoundError extends Error {
  constructor(filePath: string) {
    super(`ファイルが見つかりません: ${filePath}`);
    this.name = 'FileNotFoundError';
  }
}

export class InvalidFileFormatError extends Error {
  constructor(filePath: string) {
    super(`無効なファイル形式です: ${filePath}`);
    this.name = 'InvalidFileFormatError';
  }
}

const validateInputFile = (
  filePath: string
): Effect.Effect<string, FileNotFoundError | InvalidFileFormatError, never> =>
  Effect.gen(function* () {
    // ファイルの存在確認
    yield* Effect.tryPromise({
      try: () => fs.access(filePath),
      catch: () => new FileNotFoundError(filePath),
    });

    // ファイル拡張子の確認
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.m4a') {
      yield* Effect.fail(new InvalidFileFormatError(filePath));
    }

    return filePath;
  });

const generateOutputPath = (inputPath: string, outputPath?: string): string => {
  if (outputPath) {
    return outputPath;
  }

  const dir = path.dirname(inputPath);
  const name = path.basename(inputPath, path.extname(inputPath));
  return path.join(dir, `${name}.mp3`);
};

const convertFile = (
  options: ConversionOptions
): Effect.Effect<void, ConversionError | FileNotFoundError | InvalidFileFormatError, never> =>
  Effect.gen(function* () {
    const inputPath = yield* validateInputFile(options.inputFile);
    const outputPath = generateOutputPath(inputPath, options.outputFile);

    yield* Effect.tryPromise({
      try: () =>
        new Promise<void>((resolve, reject) => {
          const command = ffmpeg(inputPath)
            .format('mp3')
            .audioCodec('libmp3lame')
            .audioQuality(options.quality);

          if (options.bitrate) {
            command.audioBitrate(options.bitrate);
          }

          if (options.sampleRate) {
            command.audioFrequency(options.sampleRate);
          }

          if (options.channels) {
            command.audioChannels(options.channels);
          }

          command
            .on('start', () => {
              // 開始ログは簡潔に（CLI側で表示されるため）
            })
            .on('progress', (_progress) => {
              // 進捗ログは非表示（全体進捗で管理）
            })
            .on('end', () => {
              // 完了ログは簡潔に（CLI側で表示されるため）
              resolve();
            })
            .on('error', (err) => {
              reject(new ConversionError(`変換中にエラーが発生しました: ${err.message}`, err));
            })
            .save(outputPath);
        }),
      catch: (error) => new ConversionError('ファイル変換に失敗しました', error),
    });
  });

export const convertM4aToMp3 = (
  rawOptions: unknown
): Effect.Effect<void, ConversionError | FileNotFoundError | InvalidFileFormatError, never> =>
  Effect.gen(function* () {
    const options = yield* Effect.try({
      try: () => ConversionOptionsSchema.parse(rawOptions),
      catch: (error) => new ConversionError(`設定の検証に失敗しました: ${error}`),
    });

    yield* convertFile(options);
  });
