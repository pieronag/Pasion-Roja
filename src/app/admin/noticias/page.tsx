'use client';

import { NoticiaForm } from '@/components/admin/noticia-form';

export default function AdminNoticiasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-white">Gestión de Noticias</h1>
      <p className="text-sm text-gray-500">Crea y publica noticias deportivas. Las imágenes se comprimen a WebP automáticamente.</p>
      <NoticiaForm />
    </div>
  );
}
