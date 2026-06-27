'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageUp, X, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/utils';

interface ImageUploaderProps { onImagesReady: (mini: string, full: string) => void; className?: string; }

export function ImageUploader({ onImagesReady, className }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      const mini = await compressImage(file, 200, 0.5);
      const full = await compressImage(file, 800, 0.6);
      onImagesReady(mini, full);
    } catch {} finally { setLoading(false); }
  };

  const handleClear = () => { setPreview(null); if (inputRef.current) inputRef.current.value = ''; };

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-xs text-[var(--text-muted)]">Imagen destacada</label>
      <div className={cn('relative flex flex-col items-center justify-center rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--border)] p-4 transition-colors cursor-pointer hover:border-[var(--accent)]/50', preview && 'border-solid border-[var(--accent)]/30')} onClick={() => inputRef.current?.click()}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" /> : preview ? (
          <div className="relative w-full"><img src={preview} alt="" className="w-full max-h-32 object-contain rounded-[var(--radius-xs)]" /><button onClick={(e) => { e.stopPropagation(); handleClear(); }} className="absolute top-1 right-1 rounded-full bg-black/50 p-1"><X className="h-3 w-3 text-white" /></button></div>
        ) : <><ImageUp className="h-6 w-6 text-[var(--text-muted)] mb-1" /><p className="text-xs text-[var(--text-secondary)]">Seleccionar imagen</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">Se comprimirá a WebP 800px</p></>}
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
