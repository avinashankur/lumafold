import { FontSizeSelectSetting } from './font-size';
import { ThemeSelectSetting } from './theme-select';
import { AccentColorSelectSetting } from './accent-select';
import { AccentColor } from '@/types';

interface AppearanceSettingsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  accentColor?: AccentColor;
  onAccentColorChange?: (color: AccentColor) => void;
}

export const AppearanceSettings = ({
  fontSize,
  onFontSizeChange,
  accentColor = 'amber',
  onAccentColorChange,
}: AppearanceSettingsProps) => {
  return (
    <div className="space-y-4">
      <ThemeSelectSetting />
      {onAccentColorChange && (
        <AccentColorSelectSetting
          accentColor={accentColor}
          onAccentColorChange={onAccentColorChange}
        />
      )}
      <FontSizeSelectSetting
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
      />
    </div>
  );
};
