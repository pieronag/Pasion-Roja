'use client';

import { Button } from '@/components/ui/button';
import { Radio, Tv, Goal, Newspaper, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActionsBar() {
  const router = useRouter();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button onClick={() => router.push('/admin/transmision')} variant="default" size="sm" className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
        <Radio className="h-4 w-4 mr-1" /> Iniciar Radio
      </Button>
      <Button onClick={() => router.push('/admin/transmision')} variant="default" size="sm" className="whitespace-nowrap">
        <Tv className="h-4 w-4 mr-1" /> Iniciar TV
      </Button>
      <Button onClick={() => router.push('/admin/marcador')} variant="secondary" size="sm" className="whitespace-nowrap">
        <Goal className="h-4 w-4 mr-1" /> Gol Rápido
      </Button>
      <Button onClick={() => router.push('/admin/noticias')} variant="secondary" size="sm" className="whitespace-nowrap">
        <Newspaper className="h-4 w-4 mr-1" /> Nueva Noticia
      </Button>
      <Button onClick={() => router.push('/admin/partidos')} variant="secondary" size="sm" className="whitespace-nowrap">
        <Plus className="h-4 w-4 mr-1" /> Nuevo Partido
      </Button>
    </div>
  );
}
