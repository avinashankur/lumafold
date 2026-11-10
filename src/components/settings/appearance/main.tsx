import { FontSizeSelectSetting } from './font-size';
import { ThemeSelectSetting } from './theme-select';
import { AccentColorSelectSetting } from './accent-select';
import { Separator } from '@/components/ui/separator';
import { AccentColor } from '@/types';

interface AppearanceSettingsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  accentColor: AccentColor;
  onAccentColorChange?: (color: AccentColor) => void;
}

export const AppearanceSettings = ({
  fontSize,
  onFontSizeChange,
  accentColor,
  onAccentColorChange,
}: AppearanceSettingsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <ThemeSelectSetting />
      {onAccentColorChange && (
        <>
          <Separator />
          <AccentColorSelectSetting
            accentColor={accentColor}
            onAccentColorChange={onAccentColorChange}
          />
        </>
      )}
      <Separator />
      <FontSizeSelectSetting
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
      />
    </div>
  );
};
