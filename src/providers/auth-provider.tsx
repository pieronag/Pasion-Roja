'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader } from '@/components/shared/loader';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuth();

  if (authState.loading) {
    const syncUser = auth.currentUser;
    if (syncUser) {
      return (
        <AuthContext.Provider
          value={{ user: syncUser, loading: false, error: null, logout: authState.logout }}
        >
          {children}
        </AuthContext.Provider>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-pizarra">
        <Loader size="lg" text="Inicializando..." />
      </div>
    );
  }

  if (authState.error) {
    const syncUser = auth.currentUser;
    if (syncUser) {
      return (
        <AuthContext.Provider
          value={{ user: syncUser, loading: false, error: null, logout: authState.logout }}
        >
          {children}
        </AuthContext.Provider>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-pizarra p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-rojo mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error de Conexión</h2>
          <p className="text-gray-400 text-sm mb-6">{authState.error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
