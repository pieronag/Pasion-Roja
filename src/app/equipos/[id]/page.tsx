import type { Metadata } from 'next';
import { EquipoPageClient } from '@/components/equipos/equipo-page-client';
import { extractIdFromSlug } from '@/lib/utils';

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Equipo — Pasión Roja` };
}

export default async function EquipoPage({ params }: Props) {
  const { id } = await params;
  const equipoId = extractIdFromSlug(id);
  return <EquipoPageClient equipoId={equipoId} />;
}
