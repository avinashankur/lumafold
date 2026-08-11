import { useEffect, useRef } from 'react';
import { Check, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  loading: boolean;
  error: string | null;
  result: string | null;
  commandLabel: string;
  onAccept: () => void;
  onDiscard: () => void;
  onRetry: () => void;
}

export function AIResultPanel({
  loading,
  error,
  result,
  commandLabel,
  onAccept,
  onDiscard,
  onRetry,
}: Props) {
  const previewRef = useRef<HTMLDivElement>(null);

  // Inject result HTML into preview div safely
  useEffect(() => {
    if (previewRef.current && result) {
      previewRef.current.innerHTML = result;
    }
  }, [result]);

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-lg"
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-2 border-b px-3 py-2"
        style={{
          background: 'var(--panel-header-bg)',
          borderColor: 'var(--border)',
        }}
      >
        <span className="flex-1 text-xs font-medium text-[var(--text)]">
          AI · {commandLabel}
        </span>
        <button
          onClick={onDiscard}
          className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          title="Discard"
        >
          <X size={13} />
        </button>
      </div>

      {/* Body */}
      <div className="relative min-h-0 flex-1 overflow-y-auto">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <Loader2
              size={16}
              className="animate-spin text-[var(--text-muted)]"
            />
            <span className="text-xs text-[var(--text-muted)]">Thinking…</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col gap-3 p-3">
            <p
              className="rounded-md px-3 py-2 text-xs leading-5"
              style={{
                background: 'color-mix(in srgb, #ef4444 12%, transparent)',
                color: '#ef4444',
              }}
            >
              {error}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="self-start text-xs"
            >
              <RefreshCw data-icon="inline-start" size={12} />
              Retry
            </Button>
          </div>
        )}

        {result && !loading && (
          <div
            ref={previewRef}
            className="prose-sm max-w-none px-3 py-2.5 text-sm leading-relaxed text-[var(--text)] [&_blockquote]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:pl-2 [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:text-xs [&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-xs [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-1 [&_ol]:pl-4 [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-4"
          />
        )}
      </div>

      {/* Footer — only shown when there is a result */}
      {result && !loading && (
        <div
          className="flex shrink-0 items-center justify-end gap-2 border-t px-3 py-2"
          style={{ borderColor: 'var(--border)' }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={onDiscard}
            className="text-xs"
          >
            Discard
          </Button>
          <Button size="sm" onClick={onAccept} className="text-xs">
            <Check data-icon="inline-start" size={12} />
            Accept
          </Button>
        </div>
      )}
    </div>
  );
}
