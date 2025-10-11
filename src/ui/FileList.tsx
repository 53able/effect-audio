import { Box, Text } from 'ink';
import type React from 'react';
import type { FileItem, FileListProps } from '../schemas.js';

export const FileList: React.FC<FileListProps> = ({ files }) => {
  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: FileItem['status']) => {
    switch (status) {
      case 'pending':
        return 'gray';
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="cyan">
        📁 ファイル一覧:
      </Text>
      {files.map((file) => (
        <Box key={file.path} marginLeft={2}>
          <Text color={getStatusColor(file.status)}>
            {getStatusIcon(file.status)} {file.path}
          </Text>
          {file.error && (
            <Box marginLeft={2}>
              <Text color="red">({file.error})</Text>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};
