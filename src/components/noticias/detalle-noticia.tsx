'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { ArrowLeft, Calendar, Share2, Volume2, Newspaper, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Noticia } from '@/types/noticia';
import { useNoticias } from '@/hooks/use-noticias';

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
  const { noticias: ultimasNoticias } = useNoticias(8);

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
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const getLatinVoice = (): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    const langs = ['es-MX', 'es-AR', 'es-CL', 'es-CO', 'es-PE', 'es-US', 'es-LA'];
    for (const lang of langs) {
      const match = voices.find((v) => v.lang.startsWith(lang) && v.localService);
      if (match) return match;
    }
    for (const lang of langs) {
      const match = voices.find((v) => v.lang.startsWith(lang));
      if (match) return match;
    }
    return null;
  };

  const handleSpeak = () => {
    if (!noticia) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const text = noticia.cuerpo.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(text);
    const latinVoice = getLatinVoice();
    if (latinVoice) {
      utterance.voice = latinVoice;
    } else {
      utterance.lang = 'es-CL';
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  if (loading) return <div className="p-4 max-w-3xl mx-auto"><Skeleton className="h-64 w-full rounded-2xl mb-4" /><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2 mb-6" /><Skeleton className="h-96 w-full" /></div>;
  if (!noticia) return <EmptyState title="Noticia no encontrada" description="La noticia que buscas no existe" />;

  const ultimasFiltradas = ultimasNoticias.filter((n) => n.id !== id).slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      {/* Sidebar - Ultimas Noticias */}
      <aside className="order-1 lg:order-none">
        <Link href="/noticias" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors lg:hidden">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <div className="sticky top-20">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-bold text-[var(--text)] tracking-tight">&Uacute;ltimas <span className="text-[var(--accent)]">Noticias</span></h2>
          </div>
          <div className="space-y-1">
            {ultimasFiltradas.slice(0, 6).map((n) => (
              <Link key={n.id} href={`/noticias/${n.id}`}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors group">
                <ChevronRight className="h-3 w-3 text-[var(--accent)] mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--text)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                    {n.titulo}
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)]">{formatRelativeTime(n.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/noticias"
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline mt-3">
            Ver todas <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <article className="order-2 lg:order-none">
        <Link href="/noticias" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors hidden lg:inline-flex">
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
          <Badge className={cn('text-xs', categoriaColores[noticia.categoria])}>{noticia.categoria.toUpperCase()}</Badge>
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
    </div>
  );
}
