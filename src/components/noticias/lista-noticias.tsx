'use client';

import { useNoticias } from '@/hooks/use-noticias';
import { CardNoticia } from './card-noticia';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Newspaper } from 'lucide-react';

export function ListaNoticias() {
  const { noticias, loading, error } = useNoticias(12);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <Skeleton className="aspect-[16/9] w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Error al cargar" description={error} icon={<Newspaper />} />;
  }

  if (noticias.length === 0) {
    return <EmptyState title="Sin noticias" description="No hay noticias publicadas aún" icon={<Newspaper />} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {noticias.map((noticia, i) => (
        <div key={noticia.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
          <CardNoticia noticia={noticia} />
        </div>
      ))}
    </div>
  );
}
