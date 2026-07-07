import { useEffect } from "react";
import { useTheme } from "./theme-provider";

type LumafoldThemeVarsProps = {
  accent: string;
  fontSize: number;
};

function getResolvedTheme(theme: "dark" | "light" | "system") {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getThemeVars(mode: "dark" | "light", accent: string, fontSize: number) {
  return mode === "dark"
    ? {
        "--bg": "#111113",
        "--panel-bg": "#18181b",
        "--panel-header-bg": "#1c1c20",
        "--toolbar-bg": "#1c1c20",
        "--tab-bar-bg": "#111113",
        "--border": "#2a2a30",
        "--text": "#e4e4e7",
        "--text-muted": "#71717a",
        "--hover": "#27272a",
        "--accent": accent,
        "--editor-font-size": `${fontSize}px`,
      }
    : {
        "--bg": "#f4f4f5",
        "--panel-bg": "#ffffff",
        "--panel-header-bg": "#fafafa",
        "--toolbar-bg": "#f9f9fb",
        "--tab-bar-bg": "#f4f4f5",
        "--border": "#e4e4e7",
        "--text": "#18181b",
        "--text-muted": "#71717a",
        "--hover": "#f1f1f3",
        "--accent": accent,
        "--editor-font-size": `${fontSize}px`,
      };
}

export function LumafoldThemeVars({ accent, fontSize }: LumafoldThemeVarsProps) {
  const { theme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    const applyVars = () => {
      const vars = getThemeVars(getResolvedTheme(theme), accent, fontSize);
      Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
    };

    applyVars();

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyVars);
    return () => media.removeEventListener("change", applyVars);
  }, [accent, fontSize, theme]);

  return null;
}
