'use client';

import { MarcadorEnVivo } from './marcador-en-vivo';
import { LiveTimeline } from './live-timeline';
import { ReaccionesRapidas } from './reacciones-rapidas';
import { ComentariosEnVivo } from './comentarios-en-vivo';
import { useWakeLock } from '@/hooks/use-wake-lock';
import { Swords, MessageCircle } from 'lucide-react';

export function PartidoPageClient() {
  useWakeLock(true);

  return (
    <div className="pb-8">
      <section className="pt-4">
        <MarcadorEnVivo />
      </section>

      <section className="max-w-2xl mx-auto px-4 mt-6">
        <div className="border border-pizarra-claro rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-pizarra-claro">
            <Swords className="h-4 w-4 text-rojo" />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Acción del Partido</h2>
          </div>
          <LiveTimeline />
          <ReaccionesRapidas />
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 mt-6">
        <div className="border border-pizarra-claro rounded-2xl overflow-hidden">
          <ComentariosEnVivo />
        </div>
      </section>
    </div>
  );
}
