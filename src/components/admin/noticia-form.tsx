'use client';

import { useState, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from './image-uploader';
import { NoticiaEditor } from './noticia-editor';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Newspaper, Save, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { noticiaSchema } from '@/lib/validations';
import { useAutoSave } from '@/hooks/use-auto-save';

export function NoticiaForm() {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<string>('general');
  const [cuerpo, setCuerpo] = useState('');
  const [resumen, setResumen] = useState('');
  const [miniBase64, setMiniBase64] = useState('');
  const [imgFullBase64, setImgFullBase64] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { loadDraft, clearDraft } = useAutoSave('noticia-draft', { titulo, cuerpo, resumen, categoria, miniBase64, imgFullBase64 });

  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) { setTitulo(draft.titulo); setCuerpo(draft.cuerpo); setResumen(draft.resumen); setCategoria(draft.categoria); setMiniBase64(draft.miniBase64); setImgFullBase64(draft.imgFullBase64); }
  };

  const handleSubmit = async () => {
    setError('');
    const result = noticiaSchema.safeParse({ titulo, cuerpo, resumen, categoria, miniBase64, imgFullBase64 });
    if (!result.success) { setError(result.error.issues.map((e) => e.message).join('. ')); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'noticias'), { ...result.data, createdAt: Date.now(), updatedAt: Date.now(), publicado: true, publishAt: null });
      setSuccess(true); clearDraft();
      setTitulo(''); setCuerpo(''); setResumen(''); setMiniBase64(''); setImgFullBase64(''); setCategoria('general');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const onImagesReady = useCallback((mini: string, full: string) => { setMiniBase64(mini); setImgFullBase64(full); }, []);

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Newspaper className="h-5 w-5 text-[var(--accent)]" /><h2 className="text-lg font-bold text-[var(--text)]">Nueva Noticia</h2></div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleLoadDraft}>Cargar borrador</Button>
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Preview</Button></DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><h3 className="text-sm font-bold text-[var(--text)]">Preview Móvil</h3></DialogHeader>
                <div className="bg-white text-black rounded-[var(--radius-sm)] p-3 max-w-[280px] mx-auto">
                  {miniBase64 && <img src={miniBase64} alt="" className="w-full aspect-video object-cover rounded-[var(--radius-xs)] mb-2" />}
                  <h4 className="font-bold text-base text-gray-900">{titulo || 'Título'}</h4>
                  <p className="text-xs text-gray-600 mt-1">{resumen || 'Resumen...'}</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-red-500/10 border"><AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" /><p className="text-xs text-red-400">{error}</p></div>}
        {success && <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-emerald-500/10 border"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><p className="text-xs text-emerald-400">Noticia publicada</p></div>}

        <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Título</Label><div className="relative"><Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título de la noticia" maxLength={120} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)]">{titulo.length}/120</span></div></div>
        <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Resumen</Label><Input value={resumen} onChange={(e) => setResumen(e.target.value)} placeholder="Breve resumen" maxLength={300} /></div>
        <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Categoría</Label><Select value={categoria} onValueChange={setCategoria}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="partido">⚽ Partido</SelectItem><SelectItem value="torneo">🏆 Torneo</SelectItem><SelectItem value="entrevista">🎙️ Entrevista</SelectItem><SelectItem value="general">📰 General</SelectItem></SelectContent></Select></div>
        <ImageUploader onImagesReady={onImagesReady} />
        <div className="space-y-1.5"><Label className="text-xs text-[var(--text-muted)]">Contenido</Label><NoticiaEditor content={cuerpo} onChange={setCuerpo} /></div>
        <Button onClick={handleSubmit} loading={saving} size="full">{success ? '✓ Publicada' : <><Save className="h-4 w-4 mr-1.5" /> Publicar Noticia</>}</Button>
      </CardContent>
    </Card>
  );
}
