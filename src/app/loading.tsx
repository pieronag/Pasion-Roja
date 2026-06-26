import { Loader } from '@/components/shared/loader';

export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader size="lg" text="Cargando..." />
    </div>
  );
}
