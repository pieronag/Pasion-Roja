'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import type { Noticia } from '@/types/noticia';
import { Calendar, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const categoriaColores: Record<string, string> = {
  partido: 'bg-rojo text-white',
  torneo: 'bg-dorado text-black',
  entrevista: 'bg-verde-cancha text-white',
  general: 'bg-pizarra-claro text-gray-300',
};

export function CardNoticia({ noticia }: { noticia: Noticia }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/noticias/${noticia.id}`}>
      <article className="group rounded-xl border border-pizarra-claro bg-pizarra-claro/30 hover:bg-pizarra-claro/60 transition-all duration-300 overflow-hidden hover:border-rojo/30 hover:shadow-lg hover:shadow-rojo/5">
        {(noticia.imgFullBase64 || noticia.miniBase64) && !imgError ? (
          <div className="aspect-[16/9] overflow-hidden bg-pizarra">
            <img
              src={noticia.imgFullBase64 || noticia.miniBase64}
              alt={noticia.titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-rojo/20 to-pizarra flex items-center justify-center">
            <span className="font-display text-4xl text-rojo/30 font-black">PR</span>
          </div>
        )}

        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={cn('text-[10px]', categoriaColores[noticia.categoria])}>
              {noticia.categoria.toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatRelativeTime(noticia.createdAt)}
            </span>
          </div>

          <h3 className="font-bold text-base text-white leading-tight line-clamp-2 group-hover:text-rojo transition-colors">
            {noticia.titulo}
          </h3>

          {noticia.resumen && (
            <p className="text-sm text-gray-400 line-clamp-2">{noticia.resumen}</p>
          )}

          <div className="flex items-center gap-1 text-rojo text-sm font-medium pt-1">
            Leer más <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}
