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
  inputs: z
    .array(z.string().min(1, '入力ファイルは必須です'))
    .min(1, '少なくとも1つの入力ファイルが必要です'),
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
 * ファイルアイテムのZodスキーマ
 * UIで使用するファイル状態を定義
 */
export const FileItemSchema = z.object({
  path: z.string().min(1, 'ファイルパスは必須です'),
  status: z.enum(['pending', 'processing', 'completed', 'error']),
  error: z.string().optional(),
});

/**
 * プログレスバーのZodスキーマ
 */
export const ProgressBarPropsSchema = z.object({
  progress: z.number().min(0).max(100),
  total: z.number().min(0),
  completed: z.number().min(0),
  currentFile: z.string().optional(),
});

/**
 * スピナーのZodスキーマ
 */
export const SpinnerPropsSchema = z.object({
  message: z.string().optional(),
});

/**
 * ファイルリストのZodスキーマ
 */
export const FileListPropsSchema = z.object({
  files: z.array(FileItemSchema),
});

/**
 * 変換アプリのZodスキーマ
 */
export const ConversionAppPropsSchema = z.object({
  totalFiles: z.number().min(0),
  files: z.array(FileItemSchema),
  onComplete: z.function().returns(z.void()),
  onFileUpdate: z.function().optional(),
  onProgressUpdate: z.function().optional(),
});

/**
 * グローバル更新関数のZodスキーマ
 */
export const GlobalUpdateFileStatusSchema = z.function()
  .args(
    z.string(),
    z.enum(['pending', 'processing', 'completed', 'error']),
    z.string().optional()
  )
  .returns(z.void());

/**
 * グローバルオブジェクトの拡張型定義
 */
declare global {
  var updateFileStatus: GlobalUpdateFileStatus | undefined;
}

/**
 * 型定義（Zodスキーマから推論）
 */
export type ConversionOptions = z.infer<typeof ConversionOptionsSchema>;
export type CliArgs = z.infer<typeof CliArgsSchema>;
export type FileItem = z.infer<typeof FileItemSchema>;
export type ProgressBarProps = z.infer<typeof ProgressBarPropsSchema>;
export type SpinnerProps = z.infer<typeof SpinnerPropsSchema>;
export type FileListProps = z.infer<typeof FileListPropsSchema>;
export type ConversionAppProps = z.infer<typeof ConversionAppPropsSchema>;
export type GlobalUpdateFileStatus = z.infer<typeof GlobalUpdateFileStatusSchema>;
