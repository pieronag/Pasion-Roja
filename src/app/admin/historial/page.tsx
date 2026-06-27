'use client';
import { HistorialCambios } from '@/components/admin/historial-cambios';

export default function AdminHistorialPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-[var(--text)]">Historial de Cambios</h1><p className="text-sm text-[var(--text-secondary)]">Registro de todas las acciones realizadas en el panel.</p></div>
      <HistorialCambios />
    </div>
  );
}
