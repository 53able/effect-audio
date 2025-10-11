import { z } from 'zod';

/**
 * ファイル変換オプションのZodスキーマ
 * M4AからMP3への変換に必要な設定項目を定義
 */
export const ConversionOptionsSchema = z.object({
  inputFile: z.string().min(1, '入力ファイルパスは必須です'),
  outputFile: z.string().optional(),
  quality: z.number().min(0).max(9).default(2),
  bitrate: z.number().min(32).max(320).optional(),
  sampleRate: z.number().min(8000).max(192000).optional(),
  channels: z.number().min(1).max(2).default(2),
});

/**
 * CLI引数のZodスキーマ
 * コマンドライン引数の検証と型安全性を提供
 */
export const CliArgsSchema = z.object({
  input: z.string().min(1, '入力ファイルは必須です'),
  output: z.string().optional(),
  quality: z.coerce.number().min(0).max(9).optional(),
  bitrate: z.coerce.number().min(32).max(320).optional(),
  'sample-rate': z.coerce.number().min(8000).max(192000).optional(),
  channels: z.coerce.number().min(1).max(2).optional(),
  recursive: z.boolean().optional(),
  'output-dir': z.string().optional(),
  jobs: z.coerce.number().min(1).max(50).default(10),
});

/**
 * ファイル変換オプションの型定義
 * ConversionOptionsSchemaから推論される型
 */
export type ConversionOptions = z.infer<typeof ConversionOptionsSchema>;

/**
 * CLI引数の型定義
 * CliArgsSchemaから推論される型
 */
export type CliArgs = z.infer<typeof CliArgsSchema>;
