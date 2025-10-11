import { Box, Text } from 'ink';
import type React from 'react';
import type { ProgressBarProps } from '../schemas.js';

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  completed,
  currentFile,
}) => {
  const barWidth = 30;
  const filledWidth = Math.floor((progress / 100) * barWidth);
  const bar = '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color="cyan">
          📊 全体進捗: <Text bold>{bar}</Text> {progress}% ({completed}/{total})
        </Text>
      </Box>
      {currentFile && (
        <Box marginTop={1}>
          <Text color="blue">
            🔄 処理中: <Text bold>{currentFile}</Text>
          </Text>
        </Box>
      )}
    </Box>
  );
};
