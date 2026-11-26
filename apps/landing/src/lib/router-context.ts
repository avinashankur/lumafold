import { createContext, useContext } from 'react';

export type RoutePath = '/' | '/privacy' | '/terms' | '/support';

export interface RouterContextValue {
  path: RoutePath;
  navigate: (to: string) => void;
}

export const RouterContext = createContext<RouterContextValue>({
  path: '/',
  navigate: () => {},
});

export function useRouter() {
  return useContext(RouterContext);
}
