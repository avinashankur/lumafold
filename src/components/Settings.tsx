import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import type { AppState } from '../types';
import { Database, Keyboard, Palette, Settings2, Sparkles } from 'lucide-react';
import { AISettings, PreferencesSettingTypes, ThemeSettings } from '../types';
import { DataSettings } from './settings/data';
import { AppearanceSettings } from './settings/appearance/main';
import { PreferencesSettings } from './settings/preferences';
import { ShortcutsSettings } from './settings/shortcuts';
import { AISettingsSection } from './settings/ai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  type DisplayMode,
  STORAGE_KEY_DISPLAY_MODE,
  getDisplayMode,
  setDisplayMode,
} from '@/lib/floating-window';

interface Props {
  open?: boolean;
  theme: ThemeSettings;
  onThemeChange: (t: Partial<ThemeSettings>) => void;
  preferences: PreferencesSettingTypes;
  onPreferencesChange: (preferences: Partial<PreferencesSettingTypes>) => void;
  aiSettings: AISettings;
  onAISettingsChange: (settings: Partial<AISettings>) => void;
  onClose: () => void;
  state: AppState;
  onImportState: (data: unknown) => boolean;
}

export default function Settings({
  open = true,
  theme,
  onThemeChange,
  preferences,
  onPreferencesChange,
  aiSettings,
  onAISettingsChange,
  onClose,
  state,
  onImportState,
}: Props) {
  const [activeSection, setActiveSection] = useState<
    'appearance' | 'preferences' | 'data' | 'shortcuts' | 'ai'
  >('appearance');

  const [displayMode, setDisplayModeState] = useState<DisplayMode>('popup');

  useEffect(() => {
    getDisplayMode().then(setDisplayModeState).catch(console.error);

    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
      ) => {
        if (areaName === 'local' && changes[STORAGE_KEY_DISPLAY_MODE]) {
          const newMode =
            changes[STORAGE_KEY_DISPLAY_MODE].newValue === 'floating'
              ? 'floating'
              : 'popup';
          setDisplayModeState(newMode);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => {
        chrome.storage.onChanged.removeListener(listener);
      };
    }
  }, []);

  const handleDisplayModeChange = async (nextMode: DisplayMode) => {
    setDisplayModeState(nextMode);
    await setDisplayMode(nextMode);

    if (nextMode === 'floating') {
      // 1. Update action popup to ""
      if (typeof chrome !== 'undefined' && chrome.action?.setPopup) {
        try {
          await chrome.action.setPopup({ popup: '' });
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Open (or focus) floating window via background service worker
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        try {
          await chrome.runtime.sendMessage({ type: 'OPEN_FLOATING_WINDOW' });
        } catch {
          window.open(
            chrome.runtime.getURL('index.html?mode=floating'),
            '_blank',
            'popup=yes',
          );
        }
      } else {
        window.open(
          window.location.origin + '?mode=floating',
          '_blank',
          'popup=yes',
        );
      }

      // 3. Close the current default_popup (window.close())
      const isFloating =
        new URLSearchParams(window.location.search).get('mode') === 'floating';
      const isTab =
        document.documentElement.getAttribute('data-mode') === 'tab';
      if (!isFloating && !isTab) {
        window.close();
      }
    } else {
      // 1. Restore action popup to "index.html"
      if (typeof chrome !== 'undefined' && chrome.action?.setPopup) {
        try {
          await chrome.action.setPopup({ popup: 'index.html' });
        } catch (e) {
          console.error(e);
        }
      }

      // 2. If in floating mode, close floating window (and openPopup if supported)
      const isFloating =
        new URLSearchParams(window.location.search).get('mode') === 'floating';
      if (isFloating) {
        if (typeof chrome !== 'undefined' && chrome.action?.openPopup) {
          try {
            await chrome.action.openPopup();
          } catch (e) {
            console.log('chrome.action.openPopup not supported or failed:', e);
          }
        }
        window.close();
      }
    }
  };

  const sections = [
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'preferences' as const, label: 'Preferences', icon: Settings2 },
    { id: 'ai' as const, label: 'AI', icon: Sparkles },
    { id: 'shortcuts' as const, label: 'Shortcuts', icon: Keyboard },
    { id: 'data' as const, label: 'Data', icon: Database },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="border-border flex h-[480px] max-h-[85vh] w-[min(660px,94vw)] flex-row overflow-hidden rounded-xl border bg-[var(--panel-bg)] p-0 shadow-2xl"
        showCloseButton={true}
      >
        {/* Left Sidebar - Uses Header/Chrome shade of black instead of darkest shade */}
        <aside className="flex w-42 shrink-0 flex-col justify-between border-r border-[var(--border-subtle)] bg-[var(--header-bg)] p-3 select-none">
          <div>
            <div className="text-muted-foreground/80 px-2.5 pt-1 pb-2.5 text-[10px] font-semibold tracking-wider uppercase">
              Settings
            </div>
            <nav className="flex flex-col gap-1" aria-label="Settings sections">
              {sections.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-all duration-150',
                      isActive
                        ? 'text-foreground border border-[var(--border-subtle)] bg-[var(--panel-bg)] font-medium shadow-xs'
                        : 'text-muted-foreground hover:text-foreground border border-transparent hover:bg-[var(--surface-hover)]',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-3.5 shrink-0 transition-colors',
                        isActive ? 'text-foreground' : 'opacity-70',
                      )}
                    />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="text-muted-foreground/60 flex items-center justify-between border-t border-[var(--border-subtle)] px-2.5 pt-2.5 text-[10px]">
            <span>Lumafold</span>
            <span className="font-mono text-[9px] opacity-75">v2.0</span>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex min-w-0 flex-1 flex-col bg-[var(--panel-bg)]">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--panel-bg)] px-6 py-3.5">
            <div>
              <DialogTitle className="text-foreground text-sm font-semibold">
                {sections.find((s) => s.id === activeSection)?.label}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-0.5 text-[11px]">
                {activeSection === 'appearance' &&
                  'Customize theme, accent color, and typography'}
                {activeSection === 'preferences' &&
                  'Configure workspace layout and editor controls'}
                {activeSection === 'ai' &&
                  'Configure your AI provider and API keys'}
                {activeSection === 'shortcuts' &&
                  'Quick reference for keyboard shortcuts'}
                {activeSection === 'data' &&
                  'Export and restore workspace backups'}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-5">
            {activeSection === 'appearance' && (
              <AppearanceSettings
                fontSize={theme.fontSize}
                onFontSizeChange={(fontSize) => onThemeChange({ fontSize })}
                accentColor={theme.accentColor}
                onAccentColorChange={(accentColor) =>
                  onThemeChange({ accentColor })
                }
              />
            )}

            {activeSection === 'preferences' && (
              <PreferencesSettings
                preferences={preferences}
                onPreferencesChange={onPreferencesChange}
                displayMode={displayMode}
                onDisplayModeChange={handleDisplayModeChange}
              />
            )}

            {activeSection === 'data' && (
              <DataSettings state={state} onImportState={onImportState} />
            )}

            {activeSection === 'shortcuts' && <ShortcutsSettings />}

            {activeSection === 'ai' && (
              <AISettingsSection
                aiSettings={aiSettings}
                onAISettingsChange={onAISettingsChange}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
