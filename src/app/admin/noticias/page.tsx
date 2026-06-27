'use client';
import { NoticiaForm } from '@/components/admin/noticia-form';

export default function AdminNoticiasPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-[var(--text)]">Gestión de Noticias</h1><p className="text-sm text-[var(--text-secondary)]">Crea y publica noticias deportivas.</p></div>
      <NoticiaForm />
    </div>
  );
}
