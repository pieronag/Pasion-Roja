'use client';
import { NoticiaForm } from '@/components/admin/noticia-form';

export default function AdminNoticiasPage() {
  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-[var(--text)]">Gestión de Noticias</h2><p className="text-sm text-[var(--text-secondary)]">Crea y publica noticias deportivas</p></div>
      <NoticiaForm />
    </div>
  );
}
