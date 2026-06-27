import type { Metadata } from 'next';
import { JugadorPageClient } from '@/components/jugadores/jugador-page-client';

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Jugador — Pasión Roja` };
}

export default async function JugadorPage({ params }: Props) {
  const { id } = await params;
  return <JugadorPageClient jugadorId={id} />;
}
