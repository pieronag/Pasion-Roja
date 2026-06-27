'use client';
import { HistorialCambios } from '@/components/admin/historial-cambios';

export default function AdminHistorialPage() {
  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-[var(--text)]">Historial de Cambios</h2><p className="text-sm text-[var(--text-secondary)]">Registro de acciones en el panel</p></div>
      <HistorialCambios />
    </div>
  );
}
