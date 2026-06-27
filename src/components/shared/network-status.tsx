'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff } from 'lucide-react';

export function NetworkStatus() {
  const { isOnline } = useNetworkStatus();
  if (isOnline) return null;
  return (
    <div className="fixed top-14 left-0 right-0 z-50 bg-[var(--error)] text-white text-center text-xs font-medium py-1.5 flex items-center justify-center gap-1.5 safe-top">
      <WifiOff className="h-3.5 w-3.5" /> Sin conexión — mostrando datos cacheados
    </div>
  );
}
