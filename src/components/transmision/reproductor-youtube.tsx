'use client';

import { useState } from 'react';
import { useTransmision } from '@/hooks/use-transmision';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Play, Clock, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractYoutubeId } from '@/lib/utils';

export function ReproductorYouTube() {
  const { config, loading } = useTransmision();
  const [showPlayer, setShowPlayer] = useState(false);

  if (loading) {
    return <Skeleton className="aspect-video w-full rounded-2xl" />;
  }

  if (!config || config.estadoTransmision === 'none') {
    return (
      <EmptyState
        title="Sin transmisión activa"
        description="No hay transmisiones en vivo en este momento"
        icon={<Monitor className="h-12 w-12" />}
      />
    );
  }

  const youtubeId = config.youtubeLiveId || extractYoutubeId(config.youtubeUrl || '');

  if (!youtubeId) {
    return (
      <EmptyState
        title="Sin enlace de transmisión"
        description="El enlace de YouTube no está configurado"
        icon={<Monitor className="h-12 w-12" />}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
        {showPlayer ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pizarra to-black gap-4 cursor-pointer" onClick={() => setShowPlayer(true)}>
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt="Thumbnail"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              loading="lazy"
            />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-rojo flex items-center justify-center shadow-2xl shadow-rojo/50 animate-pulse-rojo">
                <Play className="h-7 w-7 text-white fill-white ml-1" />
              </div>
              <p className="text-white font-semibold text-lg">Ver Transmisión</p>
              {config.estadoTransmision === 'programado' && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Programado
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {config.estadoTransmision === 'en_vivo' && (
        <div className="flex items-center justify-center mt-3">
          <BadgeEnVivo size="md" />
        </div>
      )}
    </div>
  );
}
