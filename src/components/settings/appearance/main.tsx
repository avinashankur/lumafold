import { FontSizeSelectSetting, FontSizeSelectSettingProps } from "./font-size";
import { ThemeSelectSetting } from "./theme-select";

export const AppearanceSettings = ({
  fontSize,
  onFontSizeChange,
}: FontSizeSelectSettingProps) => {
  return (
    <>
      <ThemeSelectSetting />
      <FontSizeSelectSetting
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
      />
    </>
  );
};
