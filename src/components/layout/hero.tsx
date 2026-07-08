'use client';

import { MarcadorEnVivo } from '@/components/partido/marcador-en-vivo';
import { ListaNoticias } from '@/components/noticias/lista-noticias';
import { LiveNowBar } from '@/components/shared/live-now-bar';
import { WhatsAppFloat } from '@/components/shared/whatsapp-float';
import { useTransmision } from '@/hooks/use-transmision';
import { useDeportes } from '@/hooks/use-deportes';
import { usePosiciones } from '@/hooks/use-posiciones';
import { useEquiposMap } from '@/hooks/use-equipos-map';
import { LeagueTable } from '@/components/posiciones/league-table';
import Link from 'next/link';
import { Trophy, ArrowRight, Star, Shield, MapPin, Calendar, Users, Shirt, Building2, Award, ExternalLink } from 'lucide-react';

export function Hero() {
  const { config } = useTransmision();
  const { deportes } = useDeportes();
  const futbol = deportes.find((d) => d.nombre === 'F\u00fatbol');
  const { tabla, loading: tablaLoading } = usePosiciones(futbol?.id || '');
  const { equiposMap } = useEquiposMap();
  const equipoPrincipal = Object.values(equiposMap).find((e) => e.esPrincipal);

  return (
    <>
      {config?.estadoTransmision === 'en_vivo' && <LiveNowBar tipo="tv" />}

      {/* Hero with wallpaper background */}
      <section className="relative overflow-hidden pt-0 pb-10">
        {/* Wallpaper background */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/wallpaper.jpg"
            alt=""
            className="w-full h-full object-cover"
            sizes="100vw"
            fetchPriority="high"
          />
          {/* Red gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/70 via-[var(--accent)]/40 to-[var(--bg)]" />
          {/* Bottom blur/diffuse effect */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[var(--bg)]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center px-4 pt-6 md:pt-10 mb-2">
            <h1 className="text-3xl md:text-5xl font-black font-display text-white leading-tight drop-shadow-lg">
              Pasi&oacute;n Roja&hellip; Pasi&oacute;n, pero de verdad.
            </h1>
            <p className="text-white/70 mt-1 text-xs md:text-sm max-w-lg mx-auto drop-shadow">
              Sigue el marcador en vivo, las &uacute;ltimas noticias y la tabla de posiciones de tu equipo.
            </p>
          </div>
          <MarcadorEnVivo />
        </div>
      </section>

      {/* Club info - principal team */}
      {equipoPrincipal && (
        <section className="max-w-7xl mx-auto px-4 pt-4 pb-1">
          <div className="rounded-[var(--radius)] border border-yellow-500/30 bg-yellow-500/[0.04] p-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {equipoPrincipal.logoBase64 ? (
                <img src={equipoPrincipal.logoBase64} alt="" className="w-20 h-20 md:w-24 md:h-24 object-contain logo-img flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-10 w-10 text-yellow-600" />
                </div>
              )}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl md:text-2xl font-black text-[var(--text)]">{equipoPrincipal.nombre}</h3>
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                </div>
                <p className="text-sm font-semibold text-[var(--accent)] mt-0.5">{futbol?.nombre || 'F\u00fatbol'}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-3">
                  {equipoPrincipal.ciudad && (
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                      {equipoPrincipal.ciudad}{equipoPrincipal.region ? `, ${equipoPrincipal.region}` : ''}
                    </p>
                  )}
                  {equipoPrincipal.estadio && (
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                      {equipoPrincipal.estadio}{equipoPrincipal.capacidad ? ` (${equipoPrincipal.capacidad.toLocaleString('es-CL')} pers.)` : ''}
                    </p>
                  )}
                  {equipoPrincipal.fundacion && (
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                      Fundado en {equipoPrincipal.fundacion}
                    </p>
                  )}
                  {equipoPrincipal.entrenador && (
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                      DT: {equipoPrincipal.entrenador}
                    </p>
                  )}
                  {equipoPrincipal.proveedor && (
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Shirt className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                      {equipoPrincipal.proveedor}
                    </p>
                  )}
                  {equipoPrincipal.auspiciador && (
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
                      {equipoPrincipal.auspiciador}
                    </p>
                  )}
                </div>

                {equipoPrincipal.redes?.facebook && (
                  <a href={equipoPrincipal.redes.facebook} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 mt-2 text-xs text-[var(--accent)] hover:underline">
                    <ExternalLink className="h-3 w-3" /> Sitio web del club
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full football standings table */}
      {futbol && !tablaLoading && tabla.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-[var(--text)] tracking-tight flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[var(--accent)]" />
              <span className="text-[var(--accent)]">F&uacute;tbol</span>
              <span className="text-[var(--text)]">— Tabla de Posiciones</span>
            </h2>
            <Link
              href="/posiciones"
              className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1 flex-shrink-0"
            >
              Ver temporada completa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <LeagueTable
            equipos={tabla}
            equipoPrincipalId={equipoPrincipal?.id}
          />
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-display text-[var(--text)] tracking-tight">
            &Uacute;ltimas <span className="text-[var(--accent)]">Noticias</span>
          </h2>
        </div>
        <ListaNoticias />
      </section>

      <WhatsAppFloat />
    </>
  );
}
