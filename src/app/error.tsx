'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <AlertTriangle className="h-16 w-16 text-rojo mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Algo salió mal</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        Ocurrió un error inesperado. Por favor, intenta de nuevo.
      </p>
      <Button onClick={reset} size="lg">
        Reintentar
      </Button>
    </div>
  );
}
