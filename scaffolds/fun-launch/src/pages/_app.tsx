import '@/styles/globals.css';
import { Adapter, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import type { AppProps } from 'next/app';
import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWindowWidthListener } from '@/lib/device';

function AppProviders({ Component, pageProps }: AppProps) {
  const { resolvedTheme } = useTheme();

  const wallets: Adapter[] = useMemo(() => [], []);

  const queryClient = useMemo(() => new QueryClient(), []);

  useWindowWidthListener();

  const walletTheme = resolvedTheme === 'light' ? 'light' : 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedWalletProvider
        wallets={wallets}
        config={{
          env: 'devnet',
          autoConnect: true,
          metadata: {
            name: 'CurveLab Studio',
            description: 'Meteora Dynamic Bonding Curve Designer & Validator',
            url: 'https://curvelab.app',
            iconUrls: ['/curvelab-logo.jpg'],
          },
          theme: walletTheme,
          lang: 'en',
        }}
      >
        <Toaster theme={walletTheme} richColors closeButton />
        <Component {...pageProps} />
      </UnifiedWalletProvider>
    </QueryClientProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <AppProviders {...props} />
    </ThemeProvider>
  );
}
