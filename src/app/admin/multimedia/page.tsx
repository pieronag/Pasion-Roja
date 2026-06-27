'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/shared/loader';
import { EmptyState } from '@/components/shared/empty-state';
import { Image, Plus, Save, Trash2 } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import type { Multimedia } from '@/types/multimedia';

export default function AdminMultimediaPage() {
  const [items, setItems] = useState<Multimedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<'imagen' | 'video' | 'audio'>('imagen');
  const [base64, setBase64] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'multimedia'), orderBy('fecha', 'desc'), limit(50)), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Multimedia)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const b64 = await compressImage(file, 1200, 0.7); setBase64(b64); }
  };

  const subir = async () => {
    if (!titulo || (tipo === 'imagen' && !base64)) return;
    await addDoc(collection(db, 'multimedia'), { titulo, descripcion, tipo, base64: tipo === 'imagen' ? base64 : '', url: '', fecha: Date.now(), destacado: false });
    setTitulo(''); setDescripcion(''); setBase64('');
  };

  const eliminar = async (id: string) => { if (confirm('¿Eliminar?')) await deleteDoc(doc(db, 'multimedia', id)); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-[var(--text)]">Multimedia</h1>

      <Card>
        <CardHeader><h2 className="font-bold text-[var(--text)]">Subir Contenido</h2></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Título</Label><Input value={titulo} onChange={(e) => setTitulo(e.target.value)} /></div>
            <div className="space-y-2"><Label>Tipo</Label><Select value={tipo} onValueChange={(v: any) => setTipo(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="imagen">Imagen</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="audio">Audio</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label>Descripción</Label><Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
          {tipo === 'imagen' && (
            <div>
              <Label>Imagen</Label>
              <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-[var(--border)] cursor-pointer hover:border-[var(--accent)] mt-1">
                {base64 ? <img src={base64} alt="" className="max-h-32 rounded-lg" /> : <><Image className="h-8 w-8 text-[var(--text-muted)] mb-2" /><p className="text-sm text-[var(--text-secondary)]">Toca para subir</p></>}
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
            </div>
          )}
          <Button onClick={subir}><Save className="h-4 w-4 mr-2" /> Subir</Button>
        </CardContent>
      </Card>

      {loading ? <Loader /> : !items.length ? <EmptyState title="Sin contenido multimedia" /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]">
              {item.base64 ? <img src={item.base64} alt={item.titulo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[var(--accent-light)] to-[var(--bg-secondary)] flex items-center justify-center"><Image className="h-6 w-6 text-[var(--text-muted)]" /></div>}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="ghost" size="icon" className="text-white" onClick={() => eliminar(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60"><p className="text-xs text-white truncate">{item.titulo}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
