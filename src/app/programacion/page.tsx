import type { Metadata } from 'next';
import { ProgramacionPageClient } from '@/components/programacion/programacion-page-client';

export const metadata: Metadata = {
  title: 'Programación — Pasión Roja',
  description: 'Programación completa de radio y TV.',
};

export default function ProgramacionPage() {
  return <ProgramacionPageClient />;
}
