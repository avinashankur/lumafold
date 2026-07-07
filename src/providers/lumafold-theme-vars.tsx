import { useEffect } from "react";

type LumafoldThemeVarsProps = {
  fontSize: number;
};

export function LumafoldThemeVars({ fontSize }: LumafoldThemeVarsProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty("--editor-font-size", `${fontSize}px`);
  }, [fontSize]);

  return null;
}
