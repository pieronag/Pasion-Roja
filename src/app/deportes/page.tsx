import type { Metadata } from 'next';
import { DeportesPageClient } from '@/components/deportes/deportes-page-client';

export const metadata: Metadata = {
  title: 'Deportes — Pasión Roja',
  description: 'Todos los deportes en Angol. Fútbol, básquetbol, voleibol y más.',
};

export default function DeportesPage() {
  return <DeportesPageClient />;
}
