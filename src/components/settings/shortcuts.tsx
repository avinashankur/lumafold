import { Kbd } from '@/components/ui/kbd';

type ShortcutItem = {
  keys: string[];
  description: string;
};

const ShortcutSection = ({
  title,
  items,
}: {
  title: string;
  items: ShortcutItem[];
}) => {
  return (
    <section className="space-y-2">
      <h3 className="text-muted-foreground/80 text-[10px] font-semibold tracking-wider uppercase">
        {title}
      </h3>
      <div className="divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)]/60 px-3 py-1 shadow-xs">
        {items.map(({ keys, description }) => (
          <div
            key={description}
            className="flex items-center justify-between py-2 text-xs"
          >
            <span className="text-foreground text-xs">{description}</span>

            <div className="flex items-center gap-1">
              {keys.map((key, index) => (
                <div
                  key={`${key}-${index}`}
                  className="flex items-center gap-1"
                >
                  <Kbd className="border border-[var(--border-subtle)] bg-[var(--panel-bg)] font-mono text-[11px] shadow-2xs">
                    {key}
                  </Kbd>
                  {index < keys.length - 1 && (
                    <span className="text-muted-foreground/60 text-[10px]">
                      +
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const ShortcutsSettings = () => {
  const appShortcuts: ShortcutItem[] = [
    { keys: ['Ctrl', 'T'], description: 'New folder' },
    { keys: ['Ctrl', 'Shift', ']'], description: 'Add panel' },
    { keys: ['Ctrl', ','], description: 'Settings' },
  ];

  const essentials: ShortcutItem[] = [
    { keys: ['Ctrl', 'C'], description: 'Copy' },
    { keys: ['Ctrl', 'X'], description: 'Cut' },
    { keys: ['Ctrl', 'V'], description: 'Paste' },
    { keys: ['Ctrl', 'Shift', 'V'], description: 'Paste without formatting' },
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Shift', 'Enter'], description: 'Add a line break' },
  ];

  const textFormatting: ShortcutItem[] = [
    { keys: ['Ctrl', 'B'], description: 'Bold' },
    { keys: ['Ctrl', 'I'], description: 'Italic' },
    { keys: ['Ctrl', 'U'], description: 'Underline' },
    { keys: ['Ctrl', 'Shift', 'S'], description: 'Strikethrough' },
    { keys: ['Ctrl', 'E'], description: 'Code' },
  ];

  const paraFormatting: ShortcutItem[] = [
    { keys: ['Ctrl', 'Alt', '0'], description: 'Normal text' },
    { keys: ['Ctrl', 'Alt', '1'], description: 'Heading 1' },
    { keys: ['Ctrl', 'Alt', '2'], description: 'Heading 2' },
    { keys: ['Ctrl', 'Alt', '3'], description: 'Heading 3' },
    { keys: ['Ctrl', 'Shift', '7'], description: 'Ordered list' },
    { keys: ['Ctrl', 'Shift', '8'], description: 'Bullet list' },
    { keys: ['Ctrl', 'Shift', 'B'], description: 'Blockquote' },
    { keys: ['Ctrl', 'Alt', 'C'], description: 'Code block' },
  ];

  return (
    <div className="space-y-4">
      <ShortcutSection title="App shortcuts" items={appShortcuts} />
      <ShortcutSection title="Essentials" items={essentials} />
      <ShortcutSection title="Text formatting" items={textFormatting} />
      <ShortcutSection title="Paragraph formatting" items={paraFormatting} />
    </div>
  );
};
