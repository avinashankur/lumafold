import { Switch } from '@/components/ui/switch';
import { PreferencesSettingTypes } from '../../types';

export interface PreferencesSettingsProps {
  preferences: PreferencesSettingTypes;
  onPreferencesChange: (preferences: Partial<PreferencesSettingTypes>) => void;
}

export const PreferencesSettings = ({
  preferences,
  onPreferencesChange,
}: PreferencesSettingsProps) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium">Panel headers</div>
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

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium">Tab bar scrollbar</div>
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
    </div>
  );
};
