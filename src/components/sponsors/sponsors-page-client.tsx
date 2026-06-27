'use client';

import { SponsorsGrid } from './sponsors-grid';
import { HeartHandshake } from 'lucide-react';

export function SponsorsPageClient() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <HeartHandshake className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]">Nuestros <span className="text-[var(--accent)]">Sponsors</span></h1>
      </div>
      <p className="text-[var(--text-secondary)] mb-6">Empresas y marcas que hacen posible Pasión Roja</p>
      <SponsorsGrid />
    </div>
  );
}
