import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ModalProvider } from '@/context/ModalContext';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ModalProvider>{children}</ModalProvider>
    </ThemeProvider>
  );
}
