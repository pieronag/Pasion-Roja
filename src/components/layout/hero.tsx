'use client';

import { MarcadorEnVivo } from '@/components/partido/marcador-en-vivo';
import { ListaNoticias } from '@/components/noticias/lista-noticias';
import { SportsTicker } from '@/components/shared/sports-ticker';
import { LiveNowBar } from '@/components/shared/live-now-bar';
import { DeportesGrid } from '@/components/deportes/deportes-grid';
import { ClubesDestacados } from '@/components/clubes/clubes-destacados';
import { SponsorsGrid } from '@/components/sponsors/sponsors-grid';
import { useTransmision } from '@/hooks/use-transmision';

export function Hero() {
  const { config } = useTransmision();

  return (
    <>
      <SportsTicker />
      {config?.estadoTransmision === 'en_vivo' && <LiveNowBar tipo="tv" />}

      {/* Hero with wallpaper background */}
      <section className="relative overflow-hidden pt-4 pb-8">
        {/* Wallpaper background */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/wallpaper.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Red gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/70 via-[var(--accent)]/40 to-[var(--bg)]" />
          {/* Bottom blur/diffuse effect */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[var(--bg)]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center px-4 mb-6 pt-8 md:pt-12">
            <h1 className="text-3xl md:text-5xl font-black font-display text-white leading-tight drop-shadow-lg">
              LA PASIÓN DEL <span className="text-white">DEPORTE</span>
              <br />
              EN <span className="text-white">ANGOL</span>
            </h1>
            <p className="text-white/80 mt-2 text-sm max-w-md mx-auto drop-shadow">
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

      <ClubesDestacados />

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
