'use client';

import { usePathname } from 'next/navigation';
import { Zap, Heart, Globe, MessageCircle, AtSign } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] py-8 px-4 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-black mb-2">
            <Zap className="h-5 w-5 text-[var(--accent)] fill-[var(--accent)]" />
            <span className="text-[var(--text)]">PASIÓN <span className="text-[var(--accent)]">ROJA</span></span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">La plataforma deportiva de Angol.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Secciones</h4>
          <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
            <Link href="/deportes" className="hover:text-[var(--accent)]">Deportes</Link>
            <Link href="/noticias" className="hover:text-[var(--accent)]">Noticias</Link>
            <Link href="/radio" className="hover:text-[var(--accent)]">Radio Online</Link>
            <Link href="/tv" className="hover:text-[var(--accent)]">TV Online</Link>
            <Link href="/sponsors" className="hover:text-[var(--accent)]">Sponsors</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Síguenos</h4>
          <div className="flex gap-3">
            <a href="#" className="p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"><Globe className="h-5 w-5" /></a>
            <a href="#" className="p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"><MessageCircle className="h-5 w-5" /></a>
            <a href="#" className="p-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"><AtSign className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)] flex items-center justify-center gap-1">
        Hecho con <Heart className="h-3.5 w-3.5 text-[var(--accent)] fill-[var(--accent)]" /> para Angol
      </div>
    </footer>
  );
}
