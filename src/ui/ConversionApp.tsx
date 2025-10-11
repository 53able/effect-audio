import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Box, Text } from 'ink';
import { ProgressBar } from './ProgressBar.js';
import { FileList } from './FileList.js';
import { Spinner } from './Spinner.js';
import type { ConversionAppProps, FileItem } from '../schemas.js';

export const ConversionApp: React.FC<ConversionAppProps> = ({
  totalFiles,
  files: initialFiles,
  onComplete,
}) => {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [completedCount, setCompletedCount] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  const progress = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;

  // ファイルリストの初期化
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  // ファイル更新のハンドラー
  const updateFileStatus = useCallback((filePath: string, status: FileItem['status'], error?: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.path === filePath 
          ? { ...file, status, error }
          : file
      )
    );
    
    if (status === 'processing') {
      setCurrentFile(filePath);
    } else if (status === 'completed' || status === 'error') {
      setCurrentFile('');
      setCompletedCount(prev => prev + 1);
    }
  }, []);

  // グローバルな更新関数を設定（Node.js環境用）
  useEffect(() => {
    global.updateFileStatus = updateFileStatus;
  }, [updateFileStatus]);

  // 完了チェック
  useEffect(() => {
    if (completedCount === totalFiles && totalFiles > 0) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [completedCount, totalFiles, onComplete]);

  if (isComplete) {
    return (
      <Box flexDirection="column" alignItems="center" marginY={2}>
        <Text color="green" bold>
          🎉 全ての変換が完了しました！
        </Text>
        <Text color="cyan">
          処理したファイル数: {totalFiles}
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="green" bold>
          ✅ {totalFiles}個のm4aファイルが見つかりました
        </Text>
      </Box>
      
      <ProgressBar
        progress={progress}
        total={totalFiles}
        completed={completedCount}
        currentFile={currentFile}
      />
      
      <FileList files={files} />
      
      {totalFiles === 0 && (
        <Box marginY={2}>
          <Spinner message="ファイルを検索中..." />
        </Box>
      )}
    </Box>
  );
};
