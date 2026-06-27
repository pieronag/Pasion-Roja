import type { Metadata } from 'next';
import { NoticiasPageClient } from '@/components/noticias/noticias-page-client';

export const metadata: Metadata = {
  title: 'Noticias — Pasión Roja',
  description: 'Últimas noticias deportivas de Angol y la región.',
};

export default function NoticiasPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)] mb-6">
        Noticias <span className="text-[var(--accent)]">Deportivas</span>
      </h1>
      <NoticiasPageClient />
    </div>
  );
}
