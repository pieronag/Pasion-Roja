'use client';

import { TransmisionForm } from '@/components/admin/transmision-form';

export default function AdminTransmisionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-white">Gestor de Transmisión</h1>
      <p className="text-sm text-gray-500">Controla la transmisión en vivo de YouTube desde aquí.</p>
      <TransmisionForm />
    </div>
  );
}
