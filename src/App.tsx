import type { ReactNode } from "react";
import { AppProviders } from "./providers/app-providers";

type AppProps = {
  children: ReactNode;
};

function App({ children }: AppProps) {
  return <AppProviders>{children}</AppProviders>;
}

export default App;
