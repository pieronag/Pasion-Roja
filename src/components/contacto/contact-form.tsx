'use client';

import { useState } from 'react';
import { useContacto } from '@/hooks/use-contacto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export function ContactForm() {
  const { enviarMensaje } = useContacto();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !mensaje) { setError('Completa los campos requeridos'); return; }
    setLoading(true); setError('');
    try {
      await enviarMensaje({ nombre, email, telefono: telefono || undefined, mensaje });
      setSuccess(true);
      setNombre(''); setEmail(''); setTelefono(''); setMensaje('');
      setTimeout(() => setSuccess(false), 4000);
    } catch { setError('Error al enviar. Intenta de nuevo.'); }
    finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-bold text-[var(--text)]">Envíanos un mensaje</h2>
        <p className="text-sm text-[var(--text-secondary)]">Cuéntanos tu idea, sugerencia o saludo</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Nombre *</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" /></div>
          <div className="space-y-2"><Label>Email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" /></div>
          <div className="space-y-2"><Label>Teléfono</Label><Input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 9 ..." /></div>
          <div className="space-y-2"><Label>Mensaje *</Label><textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={4} className="flex h-24 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text)] px-4 py-2 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]" placeholder="Escribe tu mensaje..." /></div>
          {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"><AlertCircle className="h-4 w-4 text-red-400" /><p className="text-sm text-red-400">{error}</p></div>}
          {success && <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20"><CheckCircle2 className="h-4 w-4 text-green-400" /><p className="text-sm text-green-400">Mensaje enviado con éxito</p></div>}
          <Button type="submit" loading={loading} size="lg" className="w-full"><Send className="h-4 w-4 mr-2" />Enviar Mensaje</Button>
        </form>
      </CardContent>
    </Card>
  );
}
