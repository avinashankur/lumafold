import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/components/theme-provider';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Select
      value={theme}
      onValueChange={(value) => {
        if (value) {
          setTheme(value as 'light' | 'dark' | 'system');
        }
      }}
    >
      <SelectTrigger size="sm" className="w-36 shrink-0 text-xs">
        <div className="flex items-center gap-1.5">
          <SelectValue placeholder="Theme" />
        </div>
      </SelectTrigger>

      <SelectContent align="end" className="w-36 p-1 text-xs">
        <SelectItem value="light" className="text-xs">
          <div className="flex items-center gap-2">Light</div>
        </SelectItem>

        <SelectItem value="dark" className="text-xs">
          <div className="flex items-center gap-2">Dark</div>
        </SelectItem>

        <SelectItem value="system" className="text-xs">
          <div className="flex items-center gap-2">System</div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
