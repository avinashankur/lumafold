import { ModeToggle } from '@/components/mode-toggle';

export const ThemeSelectSetting = () => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <p className="text-foreground text-xs font-medium">Theme</p>
        <span className="text-muted-foreground text-[11px]">
          Choose a theme for Lumafold
        </span>
      </div>
      <ModeToggle />
    </div>
  );
};
