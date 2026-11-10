import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { AISettings, AIProvider } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Kbd } from '@/components/ui/kbd';
import {
  AI_PROVIDERS,
  effectiveBaseURL,
  providerInfo,
  switchProvider,
  testConnection as testAIConnection,
} from '@/lib/ai/actions';

interface Props {
  aiSettings: AISettings;
  onAISettingsChange: (settings: Partial<AISettings>) => void;
}

type TestStatus = 'idle' | 'loading' | 'ok' | 'error';

export function AISettingsSection({ aiSettings, onAISettingsChange }: Props) {
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testError, setTestError] = useState('');

  const provider = providerInfo(aiSettings.provider);

  const testConnection = async () => {
    setTestStatus('loading');
    setTestError('');
    try {
      await testAIConnection(aiSettings);
      setTestStatus('ok');
    } catch (err) {
      setTestStatus('error');
      setTestError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-4">
      {/* Description */}
      <p className="text-muted-foreground text-xs leading-5">
        AI features use your own API key. Your key is stored only on this device
        and never sent to Lumafold servers.
      </p>

      {/* Provider */}
      <div className="space-y-1.5">
        <label className="text-foreground text-xs font-medium">Provider</label>
        <Select
          value={aiSettings.provider || ''}
          onValueChange={(val) =>
            onAISettingsChange(switchProvider(val as AIProvider | ''))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a provider…" />
          </SelectTrigger>
          <SelectContent>
            {AI_PROVIDERS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* API Key */}
      <div className="space-y-1.5">
        <label className="text-foreground text-xs font-medium">API Key</label>
        <div className="relative flex items-center">
          <Input
            type={showKey ? 'text' : 'password'}
            value={aiSettings.apiKey}
            onChange={(e) => onAISettingsChange({ apiKey: e.target.value })}
            placeholder={provider?.keyPlaceholder ?? 'Your API key'}
            className="pr-9 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowKey((s) => !s)}
            className="text-muted-foreground hover:text-foreground absolute right-2.5 transition-colors"
            title={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <label className="text-foreground text-xs font-medium">Model</label>
        <Input
          type="text"
          value={aiSettings.model}
          onChange={(e) => onAISettingsChange({ model: e.target.value })}
          placeholder={
            provider
              ? provider.defaultModel || 'model name'
              : 'Select a provider first'
          }
          className="font-mono"
        />
        {provider?.defaultModel && (
          <p className="text-muted-foreground text-[10px]">
            Default: {provider.defaultModel}
          </p>
        )}
      </div>

      {/* Base URL — always shown, read-only for known providers */}
      <div className="space-y-1.5">
        <label className="text-foreground text-xs font-medium">Base URL</label>
        {aiSettings.provider === 'custom' ? (
          <Input
            type="text"
            value={aiSettings.customBaseURL}
            onChange={(e) =>
              onAISettingsChange({ customBaseURL: e.target.value })
            }
            placeholder="https://your-api.example.com/v1"
            className="font-mono"
          />
        ) : (
          <div className="border-input bg-muted/40 text-muted-foreground w-full truncate rounded-md border px-2.5 py-1.5 font-mono text-xs">
            {effectiveBaseURL(aiSettings) || '—'}
          </div>
        )}
      </div>

      {/* Test Connection */}
      <div className="flex items-center gap-3 pt-1">
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
              className="size-3.5 animate-spin"
            />
          ) : null}
          Test connection
        </Button>

        {testStatus === 'ok' && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
            <CheckCircle2 size={13} /> Connected
          </span>
        )}
        {testStatus === 'error' && (
          <span className="text-destructive flex items-center gap-1.5 text-xs font-medium">
            <XCircle size={13} /> Failed
          </span>
        )}
      </div>

      {testStatus === 'error' && testError && (
        <p className="border-destructive/20 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-xs leading-5">
          {testError}
        </p>
      )}

      {/* Keyboard shortcut hint */}
      <div className="border-border bg-muted/40 text-muted-foreground rounded-md border px-3 py-2 text-[11px] leading-5">
        <strong className="text-foreground font-medium">How to use:</strong>{' '}
        Right-click any panel to open the AI menu, or press{' '}
        <Kbd>Ctrl+Shift+A</Kbd> while a panel is focused.
      </div>
    </div>
  );
}
