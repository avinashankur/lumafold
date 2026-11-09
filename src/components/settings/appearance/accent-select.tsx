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
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-foreground text-xs font-medium">Theme color</div>
        <div className="text-muted-foreground text-[11px]">
          Accent highlight for carets, selections, and tools
        </div>
      </div>

      <div className="border-input flex h-7 w-36 shrink-0 items-center justify-between rounded-md border bg-[var(--surface-2)] px-2 shadow-xs">
        {ACCENT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onAccentColorChange(opt.id)}
            title={opt.label}
            aria-label={`Select ${opt.label} theme color`}
            className={cn(
              'focus-visible:ring-ring size-4 rounded-full transition-all duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:outline-none',
              accentColor === opt.id &&
                'scale-110 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--panel-bg)]',
            )}
            style={{ backgroundColor: opt.color }}
          />
        ))}
      </div>
    </div>
  );
}
