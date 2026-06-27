'use client';
import { TransmisionForm } from '@/components/admin/transmision-form';

export default function AdminTransmisionPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-[var(--text)]">Gestor de Transmisión</h1><p className="text-sm text-[var(--text-secondary)]">Controla la transmisión en vivo de radio y TV.</p></div>
      <TransmisionForm />
    </div>
  );
}
