'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { Jugador } from '@/types/jugador';
import type { Equipo } from '@/types/equipo';
import { ArrowLeft, Ruler, Weight, Cake, Flag, TrendingUp, Shield, DollarSign, CalendarDays, Zap, Shirt } from 'lucide-react';
import Link from 'next/link';

export function JugadorPageClient({ jugadorId }: { jugadorId: string }) {
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'jugadores', jugadorId)).then((snap) => {
      if (snap.exists()) setJugador({ id: snap.id, ...snap.data() } as Jugador);
      setLoading(false);
    });
  }, [jugadorId]);

  useEffect(() => {
    if (!jugador?.equipoId) return;
    getDoc(doc(db, 'equipos', jugador.equipoId)).then((snap) => {
      if (snap.exists()) setEquipo({ id: snap.id, ...snap.data() } as Equipo);
    });
  }, [jugador?.equipoId]);

  if (loading) return <div className="p-4"><Skeleton className="h-64 w-full rounded-2xl mb-4" /></div>;
  if (!jugador) return <EmptyState title="Jugador no encontrado" />;

  const stats = jugador.estadisticasTemp || {};
  const calcEdad = (fecha: number) => {
    if (!fecha) return '';
    const edad = Math.floor((Date.now() - fecha) / 31557600000);
    return `${edad} años`;
  };
  const fechaDisplay = jugador.fechaNacimiento
    ? new Date(jugador.fechaNacimiento).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
  const primaryColor = equipo?.colorPrimario || '#E11D48';
  const secondaryColor = equipo?.colorSecundario || '#0F172A';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href={`/equipos/${jugador.equipoId}`} className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-4 bg-white/5 backdrop-blur px-2.5 py-1 rounded-lg w-fit">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver al equipo
      </Link>

      {/* Hero card */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] border border-white/10 mb-4">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: primaryColor }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: secondaryColor }} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="relative z-10 p-6">
          <div className="flex flex-col md:flex-row items-center gap-5">
            {/* Jersey number / Photo */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl bg-white/5 backdrop-blur border border-white/10 overflow-hidden flex items-center justify-center shadow-lg">
                {jugador.fotoBase64 ? (
                  <img src={jugador.fotoBase64} alt={jugador.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-white/30">{jugador.numero}</span>
                )}
              </div>
              {jugador.numero > 0 && !jugador.fotoBase64 && (
                <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg border-2 border-[#1a1a2e]" style={{ backgroundColor: primaryColor }}>
                  {jugador.numero}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border text-white" style={{ backgroundColor: `${primaryColor}40`, borderColor: `${primaryColor}60` }}>
                  {jugador.posicion}
                </span>
                {equipo && (
                  <Link href={`/equipos/${equipo.id}`} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 hover:text-white hover:border-white/30 transition-colors">
                    {equipo.logoBase64 ? <img src={equipo.logoBase64} alt="" className="w-3.5 h-3.5 object-contain logo-img" /> : <Shirt className="h-3 w-3" />}
                    {equipo.nombre}
                  </Link>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-black font-display text-white drop-shadow-lg">
                {jugador.nombre} {jugador.apellido}
              </h1>
              {equipo && (
                <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-xs text-white/50">
                  <span className="flex items-center gap-1"><Shirt className="h-3 w-3" />#{jugador.numero || '—'}</span>
                  <span className="flex items-center gap-1"><Flag className="h-3 w-3" />{jugador.nacionalidad}</span>
                  {jugador.fechaNacimiento > 0 && <span className="flex items-center gap-1"><Cake className="h-3 w-3" />{calcEdad(jugador.fechaNacimiento)}</span>}
                </div>
              )}
            </div>

            {/* Stats highlight */}
            {Object.keys(stats).length > 0 && (
              <div className="flex gap-3 flex-shrink-0">
                {Object.entries(stats).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="text-center px-4 py-2 rounded-xl bg-white/5 backdrop-blur border border-white/10">
                    <p className="text-2xl md:text-3xl font-black font-display text-white drop-shadow-lg">{value}</p>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">{key}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info cards in 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Physical info */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
          <div className="px-4 py-2.5 border-b border-white/10 bg-white/5">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5 text-[var(--accent)]" /> Datos Fisicos</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-lg font-black text-white">{jugador.altura ? `${jugador.altura} cm` : '—'}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Altura</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-lg font-black text-white">{jugador.peso ? `${jugador.peso} kg` : '—'}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Peso</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-lg font-black text-white">{jugador.pie || '—'}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Pie habil</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-lg font-black text-white">{fechaDisplay}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Nacimiento</p>
            </div>
          </div>
        </div>

        {/* Right: Contract/Value */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
          <div className="px-4 py-2.5 border-b border-white/10 bg-white/5">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-[var(--accent)]" /> Contrato y Valor</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-lg font-black text-white">{jugador.valorMercado || '—'}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Valor mercado</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-lg font-black text-white">{jugador.fichado || '—'}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Fichado</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-lg font-black text-white">{jugador.contratoHasta || '—'}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Contrato hasta</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-lg font-black text-white">{jugador.nacionalidad}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Nacionalidad</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full stats section */}
      {Object.keys(stats).length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
          <div className="px-4 py-2.5 border-b border-white/10 bg-white/5">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-[var(--accent)]" /> Estadisticas {jugador.temporadaActual}</h3>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="text-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <p className="text-3xl md:text-4xl font-black font-display text-white drop-shadow-lg">{value}</p>
                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">{key}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
