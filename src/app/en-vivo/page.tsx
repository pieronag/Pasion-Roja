import type { Metadata } from 'next';
import { EnVivoPageClient } from '@/components/transmision/en-vivo-page-client';

export const metadata: Metadata = {
  title: 'Transmisión en Vivo',
  description: 'Mira la transmisión en vivo del deporte en Angol.',
};

export default function EnVivoPage() {
  return <EnVivoPageClient />;
}
