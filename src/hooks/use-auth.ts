'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Firebase Auth no responde. Verifica tu configuración.');
      }
    }, 5000);

    let unsub: (() => void) | undefined;

    try {
      unsub = onAuthStateChanged(
        auth,
        (u) => {
          setUser(u);
          setLoading(false);
          clearTimeout(timeout);
        },
        (err) => {
          console.error('Auth error:', err);
          setError('Error de autenticación: ' + err.message);
          setLoading(false);
          clearTimeout(timeout);
        }
      );
    } catch (err: any) {
      console.error('Auth setup error:', err);
      setError('Error al inicializar Firebase Auth');
      setLoading(false);
      clearTimeout(timeout);
    }

    return () => {
      clearTimeout(timeout);
      unsub?.();
    };
  }, [loading]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  return { user, loading, error, logout };
}
