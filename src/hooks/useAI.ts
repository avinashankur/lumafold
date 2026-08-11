import { useState, useCallback } from 'react';
import { AISettings } from '@/types';
import { AICommand, runAICommand } from '@/lib/ai/commands';

interface UseAIResult {
  loading: boolean;
  error: string | null;
  run: (
    command: AICommand,
    html: string,
    settings: AISettings,
  ) => Promise<string | null>;
}

export function useAI(): UseAIResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (
      command: AICommand,
      html: string,
      settings: AISettings,
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await runAICommand(command, html, settings);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, error, run };
}
