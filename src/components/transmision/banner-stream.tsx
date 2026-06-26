'use client';

import { useTransmision } from '@/hooks/use-transmision';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Button } from '@/components/ui/button';
import { Play, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export function BannerStream() {
  const { config } = useTransmision();

  if (!config || config.estadoTransmision === 'terminado' || config.estadoTransmision === 'none') return null;

  return (
    <Link
      href="/en-vivo"
      className="block mx-4 mb-4 rounded-xl bg-gradient-to-r from-rojo to-rojo-oscuro p-4 shadow-xl shadow-rojo/25"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {config.estadoTransmision === 'en_vivo' ? (
            <BadgeEnVivo size="lg" />
          ) : (
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">Programado</span>
            </div>
          )}
          <div className="text-white">
            <p className="font-bold text-sm">
              {config.estadoTransmision === 'en_vivo' ? 'Transmisión en vivo' : 'Próxima transmisión'}
            </p>
            {config.programadoPara && (
              <p className="text-xs text-white/70">{formatDate(config.programadoPara)}</p>
            )}
          </div>
        </div>
        <Button variant="secondary" size="sm" className="flex-shrink-0">
          <Play className="h-4 w-4 mr-1" /> Ver
        </Button>
      </div>
    </Link>
  );
}
