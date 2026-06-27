import type { Metadata } from 'next';
import { MultimediaPageClient } from '@/components/multimedia/multimedia-page-client';

export const metadata: Metadata = {
  title: 'Multimedia — Pasión Roja',
  description: 'Galería de fotos, videos y contenido multimedia deportivo.',
};

export default function MultimediaPage() {
  return <MultimediaPageClient />;
}
