'use client';

import { MarcadorForm } from '@/components/admin/marcador-form';

export default function AdminMarcadorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-white">Marcador en Vivo</h1>
      <p className="text-sm text-gray-500">Actualiza el marcador del partido en tiempo real. Los cambios se reflejan instantáneamente.</p>
      <MarcadorForm />
    </div>
  );
}
