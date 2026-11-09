import { AccentColor } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  accentColor: AccentColor;
  onAccentColorChange: (color: AccentColor) => void;
}

const ACCENT_OPTIONS: { id: AccentColor; label: string; color: string }[] = [
  { id: 'amber', label: 'Amber', color: '#f59e0b' },
  { id: 'iris', label: 'Iris', color: '#6366f1' },
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'sapphire', label: 'Sapphire', color: '#0ea5e9' },
  { id: 'rose', label: 'Rose', color: '#f43f5e' },
  { id: 'monochrome', label: 'Monochrome', color: '#888888' },
];

export function AccentColorSelectSetting({
  accentColor,
  onAccentColorChange,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs font-medium text-[var(--text-primary)]">
          Theme Color
        </div>
        <div className="text-[11px] text-[var(--text-secondary)]">
          Select accent highlight for carets, selections, and tools
        </div>
      </div>

      <div className="flex items-center gap-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-hover)] p-1">
        {ACCENT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onAccentColorChange(opt.id)}
            title={opt.label}
            className={cn(
              'h-4 w-4 rounded-full transition-transform hover:scale-110',
              accentColor === opt.id &&
                'scale-110 ring-2 ring-white ring-offset-1 ring-offset-[var(--surface-0)]',
            )}
            style={{ backgroundColor: opt.color }}
          />
        ))}
      </div>
    </div>
  );
}
