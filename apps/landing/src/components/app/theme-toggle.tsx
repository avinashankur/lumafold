import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="text-muted-foreground hover:text-foreground h-auto px-1.5 py-0.5 text-xs font-normal hover:bg-transparent"
    >
      {isDark ? 'light' : 'dark'}
    </Button>
  );
}
