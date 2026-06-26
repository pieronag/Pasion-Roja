'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, Share2, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Noticia } from '@/types/noticia';

const categoriaColores: Record<string, string> = {
  partido: 'bg-rojo text-white',
  torneo: 'bg-dorado text-black',
  entrevista: 'bg-verde-cancha text-white',
  general: 'bg-pizarra-claro text-gray-300',
};

export function DetalleNoticia({ id }: { id: string }) {
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'noticias', id)).then((snap) => {
      if (snap.exists()) {
        setNoticia({ id: snap.id, ...snap.data() } as Noticia);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: noticia?.titulo, url: window.location.href });
    }
  };

  const handleSpeak = () => {
    if (!noticia) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(noticia.cuerpo.replace(/<[^>]*>/g, ''));
    utterance.lang = 'es-CL';
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  if (loading) return <div className="p-4 max-w-3xl mx-auto"><Skeleton className="h-64 w-full rounded-2xl mb-4" /><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2 mb-6" /><Skeleton className="h-96 w-full" /></div>;
  if (!noticia) return <EmptyState title="Noticia no encontrada" description="La noticia que buscas no existe" />;

  return (
    <article className="max-w-3xl mx-auto p-4">
      <Link href="/noticias" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a noticias
      </Link>

      {noticia.imgFullBase64 && !imgError ? (
        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-6 bg-pizarra">
          <img src={noticia.imgFullBase64} alt={noticia.titulo} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        </div>
      ) : (
        <div className="aspect-[16/9] rounded-2xl mb-6 bg-gradient-to-br from-rojo/20 to-pizarra flex items-center justify-center">
          <span className="font-display text-6xl text-rojo/20 font-black">PR</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Badge className={cn('text-xs', categoriaColores[noticia.categoria])}>{noticia.categoria}</Badge>
        <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(noticia.createdAt)}</span>
      </div>

      <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 font-display">
        {noticia.titulo}
      </h1>

      {noticia.resumen && (
        <p className="text-lg text-gray-400 mb-6 leading-relaxed">{noticia.resumen}</p>
      )}

      <div className="flex gap-2 mb-8">
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-1.5" /> Compartir
        </Button>
        <Button variant="secondary" size="sm" onClick={handleSpeak}>
          <Volume2 className={cn('h-4 w-4 mr-1.5', speaking && 'text-rojo')} />
          {speaking ? 'Detener' : 'Escuchar'}
        </Button>
      </div>

      <div
        className="prose prose-invert prose-headings:text-white prose-a:text-rojo prose-strong:text-white prose-li:text-gray-300 max-w-none leading-relaxed text-gray-300"
        dangerouslySetInnerHTML={{ __html: noticia.cuerpo }}
      />
    </article>
  );
}
