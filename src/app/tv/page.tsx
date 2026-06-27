import type { Metadata } from 'next';
import { TVPageClient } from '@/components/tv/tv-page-client';

export const metadata: Metadata = {
  title: 'TV Online — Pasión Roja',
  description: 'Mira la transmisión en vivo de Pasión Roja TV.',
};

export default function TVPage() {
  return <TVPageClient />;
}
