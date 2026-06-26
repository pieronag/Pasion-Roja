'use client';

import { useState, useRef, useEffect } from 'react';
import { useComentarios } from '@/hooks/use-comentarios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/shared/scroll-area';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Send, MessageCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export function ComentariosEnVivo({ partidoId = 'actual' }: { partidoId?: string }) {
  const { comentarios, loading, enviarComentario } = useComentarios(partidoId);
  const [texto, setTexto] = useState('');
  const [usuario] = useState(() => `Hincha_${Math.random().toString(36).slice(2, 6)}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comentarios]);

  const handleEnviar = async () => {
    if (!texto.trim()) return;
    await enviarComentario(usuario, texto.trim());
    setTexto('');
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Comentarios en Vivo
      </h3>

      <ScrollArea ref={scrollRef} className="h-64 mb-3 rounded-xl border border-pizarra-claro p-3">
        {loading ? (
          <Loader size="sm" />
        ) : comentarios.length === 0 ? (
          <EmptyState title="Sin comentarios" description="Sé el primero en comentar" icon={<MessageCircle className="h-8 w-8" />} />
        ) : (
          <div className="space-y-2">
            {comentarios.map((c) => (
              <div key={c.id} className="animate-slide-up p-2 rounded-lg bg-pizarra-claro/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-rojo">{c.usuario}</span>
                  <span className="text-[10px] text-gray-600">{formatRelativeTime(c.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-300 mt-0.5">{c.texto}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <form
        onSubmit={(e) => { e.preventDefault(); handleEnviar(); }}
        className="flex gap-2"
      >
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1"
          maxLength={200}
        />
        <Button type="submit" size="icon" disabled={!texto.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
