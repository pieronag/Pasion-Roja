'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Zap, LogIn } from 'lucide-react';
import { loginSchema } from '@/lib/validations';
import { useAuthContext } from '@/providers/auth-provider';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) window.location.href = '/admin';
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.code === 'auth/invalid-credential' ? 'Credenciales inválidas' : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pizarra p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex flex-col items-center gap-2 mb-4">
            <Zap className="h-10 w-10 text-rojo fill-rojo" />
            <h1 className="text-2xl font-black font-display text-white">
              PASIÓN <span className="text-rojo">ROJA</span>
            </h1>
            <p className="text-sm text-gray-500">Panel de Administración</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pasionroja.cl"
                autoComplete="email"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <Button type="submit" loading={loading} size="lg" className="w-full">
              <LogIn className="h-4 w-4 mr-2" /> Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
