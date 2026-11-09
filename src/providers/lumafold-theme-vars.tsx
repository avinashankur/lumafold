import { useEffect } from 'react';
import { AccentColor } from '@/types';

type LumafoldThemeVarsProps = {
  fontSize: number;
  accentColor?: AccentColor;
};

export function LumafoldThemeVars({
  fontSize,
  accentColor = 'amber',
}: LumafoldThemeVarsProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--editor-font-size', `${fontSize}px`);
    root.setAttribute('data-accent', accentColor);
  }, [fontSize, accentColor]);

  return null;
}
