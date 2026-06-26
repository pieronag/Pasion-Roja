'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Zap, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginSchema } from '@/lib/validations';
import { useAuthContext } from '@/providers/auth-provider';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      setSuccess('Sesión iniciada, redirigiendo...');
      setTimeout(() => { window.location.href = '/admin'; }, 500);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Ingresa email y contraseña');
      return;
    }

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues.map((i) => i.message).join('. '));
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await cred.user.getIdToken(true);
      setSuccess('Inicio de sesión exitoso. Redirigiendo...');
      window.location.href = '/admin';
    } catch (err: any) {
      console.error('Login error:', err.code, err.message);

      const messages: Record<string, string> = {
        'auth/invalid-credential': 'Email o contraseña incorrectos',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-email': 'Email inválido',
        'auth/user-disabled': 'Usuario deshabilitado',
        'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos',
        'auth/configuration-not-found': 'Firebase no está configurado correctamente',
        'auth/invalid-api-key': 'API Key de Firebase inválida',
        'auth/network-request-failed': 'Error de red. Revisa tu conexión',
      };

      setError(messages[err.code] || `Error: ${err.code || err.message}`);
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-400">{success}</p>
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              <LogIn className="h-4 w-4 mr-2" /> Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
