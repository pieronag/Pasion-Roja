'use client';

import { MarcadorEnVivo } from '@/components/partido/marcador-en-vivo';
import { ReproductorYouTube } from '@/components/transmision/reproductor-youtube';
import { ListaNoticias } from '@/components/noticias/lista-noticias';
import { LiveTimeline } from '@/components/partido/live-timeline';
import { ReaccionesRapidas } from '@/components/partido/reacciones-rapidas';
import { useTransmision } from '@/hooks/use-transmision';

export function Hero() {
  const { config } = useTransmision();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-rojo/20 via-pizarra to-pizarra pt-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center px-4 mb-6">
            <h1 className="text-3xl md:text-5xl font-black font-display text-white leading-tight">
              LA PASIÓN DEL <span className="text-rojo">DEPORTE</span>
              <br />
              EN <span className="text-rojo">ANGOL</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
              Marcadores en vivo, noticias y transmisiones — todo para el hincha de la zona
            </p>
          </div>

          <MarcadorEnVivo />

          {config?.estadoTransmision === 'en_vivo' && (
            <div className="max-w-2xl mx-auto px-4 mt-4">
              <ReproductorYouTube />
            </div>
          )}
        </div>
      </section>

      {config?.estadoTransmision === 'en_vivo' && (
        <section className="max-w-2xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-pizarra-claro rounded-2xl overflow-hidden">
            <LiveTimeline />
            <ReaccionesRapidas />
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white font-display tracking-tight">Últimas Noticias</h2>
        </div>
        <ListaNoticias />
      </section>
    </>
  );
}
