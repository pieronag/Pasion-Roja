import type { Metadata } from 'next';
import { NoticiaDetailClient } from '@/components/noticias/noticia-detail-client';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Noticia',
    description: `Detalle de noticia`,
  };
}

export default async function NoticiaDetailPage({ params }: Props) {
  const { id } = await params;
  return <NoticiaDetailClient id={id} />;
}
