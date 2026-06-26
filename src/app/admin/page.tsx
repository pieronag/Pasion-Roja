'use client';

import { WidgetResumen } from '@/components/admin/widget-resumen';
import { MiniAnalytics } from '@/components/admin/mini-analytics';
import { MarcadorForm } from '@/components/admin/marcador-form';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-white">Panel de Control</h1>
      <WidgetResumen />
      <MiniAnalytics />
      <MarcadorForm />
    </div>
  );
}
