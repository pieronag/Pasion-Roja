import type { Metadata } from 'next';
import { PartidoDetailClient } from '@/components/partidos/partido-detail-client';

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Partido — Pasión Roja` };
}

export default async function PartidoDetailPage({ params }: Props) {
  const { id } = await params;
  return <PartidoDetailClient partidoId={id} />;
}
