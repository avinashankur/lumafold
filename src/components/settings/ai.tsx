import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { AISettings, AIProvider } from '../../types';
import { Button } from '../ui/button';
import { getDefaultBaseURL, getDefaultModel } from '@/lib/ai/client';
import { callAI } from '@/lib/ai/client';

interface Props {
  aiSettings: AISettings;
  onAISettingsChange: (settings: Partial<AISettings>) => void;
}

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'gemini', label: 'Gemini (Google)' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'custom', label: 'Custom (OpenAI-compatible)' },
];

type TestStatus = 'idle' | 'loading' | 'ok' | 'error';

export function AISettingsSection({ aiSettings, onAISettingsChange }: Props) {
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testError, setTestError] = useState('');

  const handleProviderChange = (provider: AIProvider | '') => {
    onAISettingsChange({
      provider,
      model:
        provider && provider !== 'custom'
          ? getDefaultModel(provider)
          : aiSettings.model,
      customBaseURL:
        provider && provider !== 'custom'
          ? getDefaultBaseURL(provider)
          : aiSettings.customBaseURL,
    });
  };

  const testConnection = async () => {
    setTestStatus('loading');
    setTestError('');
    try {
      await callAI(aiSettings, [
        { role: 'user', content: 'Reply with exactly the word: ok' },
      ]);
      setTestStatus('ok');
    } catch (err) {
      setTestStatus('error');
      setTestError(err instanceof Error ? err.message : String(err));
    }
  };

  const baseURL =
    aiSettings.provider === 'custom'
      ? aiSettings.customBaseURL
      : aiSettings.provider
        ? getDefaultBaseURL(aiSettings.provider)
        : '';

  return (
    <div className="space-y-5">
      {/* Description */}
      <p className="text-xs leading-5 text-[var(--text-muted)]">
        AI features use your own API key. Your key is stored only on this device
        and never sent to Lumafold servers.
      </p>

      {/* Provider */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text)]">
          Provider
        </label>
        <select
          value={aiSettings.provider}
          onChange={(e) =>
            handleProviderChange(e.target.value as AIProvider | '')
          }
          className="w-full rounded-md border bg-[var(--panel-bg)] px-2.5 py-1.5 text-xs text-[var(--text)] transition-shadow outline-none focus:ring-1 focus:ring-[var(--primary)]"
          style={{ borderColor: 'var(--border)' }}
        >
          <option value="">Select a provider…</option>
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text)]">
          API Key
        </label>
        <div className="flex items-center gap-1">
          <div
            className="flex flex-1 items-center overflow-hidden rounded-md border"
            style={{ borderColor: 'var(--border)' }}
          >
            <input
              type={showKey ? 'text' : 'password'}
              value={aiSettings.apiKey}
              onChange={(e) => onAISettingsChange({ apiKey: e.target.value })}
              placeholder={
                aiSettings.provider === 'gemini'
                  ? 'AIza…'
                  : aiSettings.provider === 'openai'
                    ? 'sk-…'
                    : 'Your API key'
              }
              className="flex-1 bg-[var(--panel-bg)] px-2.5 py-1.5 font-mono text-xs text-[var(--text)] outline-none"
            />
            <button
              onClick={() => setShowKey((s) => !s)}
              className="px-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text)]">Model</label>
        <input
          type="text"
          value={aiSettings.model}
          onChange={(e) => onAISettingsChange({ model: e.target.value })}
          placeholder={
            aiSettings.provider
              ? getDefaultModel(aiSettings.provider) || 'model name'
              : 'Select a provider first'
          }
          className="w-full rounded-md border bg-[var(--panel-bg)] px-2.5 py-1.5 font-mono text-xs text-[var(--text)] transition-shadow outline-none focus:ring-1 focus:ring-[var(--primary)]"
          style={{ borderColor: 'var(--border)' }}
        />
        {aiSettings.provider && aiSettings.provider !== 'custom' && (
          <p className="text-[10px] text-[var(--text-muted)]">
            Default: {getDefaultModel(aiSettings.provider)}
          </p>
        )}
      </div>

      {/* Base URL — always shown, read-only for known providers */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text)]">
          Base URL
        </label>
        {aiSettings.provider === 'custom' ? (
          <input
            type="text"
            value={aiSettings.customBaseURL}
            onChange={(e) =>
              onAISettingsChange({ customBaseURL: e.target.value })
            }
            placeholder="https://your-api.example.com/v1"
            className="w-full rounded-md border bg-[var(--panel-bg)] px-2.5 py-1.5 font-mono text-xs text-[var(--text)] transition-shadow outline-none focus:ring-1 focus:ring-[var(--primary)]"
            style={{ borderColor: 'var(--border)' }}
          />
        ) : (
          <div
            className="w-full truncate rounded-md border px-2.5 py-1.5 font-mono text-xs text-[var(--text-muted)]"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--hover)',
            }}
          >
            {baseURL || '—'}
          </div>
        )}
      </div>

      {/* Test Connection */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={testConnection}
          disabled={
            !aiSettings.apiKey ||
            !aiSettings.provider ||
            testStatus === 'loading'
          }
          className="text-xs"
        >
          {testStatus === 'loading' ? (
            <Loader2
              data-icon="inline-start"
              size={12}
              className="animate-spin"
            />
          ) : null}
          Test Connection
        </Button>

        {testStatus === 'ok' && (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <CheckCircle2 size={12} /> Connected
          </span>
        )}
        {testStatus === 'error' && (
          <span className="flex items-center gap-1 text-xs text-red-400">
            <XCircle size={12} /> Failed
          </span>
        )}
      </div>

      {testStatus === 'error' && testError && (
        <p
          className="rounded-md px-3 py-2 text-xs leading-5"
          style={{
            background: 'color-mix(in srgb, #ef4444 10%, transparent)',
            color: '#ef4444',
          }}
        >
          {testError}
        </p>
      )}

      {/* Keyboard shortcut hint */}
      <div
        className="rounded-md px-3 py-2 text-[10px] leading-5 text-[var(--text-muted)]"
        style={{ background: 'var(--hover)' }}
      >
        <strong className="text-[var(--text)]">How to use:</strong> Right-click
        any panel to open the AI menu, or press{' '}
        <kbd
          className="rounded border px-1 py-0.5 font-mono text-[10px]"
          style={{ borderColor: 'var(--border)' }}
        >
          Ctrl+Shift+A
        </kbd>{' '}
        while a panel is focused.
      </div>
    </div>
  );
}
