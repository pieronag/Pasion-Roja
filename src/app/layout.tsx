import type { Metadata, Viewport } from 'next';
import { Inter, Archivo_Black } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/providers';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Footer } from '@/components/layout/footer';
import { BannerStream } from '@/components/transmision/banner-stream';
import { NetworkStatus } from '@/components/shared/network-status';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Pasión Roja — Deporte en Vivo desde Angol',
    template: '%s | Pasión Roja',
  },
  description: 'La plataforma deportiva digital definitiva para Angol, Chile. Marcadores en vivo, noticias y transmisiones.',
  keywords: ['deporte', 'angol', 'fútbol', 'marcador en vivo', 'noticias deportivas', 'chile'],
  openGraph: {
    title: 'Pasión Roja — Deporte en Vivo desde Angol',
    description: 'Marcadores en vivo, noticias y transmisiones deportivas.',
    siteName: 'Pasión Roja',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pasión Roja — Deporte en Vivo',
    description: 'Marcadores en vivo, noticias y transmisiones deportivas.',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${archivoBlack.variable} font-body bg-pizarra text-white min-h-screen`}>
        <Providers>
          <Header />
          <NetworkStatus />
          <BannerStream />
          <main className="pb-20 md:pb-8">{children}</main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
