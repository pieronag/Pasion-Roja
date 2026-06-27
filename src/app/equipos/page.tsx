import type { Metadata } from 'next';
import { EquiposPageClient } from '@/components/equipos/equipos-page-client';

export const metadata: Metadata = {
  title: 'Equipos — Pasión Roja',
  description: 'Todos los equipos deportivos de Angol y la zona.',
};

export default function EquiposPage() {
  return <EquiposPageClient />;
}
