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
    <section className="space-y-3">
      <h3 className="text-foreground text-sm font-medium">{title}</h3>
      <div className="space-y-2">
        {items.map(({ keys, description }) => (
          <div key={description} className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">{description}</span>

            <div className="flex items-center gap-1">
              {keys.map((key, index) => (
                <div
                  key={`${key}-${index}`}
                  className="flex items-center gap-1"
                >
                  <Kbd className="text-primary">{key}</Kbd>
                  {index < keys.length - 1 && (
                    <span className="text-muted-foreground text-xs">+</span>
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
    // { keys: ['Ctrl', 'Shift', 'L'], description: 'Toggle theme' },
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
    { keys: ['Ctrl', 'Enter'], description: 'Add a line break' },
    { keys: ['Ctrl', 'Shift', 'S'], description: 'Strikethrough' },
    { keys: ['Ctrl', 'E'], description: 'Code' },
  ];

  const paraFormatting: ShortcutItem[] = [
    { keys: ['Ctrl', 'Alt', '0'], description: 'Apply normal text style' },
    { keys: ['Ctrl', 'Alt', '1'], description: 'Apply heading 1 style' },
    { keys: ['Ctrl', 'Alt', '2'], description: 'Apply heading 2 style' },
    { keys: ['Ctrl', 'Alt', '3'], description: 'Apply heading 3 style' },
    { keys: ['Ctrl', 'Shift', '7'], description: 'Ordered list' },
    { keys: ['Ctrl', 'Shift', '8'], description: 'Bullet list' },
    { keys: ['Ctrl', 'Shift', '9'], description: 'Task list' },
    { keys: ['Ctrl', 'Shift', 'B'], description: 'Blockquote' },
    { keys: ['Ctrl', 'Shift', 'L'], description: 'Left Align' },
    { keys: ['Ctrl', 'Shift', 'E'], description: 'Center Align' },
    { keys: ['Ctrl', 'Shift', 'R'], description: 'Right Align' },
    { keys: ['Ctrl', 'Shift', 'J'], description: 'Justify Align' },
    { keys: ['Ctrl', 'Alt', 'C'], description: 'Code block' },
  ];

  const textSelection: ShortcutItem[] = [
    { keys: ['Ctrl', 'A'], description: 'Select all' },
    { keys: ['Ctrl', 'Shift', 'Arrow Left'], description: 'Select word left' },
    {
      keys: ['Ctrl', 'Shift', 'Arrow Right'],
      description: 'Select word right',
    },
    { keys: ['Ctrl', 'Shift', 'Arrow Up'], description: 'Select paragraph up' },
    {
      keys: ['Ctrl', 'Shift', 'Arrow Down'],
      description: 'Select paragraph down',
    },
  ];

  return (
    <>
      {' '}
      <ShortcutSection title="App shortcuts" items={appShortcuts} />{' '}
      <ShortcutSection title="Essentials" items={essentials} />{' '}
      <ShortcutSection title="Text formatting" items={textFormatting} />{' '}
      <ShortcutSection title="Paragraph formatting" items={paraFormatting} />{' '}
      <ShortcutSection title="Text selection" items={textSelection} />
    </>
  );
};
