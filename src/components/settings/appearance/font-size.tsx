import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const selectedFontSize = isFontSize(fontSize) ? fontSize : 13;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-y-0.5">
        <label
          className="text-xs font-medium"
          htmlFor="font-size-select"
        >
          Font size
        </label>
        <span className="text-[11px] text-muted-foreground">Select the font size</span>
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
          className="w-24 bg-[var(--panel-bg)] text-xs text-[var(--text)]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" className="min-w-24">
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
