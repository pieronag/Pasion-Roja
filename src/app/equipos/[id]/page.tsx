import type { Metadata } from 'next';
import { EquipoPageClient } from '@/components/equipos/equipo-page-client';

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Equipo — Pasión Roja` };
}

export default async function EquipoPage({ params }: Props) {
  const { id } = await params;
  return <EquipoPageClient equipoId={id} />;
}
