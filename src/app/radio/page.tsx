import type { Metadata } from 'next';
import { RadioPageClient } from '@/components/radio/radio-page-client';

export const metadata: Metadata = {
  title: 'Radio Online — Pasión Roja',
  description: 'Escucha Pasión Roja Radio en vivo. Programación deportiva.',
};

export default function RadioPage() {
  return <RadioPageClient />;
}
