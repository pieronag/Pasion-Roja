'use client';
import { TransmisionForm } from '@/components/admin/transmision-form';

export default function AdminTransmisionPage() {
  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-[var(--text)]">Gestor de Transmisión</h2><p className="text-sm text-[var(--text-secondary)]">Controla radio y TV en vivo</p></div>
      <TransmisionForm />
    </div>
  );
}
