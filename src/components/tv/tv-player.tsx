'use client';

import { useState } from 'react';
import { useTransmision } from '@/hooks/use-transmision';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Play, Monitor } from 'lucide-react';
import { extractYoutubeId } from '@/lib/utils';

export function TVPlayer() {
  const { config, loading } = useTransmision();
  const [showPlayer, setShowPlayer] = useState(false);

  if (loading) return <Skeleton className="aspect-video w-full rounded-2xl" />;
  if (!config || config.estadoTransmision === 'none') return <EmptyState title="Sin transmisión" description="No hay transmisión activa" icon={<Monitor className="h-12 w-12" />} />;

  const youtubeId = config.youtubeLiveId || extractYoutubeId(config.youtubeUrl || '');
  if (!youtubeId) return <EmptyState title="Sin enlace" description="El enlace de YouTube no está configurado" />;

  return (
    <div className="w-full">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
        {showPlayer ? (
          <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`} className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg)] to-black gap-4 cursor-pointer" onClick={() => setShowPlayer(true)}>
            <img src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" loading="lazy" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-2xl shadow-[var(--accent)]/50 animate-pulse-rojo">
                <Play className="h-7 w-7 text-white fill-white ml-1" />
              </div>
              <p className="text-white font-semibold text-lg">Ver Transmisión</p>
            </div>
          </div>
        )}
      </div>
      {config.estadoTransmision === 'en_vivo' && (
        <div className="flex items-center justify-center mt-3"><BadgeEnVivo size="md" /></div>
      )}
    </div>
  );
}
