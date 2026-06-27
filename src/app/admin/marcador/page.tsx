'use client';
import { MarcadorForm } from '@/components/admin/marcador-form';

export default function AdminMarcadorPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-[var(--text)]">Marcador en Vivo</h1><p className="text-sm text-[var(--text-secondary)]">Actualiza el marcador del partido en tiempo real.</p></div>
      <MarcadorForm />
    </div>
  );
}
