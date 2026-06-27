'use client';

import { useMultimedia } from '@/hooks/use-multimedia';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Image } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function MultimediaPageClient() {
  const { items, loading } = useMultimedia();
  const [selected, setSelected] = useState<string | null>(null);

  if (loading) return <div className="p-4 max-w-7xl mx-auto"><Loader /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Image className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]">Multimedia</h1>
      </div>
      {items.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <button key={item.id} onClick={() => setSelected(item.id)} className="group relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]">
              {item.base64 ? <img src={item.base64} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full bg-gradient-to-br from-[var(--accent-light)] to-[var(--bg-secondary)] flex items-center justify-center"><Image className="h-8 w-8 text-[var(--text-muted)]" /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2"><p className="text-xs text-white font-medium truncate">{item.titulo}</p></div>
            </button>
          ))}
        </div>
      ) : <EmptyState title="Sin contenido multimedia" />}
    </div>
  );
}
