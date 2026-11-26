import { useEffect, useState } from 'react';
import { SiteLayout } from '@/components/app/site-layout';
import { RouterProvider } from '@/lib/router';
import { useRouter } from '@/lib/router-context';
import { LandingPage } from '@/pages/landing-page';
import { PrivacyPage } from '@/pages/privacy-page';
import { SupportPage } from '@/pages/support-page';
import { TermsPage } from '@/pages/terms-page';

const THEME_STORAGE_KEY = 'lumafold_landing_theme';

function getInitialDark(): boolean {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

function ActivePage() {
  const { path } = useRouter();
  switch (path) {
    case '/privacy':
      return <PrivacyPage />;
    case '/terms':
      return <TermsPage />;
    case '/support':
      return <SupportPage />;
    case '/':
    default:
      return <LandingPage />;
  }
}

export function App() {
  const [isDark, setIsDark] = useState<boolean>(getInitialDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore storage failures in restricted contexts
    }
  }, [isDark]);

  return (
    <RouterProvider>
      <SiteLayout
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
      >
        <ActivePage />
      </SiteLayout>
    </RouterProvider>
  );
}

export default App;
