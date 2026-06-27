import type { Metadata } from 'next';
import { ContactoPageClient } from '@/components/contacto/contacto-page-client';

export const metadata: Metadata = {
  title: 'Contacto — Pasión Roja',
  description: 'Contáctanos. Envíanos tus sugerencias, saludos o contenido.',
};

export default function ContactoPage() {
  return <ContactoPageClient />;
}
