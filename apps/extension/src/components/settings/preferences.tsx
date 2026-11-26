import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { PreferencesSettingTypes } from '../../types';
import type { DisplayMode } from '@/lib/floating-window';

export interface PreferencesSettingsProps {
  preferences: PreferencesSettingTypes;
  onPreferencesChange: (preferences: Partial<PreferencesSettingTypes>) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
}

export const PreferencesSettings = ({
  preferences,
  onPreferencesChange,
  displayMode,
  onDisplayModeChange,
}: PreferencesSettingsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-foreground text-xs font-medium">
            Open in Floating Window
          </div>
          <div className="text-muted-foreground mt-0.5 text-[11px]">
            Open Lumafold in a resizable, persistent window instead of the
            default popup.
          </div>
        </div>
        <Switch
          checked={displayMode === 'floating'}
          onCheckedChange={(checked) =>
            onDisplayModeChange(checked ? 'floating' : 'popup')
          }
          aria-label="Toggle floating window mode"
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-foreground text-xs font-medium">
            Panel headers
          </div>
          <div className="text-muted-foreground mt-0.5 text-[11px]">
            Show titles and panel controls above editors.
          </div>
        </div>
        <Switch
          checked={preferences.showPanelHeaders}
          onCheckedChange={(checked) =>
            onPreferencesChange({ showPanelHeaders: checked })
          }
          aria-label="Toggle panel headers"
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-foreground text-xs font-medium">
            Tab bar scrollbar
          </div>
          <div className="text-muted-foreground mt-0.5 text-[11px]">
            Show the horizontal scrollbar under folder tabs.
          </div>
        </div>
        <Switch
          checked={preferences.showTabBarScrollBar}
          onCheckedChange={(checked) =>
            onPreferencesChange({ showTabBarScrollBar: checked })
          }
          aria-label="Toggle tab bar scrollbar"
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-foreground text-xs font-medium">
            Panel scrollbar
          </div>
          <div className="text-muted-foreground mt-0.5 text-[11px]">
            Show the vertical scrollbar on panels when text overflows.
          </div>
        </div>
        <Switch
          checked={preferences.showPanelScrollBar}
          onCheckedChange={(checked) =>
            onPreferencesChange({ showPanelScrollBar: checked })
          }
          aria-label="Toggle panel vertical scrollbar"
        />
      </div>
    </div>
  );
};
