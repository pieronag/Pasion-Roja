import type { Metadata } from 'next';
import { PosicionesPageClient } from '@/components/posiciones/posiciones-page-client';

export const metadata: Metadata = {
  title: 'Posiciones — Pasión Roja',
  description: 'Tablas de posiciones de todas las ligas y torneos.',
};

export default function PosicionesPage() {
  return <PosicionesPageClient />;
}
