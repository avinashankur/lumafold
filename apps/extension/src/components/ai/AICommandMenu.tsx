import { useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import {
  AlignLeft,
  ArrowUpDown,
  FileText,
  LucideIcon,
  Sparkles,
  Tag,
  WrapText,
} from 'lucide-react';
import { AIResultPanel } from './AIResultPanel';
import {
  AI_ACTIONS,
  type AIAction,
  type AIResult,
  runAction,
} from '@/lib/ai/actions';
import { AISettings } from '@/types';
import { cn } from '@/lib/utils';
import { matchShortcut } from '@/lib/shortcuts';

// Icons are the one thing an action needs from the view. An action without
// an entry here gets the generic one.
const ACTION_ICONS: Record<string, LucideIcon> = {
  rewrite: WrapText,
  organize: ArrowUpDown,
  format: AlignLeft,
  summarize: FileText,
  title: Tag,
};

interface MenuPosition {
  x: number;
  y: number;
}

interface Props {
  children: ReactNode;
  panelContent: string;
  aiSettings: AISettings;
  onAccept: (result: AIResult) => void;
}

export function AICommandMenu({
  children,
  panelContent,
  aiSettings,
  onAccept,
}: Props) {
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // The request in flight, if any. Aborting it also tells its handlers
  // below to stay quiet, so a late answer never lands in the wrong place.
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!menuPos) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuPos(null);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuPos]);

  // AI menu shortcut: open menu when this panel's editor has focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchShortcut(e)?.id === 'aiMenu') {
        const container = containerRef.current;
        if (!container) return;
        // Only open if this panel contains the focused element
        if (!container.contains(document.activeElement)) return;
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        setMenuPos({
          x: rect.left + rect.width / 2 - 112, // center the 224px-wide menu
          y: rect.top + 8,
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  }, []);

  const start = useCallback(
    async (action: AIAction) => {
      requestRef.current?.abort();
      const request = new AbortController();
      requestRef.current = request;

      setMenuPos(null);
      setActiveAction(action);
      setResult(null);
      setError(null);
      setLoading(true);
      try {
        const next = await runAction(action.id, panelContent, aiSettings, {
          signal: request.signal,
        });
        if (request.signal.aborted) return;
        setResult(next);
      } catch (err) {
        if (request.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      }
      setLoading(false);
    },
    [panelContent, aiSettings],
  );

  const close = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    setActiveAction(null);
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  const handleAccept = useCallback(() => {
    if (result) onAccept(result);
    close();
  }, [result, onAccept, close]);

  const handleRetry = useCallback(() => {
    if (activeAction) start(activeAction);
  }, [activeAction, start]);

  return (
    <div
      ref={containerRef}
      className="relative h-full"
      onContextMenu={handleContextMenu}
    >
      {children}

      {/* Custom right-click floating menu */}
      {menuPos && !activeAction && (
        <div
          ref={menuRef}
          className="fixed z-[60] w-56 overflow-hidden rounded-lg p-1 shadow-lg outline-none"
          style={{
            left: menuPos.x,
            top: menuPos.y,
            background: 'var(--panel-bg)',
            border: '1px solid var(--border)',
            // Clamp to viewport so the menu never goes off-screen
            maxHeight: `calc(100vh - ${menuPos.y + 8}px)`,
          }}
        >
          {/* Header */}
          <div className="mb-0.5 flex items-center gap-1.5 px-2 py-1.5">
            <Sparkles size={11} className="text-[var(--text-muted)]" />
            <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              AI Actions
            </span>
          </div>
          <div
            className="-mx-1 mb-1 h-px"
            style={{ background: 'var(--border)' }}
          />

          {AI_ACTIONS.map((action) => {
            const Icon = ACTION_ICONS[action.id] ?? Sparkles;
            return (
              <button
                key={action.id}
                className={cn(
                  'flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left transition-colors',
                  'outline-none hover:bg-[var(--hover)] focus:bg-[var(--hover)]',
                )}
                onClick={() => start(action)}
              >
                <div className="flex items-center gap-1.5">
                  <Icon
                    size={13}
                    className="shrink-0 text-[var(--text-muted)]"
                  />
                  <span className="text-xs font-medium text-[var(--text)]">
                    {action.label}
                  </span>
                </div>
                <span className="pl-[21px] text-[10px] leading-4 text-[var(--text-muted)]">
                  {action.description}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Result overlay — shown while loading or when a result is ready */}
      {activeAction && (
        <AIResultPanel
          loading={loading}
          error={error}
          result={result}
          commandLabel={activeAction.label}
          onAccept={handleAccept}
          onDiscard={close}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
