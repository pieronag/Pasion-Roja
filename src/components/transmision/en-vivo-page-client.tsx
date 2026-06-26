'use client';

import { ReproductorYouTube } from './reproductor-youtube';
import { CountdownStream } from './countdown-stream';
import { useTransmision } from '@/hooks/use-transmision';
import { Loader } from '@/components/shared/loader';
import { Radio, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function EnVivoPageClient() {
  const { config, loading } = useTransmision();

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader size="lg" text="Cargando transmisión..." /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Radio className="h-6 w-6 text-rojo" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-white">
          Transmisión <span className="text-rojo">en Vivo</span>
        </h1>
        <CountdownStream />
      </div>

      <ReproductorYouTube />

      {config?.programadoPara && config.estadoTransmision === 'programado' && (
        <div className="mt-4 p-4 rounded-xl bg-pizarra-claro/50 border border-pizarra-claro flex items-center gap-3">
          <Calendar className="h-5 w-5 text-dorado" />
          <div>
            <p className="text-sm font-medium text-white">Próxima transmisión programada</p>
            <p className="text-xs text-gray-400">{formatDate(config.programadoPara)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
