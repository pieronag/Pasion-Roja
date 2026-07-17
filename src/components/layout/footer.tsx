'use client';

import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { useSponsors } from '@/hooks/use-sponsors';

export function Footer() {
  const pathname = usePathname();
  const { sponsors } = useSponsors();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] py-8 px-4 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-black mb-1">
            <Zap className="h-5 w-5 text-[var(--accent)] fill-[var(--accent)]" />
            <span className="text-[var(--text)]">PASIÓN <span className="text-[var(--accent)]">ROJA</span></span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Pasi&oacute;n Roja&hellip; Pasi&oacute;n, pero de verdad.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Radio &middot; TV &middot; Marcadores en vivo &middot; Noticias</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Secciones</h4>
          <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
            <Link href="/noticias" className="hover:text-[var(--accent)]">Noticias</Link>
            <Link href="/radio" className="hover:text-[var(--accent)]">Radio Online</Link>
            <Link href="/tv" className="hover:text-[var(--accent)]">TV Online</Link>
            <Link href="/contacto" className="hover:text-[var(--accent)]">Contacto</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--text)] mb-3">S&iacute;guenos</h4>
          <div className="flex gap-3">
            <a href="https://www.facebook.com/teleangolcl" target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-hover)] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
               aria-label="Facebook">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 3.79086 3.79086 2 6 2H18C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18V6ZM6 4C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H12V13H11C10.4477 13 10 12.5523 10 12C10 11.4477 10.4477 11 11 11H12V9.5C12 7.567 13.567 6 15.5 6H16.1C16.6523 6 17.1 6.44772 17.1 7C17.1 7.55228 16.6523 8 16.1 8H15.5C14.6716 8 14 8.67157 14 9.5V11H16.1C16.6523 11 17.1 11.4477 17.1 12C17.1 12.5523 16.6523 13 16.1 13H14V20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6Z"/>
              </svg>
            </a>
            <a href="https://wa.me/56979510059" target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-hover)] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
               aria-label="WhatsApp">
              <svg viewBox="0 0 16 16" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.42 9.49c-.19-.09-1.1-.54-1.27-.61s-.29-.09-.42.1-.48.6-.59.73-.21.14-.4 0a5.13 5.13 0 0 1-1.49-.92 5.25 5.25 0 0 1-1-1.29c-.11-.18 0-.28.08-.38s.18-.21.28-.32a1.39 1.39 0 0 0 .18-.31.38.38 0 0 0 0-.33c0-.09-.42-1-.58-1.37s-.3-.32-.41-.32h-.4a.72.72 0 0 0-.5.23 2.1 2.1 0 0 0-.65 1.55A3.59 3.59 0 0 0 5 8.2 8.32 8.32 0 0 0 8.19 11c.44.19.78.3 1.05.39a2.53 2.53 0 0 0 1.17.07 1.93 1.93 0 0 0 1.26-.88 1.67 1.67 0 0 0 .11-.88c-.05-.07-.17-.12-.36-.21z"/>
                <path d="M13.29 2.68A7.36 7.36 0 0 0 8 .5a7.44 7.44 0 0 0-6.41 11.15l-1 3.85 3.94-1a7.4 7.4 0 0 0 3.55.9H8a7.44 7.44 0 0 0 5.29-12.72zM8 14.12a6.12 6.12 0 0 1-3.15-.87l-.22-.13-2.34.61.62-2.28-.14-.23a6.18 6.18 0 0 1 9.6-7.65 6.12 6.12 0 0 1 1.81 4.37A6.19 6.19 0 0 1 8 14.12z"/>
              </svg>
            </a>
            <a href="https://youtube.com/@teleangol" target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-hover)] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
               aria-label="YouTube">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://twitch.com/teleangol" target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-hover)] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
               aria-label="Twitch">
              <svg viewBox="0 0 16 16" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 1L2 3.5v9h3V15l2.5-2.5h2L14 8V1H4.5zM13 7.5l-2 2H9l-1.75 1.75V9.5H5V2h8v5.5z"/>
                <path d="M11.5 3.75h-1v3h1v-3zM8.75 3.75h-1v3h1v-3z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-[var(--border)]">
          <p className="text-center text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Sponsors</p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {sponsors.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                 className="opacity-60 hover:opacity-100 transition-opacity">
                {s.logoBase64 ? (
                  <img src={s.logoBase64} alt={s.nombre} className="h-8 md:h-10 object-contain" />
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">{s.nombre}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-[var(--border)]">
        <p className="text-center text-xs text-[var(--text-muted)]">
          Dise&ntilde;ado por <a href="https://oriontechnology.cl/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Orion Technology</a>
        </p>
        <p className="text-center text-[10px] text-[var(--text-muted)] mt-1">
          &copy; {new Date().getFullYear()} Pasi&oacute;n Roja. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
