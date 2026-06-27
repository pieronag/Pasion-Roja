import type { Metadata } from 'next';
import { PartidosPageClient } from '@/components/partidos/partidos-page-client';

export const metadata: Metadata = {
  title: 'Partidos — Pasión Roja',
  description: 'Calendario de partidos, resultados y marcadores en vivo.',
};

export default function PartidosPage() {
  return <PartidosPageClient />;
}
