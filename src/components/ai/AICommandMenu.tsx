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
import { useAI } from '@/hooks/useAI';
import { AICommand } from '@/lib/ai/commands';
import { AISettings } from '@/types';
import { cn } from '@/lib/utils';

interface CommandDef {
  command: AICommand;
  label: string;
  description: string;
  Icon: LucideIcon;
}

const COMMANDS: CommandDef[] = [
  {
    command: 'rewrite',
    label: 'Rewrite',
    description: 'Fix grammar and improve clarity',
    Icon: WrapText,
  },
  {
    command: 'organize',
    label: 'Organize',
    description: 'Sort and group bullet points',
    Icon: ArrowUpDown,
  },
  {
    command: 'format',
    label: 'Format',
    description: 'Add headings and hierarchy',
    Icon: AlignLeft,
  },
  {
    command: 'summarize',
    label: 'Summarize',
    description: 'Condense to key bullet points',
    Icon: FileText,
  },
  {
    command: 'title',
    label: 'Generate Title',
    description: 'Suggest a title for this panel',
    Icon: Tag,
  },
];

interface MenuPosition {
  x: number;
  y: number;
}

interface Props {
  children: ReactNode;
  panelContent: string;
  aiSettings: AISettings;
  onAccept: (result: string, command: AICommand) => void;
}

export function AICommandMenu({
  children,
  panelContent,
  aiSettings,
  onAccept,
}: Props) {
  const { loading, error, run } = useAI();
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const [activeCommand, setActiveCommand] = useState<CommandDef | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Ctrl+Shift+A shortcut: open menu when this panel's editor has focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.shiftKey && e.key === 'A') {
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

  const handleCommand = useCallback(
    async (def: CommandDef) => {
      setMenuPos(null);
      setActiveCommand(def);
      setResult(null);
      const res = await run(def.command, panelContent, aiSettings);
      setResult(res);
    },
    [panelContent, aiSettings, run],
  );

  const handleAccept = useCallback(() => {
    if (result && activeCommand) {
      onAccept(result, activeCommand.command);
    }
    setActiveCommand(null);
    setResult(null);
  }, [result, activeCommand, onAccept]);

  const handleDiscard = useCallback(() => {
    setActiveCommand(null);
    setResult(null);
  }, []);

  const handleRetry = useCallback(() => {
    if (activeCommand) {
      handleCommand(activeCommand);
    }
  }, [activeCommand, handleCommand]);

  return (
    <div
      ref={containerRef}
      className="relative h-full"
      onContextMenu={handleContextMenu}
    >
      {children}

      {/* Custom right-click floating menu */}
      {menuPos && !activeCommand && (
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

          {COMMANDS.map((def) => (
            <button
              key={def.command}
              className={cn(
                'flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left transition-colors',
                'outline-none hover:bg-[var(--hover)] focus:bg-[var(--hover)]',
              )}
              onClick={() => handleCommand(def)}
            >
              <div className="flex items-center gap-1.5">
                <def.Icon
                  size={13}
                  className="shrink-0 text-[var(--text-muted)]"
                />
                <span className="text-xs font-medium text-[var(--text)]">
                  {def.label}
                </span>
              </div>
              <span className="pl-[21px] text-[10px] leading-4 text-[var(--text-muted)]">
                {def.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Result overlay — shown while loading or when a result is ready */}
      {activeCommand && (
        <AIResultPanel
          loading={loading}
          error={error}
          result={result}
          commandLabel={activeCommand.label}
          onAccept={handleAccept}
          onDiscard={handleDiscard}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
