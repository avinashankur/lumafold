import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEFAULT_FONT_SIZE } from '@/lib/persistence';

const FONT_SIZES = [12, 13, 14, 15, 16, 17, 18] as const;

export type FontSize = (typeof FONT_SIZES)[number];

export interface FontSizeSelectSettingProps {
  fontSize: number;
  onFontSizeChange: (fontSize: FontSize) => void;
}

function isFontSize(value: number): value is FontSize {
  return FONT_SIZES.includes(value as FontSize);
}

export const FontSizeSelectSetting = ({
  fontSize,
  onFontSizeChange,
}: FontSizeSelectSettingProps) => {
  const selectedFontSize = isFontSize(fontSize) ? fontSize : DEFAULT_FONT_SIZE;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label
          className="text-foreground text-xs font-medium"
          htmlFor="font-size-select"
        >
          Font size
        </label>
        <span className="text-muted-foreground text-[11px]">
          Editor text size in pixels
        </span>
      </div>
      <Select
        value={String(selectedFontSize)}
        onValueChange={(value) => {
          const nextFontSize = Number(value);
          if (isFontSize(nextFontSize)) onFontSizeChange(nextFontSize);
        }}
      >
        <SelectTrigger
          id="font-size-select"
          size="sm"
          className="w-36 shrink-0 text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" className="w-36 min-w-36 p-1">
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)} className="text-xs">
              {size}px
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
