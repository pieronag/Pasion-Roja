'use client';

import { MarcadorEnVivo } from '@/components/partido/marcador-en-vivo';
import { ReproductorYouTube } from '@/components/transmision/reproductor-youtube';
import { ListaNoticias } from '@/components/noticias/lista-noticias';
import { SportsTicker } from '@/components/shared/sports-ticker';
import { LiveNowBar } from '@/components/shared/live-now-bar';
import { DeportesGrid } from '@/components/deportes/deportes-grid';
import { SponsorsGrid } from '@/components/sponsors/sponsors-grid';
import { useTransmision } from '@/hooks/use-transmision';

export function Hero() {
  const { config } = useTransmision();

  return (
    <>
      <SportsTicker />
      {config?.estadoTransmision === 'en_vivo' && <LiveNowBar tipo="tv" />}

      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--accent)]/5 via-[var(--bg)] to-[var(--bg)] pt-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center px-4 mb-6">
            <h1 className="text-3xl md:text-5xl font-black font-display text-[var(--text)] leading-tight">
              LA PASIÓN DEL <span className="text-[var(--accent)]">DEPORTE</span>
              <br />
              EN <span className="text-[var(--accent)]">ANGOL</span>
            </h1>
            <p className="text-[var(--text-secondary)] mt-2 text-sm max-w-md mx-auto">
              Radio · TV · Marcadores en vivo · Noticias — Todo para el hincha
            </p>
          </div>
          <MarcadorEnVivo />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold font-display text-[var(--text)] mb-4 tracking-tight">
          <span className="text-[var(--accent)]">DEPORTES</span>
        </h2>
        <DeportesGrid />
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-display text-[var(--text)] tracking-tight">
            Últimas <span className="text-[var(--accent)]">Noticias</span>
          </h2>
        </div>
        <ListaNoticias />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold font-display text-[var(--text)] mb-4 tracking-tight">
          <span className="text-[var(--accent)]">Sponsors</span>
        </h2>
        <SponsorsGrid />
      </section>
    </>
  );
}
