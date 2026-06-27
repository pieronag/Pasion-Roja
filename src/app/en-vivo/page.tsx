import type { Metadata } from 'next';
import { EnVivoPageClient } from '@/components/transmision/en-vivo-page-client';

export const metadata: Metadata = {
  title: 'En Vivo — Pasión Roja',
  description: 'Transmisión en vivo. Sigue la acción del deporte en Angol.',
};

export default function EnVivoPage() {
  return <EnVivoPageClient />;
}
