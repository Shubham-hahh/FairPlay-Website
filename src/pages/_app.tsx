import "@/styles/globals.css";
import '@fortawesome/fontawesome-svg-core/styles.css'
import type { AppProps } from "next/app";
import { DevBanner } from '@/components/ui/InfoBanner/infoBanner';
import { ToastProvider } from '@/components/ui/Toast/Toast';
import { appWithTranslation } from 'next-i18next';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <DevBanner />
      <Component {...pageProps} />
    </ToastProvider>
  );
}

export default appWithTranslation(MyApp);