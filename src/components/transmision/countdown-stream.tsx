'use client';

import { useState, useEffect } from 'react';
import { useTransmision } from '@/hooks/use-transmision';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export function CountdownStream() {
  const { config } = useTransmision();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!config?.programadoPara) return;
    const update = () => {
      const diff = config.programadoPara! - Date.now();
      if (diff <= 0) { setTimeLeft('Comenzando...'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [config?.programadoPara]);

  if (!config?.programadoPara || config.estadoTransmision === 'en_vivo') return null;

  return (
    <Badge variant="warning" className="flex items-center gap-1">
      <Clock className="h-3 w-3" /> {timeLeft}
    </Badge>
  );
}
