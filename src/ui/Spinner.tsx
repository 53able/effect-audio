import type React from 'react';
import { useState, useEffect } from 'react';
import { Text } from 'ink';
import type { SpinnerProps } from '../schemas.js';

const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export const Spinner: React.FC<SpinnerProps> = ({ message = '処理中...' }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % spinnerFrames.length);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <Text color="blue">
      {spinnerFrames[frame]} {message}
    </Text>
  );
};
