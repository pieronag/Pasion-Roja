import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loader({ className, size = 'md', text }: LoaderProps) {
  const sizeMap = { sm: 16, md: 24, lg: 36 };
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-8', className)}>
      <Loader2 className="animate-spin text-rojo" size={sizeMap[size]} />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
}
