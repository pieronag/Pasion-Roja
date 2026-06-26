import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-8xl font-black font-display text-rojo mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-2">Página no encontrada</h2>
      <p className="text-gray-400 mb-6">La página que buscas no existe o fue movida.</p>
      <Link href="/">
        <Button size="lg">
          <Home className="h-4 w-4 mr-2" /> Volver al Inicio
        </Button>
      </Link>
    </div>
  );
}
