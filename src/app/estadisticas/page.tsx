import type { Metadata } from 'next';
import { EstadisticasPageClient } from '@/components/estadisticas/estadisticas-page-client';

export const metadata: Metadata = {
  title: 'Estadísticas — Pasión Roja',
  description: 'Goleadores, asistentes y líderes estadísticos.',
};

export default function EstadisticasPage() {
  return <EstadisticasPageClient />;
}
