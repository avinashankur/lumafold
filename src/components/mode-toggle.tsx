import { Monitor, Moon, Sun } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Select
      value={theme}
      onValueChange={(value) => {
        if (value) {
          setTheme(value);
        }
      }}
    >
      <SelectTrigger>
        <div className="flex items-center gap-2 text-xs">
          {theme === "dark" ? (
            <Moon className="" />
          ) : (
            <Sun className="" />
          )}
          <SelectValue placeholder="Theme" />
        </div>
      </SelectTrigger>

      <SelectContent className="p-1 text-xs">
        <SelectItem value="light" className="text-xs">
          <div className="flex items-center gap-2">
            <Sun />
            Light
          </div>
        </SelectItem>

        <SelectItem value="dark" className="text-xs">
          <div className="flex items-center gap-2">
            <Moon />
            Dark
          </div>
        </SelectItem>

        <SelectItem value="system" className="text-xs">
          <Monitor />
          System
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
