import type { Metadata } from 'next';
import { PartidoPageClient } from '@/components/partido/partido-page-client';

export const metadata: Metadata = {
  title: 'Partido en Vivo',
  description: 'Sigue el marcador en vivo, la cronología y los comentarios del partido.',
};

export default function PartidoPage() {
  return <PartidoPageClient />;
}
