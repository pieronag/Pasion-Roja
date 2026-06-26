'use client';

import { useTransmision } from '@/hooks/use-transmision';
import { BadgeEnVivo } from '@/components/shared/badge-en-vivo';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function IndicadorEnVivo() {
  const { config, loading } = useTransmision();

  if (loading || !config) return null;

  if (config.estadoTransmision === 'en_vivo') {
    return <BadgeEnVivo size="sm" />;
  }

  if (config.estadoTransmision === 'programado' && config.programadoPara) {
    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        {formatDate(config.programadoPara)}
      </Badge>
    );
  }

  return null;
}
