'use client';
import { MarcadorForm } from '@/components/admin/marcador-form';

export default function AdminMarcadorPage() {
  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-[var(--text)]">Marcador en Vivo</h2><p className="text-sm text-[var(--text-secondary)]">Actualiza el marcador del partido en tiempo real</p></div>
      <MarcadorForm />
    </div>
  );
}
