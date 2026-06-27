import type { Metadata } from 'next';
import { SponsorsPageClient } from '@/components/sponsors/sponsors-page-client';

export const metadata: Metadata = {
  title: 'Sponsors — Pasión Roja',
  description: 'Empresas y marcas que apoyan el deporte en Angol.',
};

export default function SponsorsPage() {
  return <SponsorsPageClient />;
}
