'use client';

import { ContactForm } from './contact-form';
import { MessageCircle, Mail, MapPin } from 'lucide-react';

export function ContactoPageClient() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-6 w-6 text-[var(--accent)]" />
        <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text)]">Contacto</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContactForm />
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <h3 className="font-bold text-[var(--text)] mb-2">Información</h3>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Angol, Región de La Araucanía, Chile</p>
              <p className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp: +56 9 1234 5678</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> contacto@pasionroja.cl</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
            <h3 className="font-bold text-[var(--text)] mb-2">Redes Sociales</h3>
            <p className="text-sm text-[var(--text-secondary)]">Síguenos en Instagram, Facebook y Twitter para estar al tanto de todas las novedades.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
