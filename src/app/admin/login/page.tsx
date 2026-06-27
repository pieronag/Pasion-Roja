'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, LogIn, AlertCircle, CheckCircle2, Eye, EyeOff, Shield } from 'lucide-react';
import { loginSchema } from '@/lib/validations';
import { useAuthContext } from '@/providers/auth-provider';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    if (!email || !password) { setError('Ingresa email y contraseña'); return; }
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) { setError(result.error.issues.map((i) => i.message).join('. ')); return; }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await cred.user.getIdToken(true);
      setSuccess('Inicio de sesión exitoso. Redirigiendo...');
      setTimeout(() => { window.location.href = '/admin'; }, 800);
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'Email o contraseña incorrectos',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-email': 'Email inválido',
        'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos',
        'auth/configuration-not-found': 'Firebase no está configurado',
        'auth/invalid-api-key': 'API Key inválida',
        'auth/network-request-failed': 'Error de red. Revisa tu conexión',
      };
      setError(messages[err.code] || `Error: ${err.code || err.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Left panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-sm animate-scale-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-[var(--radius)] bg-gradient-to-br from-[var(--accent)] to-orange-500 flex items-center justify-center shadow-lg shadow-[var(--accent)]/20 mb-4 animate-float">
              <Zap className="h-7 w-7 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-black font-display text-[var(--text)] tracking-tight">
              PASIÓN <span className="text-[var(--accent)]">ROJA</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Panel de Administración</p>
          </div>

          <Card className="border-[var(--border)] shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-[var(--text-secondary)]">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@pasionroja.cl"
                      autoComplete="email"
                      autoFocus
                      disabled={loading}
                      className="h-11 pl-10"
                    />
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-[var(--text-secondary)]">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={loading}
                      className="h-11 pl-10 pr-10"
                    />
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="animate-slide-up flex items-start gap-2.5 p-3 rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="animate-slide-up flex items-center gap-2.5 p-3 rounded-[var(--radius-sm)] bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <p className="text-xs text-emerald-400">{success}</p>
                  </div>
                )}

                <Button type="submit" loading={loading} size="full" className="h-11 mt-1">
                  <LogIn className="h-4 w-4 mr-2" /> Ingresar al Panel
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            &copy; {new Date().getFullYear()} Pasión Roja. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right panel - Branding/Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[var(--accent)] via-[var(--accent-hover)] to-[#7c2d12] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -left-20 w-48 h-48 rounded-full bg-white/[0.03]" />

        {/* Animated elements */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-white/30 animate-ping-slow" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-white/20 animate-ping-slow" style={{ animationDuration: '4s' }} />
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 rounded-full bg-white/25 animate-ping-slow" style={{ animationDuration: '2.5s' }} />

        <div className="relative z-10 flex flex-col items-center justify-center text-white p-12 text-center">
          <div className="mb-6 animate-float">
            <Zap className="h-16 w-16 text-white/80 fill-white/80" />
          </div>
          <h2 className="text-4xl font-black font-display mb-4 tracking-tight">PASIÓN ROJA</h2>
          <p className="text-lg text-white/70 max-w-md leading-relaxed">
            Plataforma de gestión deportiva. Administra equipos, jugadores, partidos y más desde un solo lugar.
          </p>
          <div className="flex gap-3 mt-8">
            <div className="w-2 h-2 rounded-full bg-white/60 animate-fade-in" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-white/60 animate-fade-in" style={{ animationDelay: '0.3s' }} />
            <div className="w-2 h-2 rounded-full bg-white/60 animate-fade-in" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
