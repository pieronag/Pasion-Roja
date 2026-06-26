'use client';

import { HistorialCambios } from '@/components/admin/historial-cambios';

export default function AdminHistorialPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-white">Historial de Cambios</h1>
      <p className="text-sm text-gray-500">Registro de todas las acciones realizadas en el panel de administración.</p>
      <HistorialCambios />
    </div>
  );
}
