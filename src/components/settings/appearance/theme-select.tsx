import { ModeToggle } from "@/components/mode-toggle";

export const ThemeSelectSetting = () => {
  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium">Theme</p>
          <span className="text-[11px] text-muted-foreground">Choose a theme for Lumafold</span>
        </div>
        <ModeToggle />
      </div>
    </>
  );
};
