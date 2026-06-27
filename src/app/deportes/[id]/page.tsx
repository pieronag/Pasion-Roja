import type { Metadata } from 'next';
import { DeportePageClient } from '@/components/deportes/deporte-page-client';

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Deporte — Pasión Roja`, description: `Información del deporte` };
}

export default async function DeportePage({ params }: Props) {
  const { id } = await params;
  return <DeportePageClient deporteId={id} />;
}
