'use client';

import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const conn = (navigator as any).connection;
    if (conn) {
      setConnectionType(conn.effectiveType || 'unknown');
      const handler = () => setConnectionType(conn.effectiveType);
      conn.addEventListener('change', handler);
      return () => conn.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return { isOnline, connectionType, isSlowConnection: connectionType === '2g' || connectionType === 'slow-2g' };
}
