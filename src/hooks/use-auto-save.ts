'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useAutoSave<T>(key: string, data: T, delay = 30000) {
  const savedRef = useRef(false);

  const save = useCallback(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      savedRef.current = true;
    } catch {}
  }, [key, data]);

  useEffect(() => {
    const timer = setInterval(save, delay);
    return () => clearInterval(timer);
  }, [save, delay]);

  useEffect(() => {
    const handleVisibility = () => { if (document.hidden) save(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [save]);

  const loadDraft = (): T | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const clearDraft = () => {
    localStorage.removeItem(key);
    savedRef.current = false;
  };

  return { loadDraft, clearDraft, saved: savedRef.current };
}
