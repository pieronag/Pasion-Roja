import type { Metadata, Viewport } from 'next';
import { Inter, Archivo_Black } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/providers';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Footer } from '@/components/layout/footer';
import { NetworkStatus } from '@/components/shared/network-status';
import { WhatsAppFloat } from '@/components/shared/whatsapp-float';
import { SportsTicker } from '@/components/shared/sports-ticker';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Pasión Roja — Deporte en Vivo desde Angol', template: '%s | Pasión Roja' },
  description: 'Radio, TV, marcadores en vivo y noticias deportivas de Angol, Chile.',
  keywords: ['deporte', 'angol', 'fútbol', 'radio', 'tv online', 'marcador en vivo', 'noticias deportivas'],
  openGraph: {
    title: 'Pasión Roja — Radio y Deporte desde Angol',
    description: 'Radio online, TV, marcadores en vivo y noticias.',
    siteName: 'Pasión Roja', locale: 'es_CL', type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Pasión Roja', description: 'Radio y deporte desde Angol' },
  icons: { icon: '/icons/icon.svg', apple: '/icons/apple-touch-icon.png' },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#E11D48',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${archivoBlack.variable} font-body bg-[var(--bg)] text-[var(--text)] min-h-screen`}>
        <Providers>
          <Header />
          <NetworkStatus />
          <main className="pb-20 md:pb-8">{children}</main>
          <Footer />
          <BottomNav />
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  );
}
