import React from 'react';
import { Muted, Text } from '@/components/app/typography';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { SITE_CONFIG } from '@/config/site';
import { Link } from '@/lib/router';

interface SiteLayoutProps {
  isDark: boolean;
  onToggleTheme: () => void;
  children: React.ReactNode;
}

export function SiteLayout({
  isDark,
  onToggleTheme,
  children,
}: SiteLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-10">
      <header className="flex items-center justify-between gap-4 pb-10">
        <Link
          to="/"
          className="text-foreground text-sm font-semibold no-underline"
        >
          {SITE_CONFIG.name}
        </Link>

        <nav
          aria-label="Primary"
          className="text-muted-foreground flex items-center gap-4 text-xs"
        >
          <Link
            to="/privacy"
            className="text-muted-foreground hover:text-foreground no-underline"
          >
            privacy
          </Link>
          <Link
            to="/terms"
            className="text-muted-foreground hover:text-foreground no-underline"
          >
            terms
          </Link>
          <Link
            to="/support"
            className="text-muted-foreground hover:text-foreground no-underline"
          >
            support
          </Link>
          <a
            href={SITE_CONFIG.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground no-underline"
          >
            github
          </a>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="pt-12">
        <Muted>
          <Text as="span" className="text-muted-foreground text-xs">
            {SITE_CONFIG.name}, local browser notes.
          </Text>
        </Muted>
      </footer>
    </div>
  );
}
