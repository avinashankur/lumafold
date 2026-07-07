export const ShortcutsSettings = () => {
  return (
    <div className="divide-y divide-[var(--border)]">
      {[
        ["Ctrl+T", "New folder"],
        ["Ctrl+Shift+]", "Add panel"],
        ["Ctrl+Shift+L", "Toggle theme"],
        ["Ctrl+,", "Settings"],
      ].map(([key, description]) => (
        <div key={String(key)} className="flex items-center justify-between py-2.5 text-xs">
          <span className="text-[var(--text-muted)]">{String(description)}</span>
          <code className="rounded bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[var(--text)]">{String(key)}</code>
        </div>
      ))}
    </div>
  );
};
