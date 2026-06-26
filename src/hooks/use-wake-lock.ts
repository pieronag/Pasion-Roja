'use client';

import { useEffect, useRef } from 'react';

export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<any>(null);

  useEffect(() => {
    if (!active || !navigator.wakeLock) return;
    navigator.wakeLock.request('screen').then((s: any) => {
      sentinelRef.current = s;
    }).catch(() => {});
    return () => {
      sentinelRef.current?.release().catch(() => {});
    };
  }, [active]);
}
