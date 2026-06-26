'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageUp, X, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/utils';

interface ImageUploaderProps {
  onImagesReady: (mini: string, full: string) => void;
  className?: string;
}

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
    } catch (err) {
      console.error('Image processing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-pizarra-claro p-6 transition-colors cursor-pointer hover:border-rojo/50',
          preview && 'border-solid border-rojo/30'
        )}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-rojo" />
        ) : preview ? (
          <div className="relative w-full">
            <img src={preview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
            <button
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="absolute top-2 right-2 rounded-full bg-pizarra/80 p-1.5 hover:bg-pizarra"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <ImageUp className="h-10 w-10 text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">Toca para subir imagen</p>
            <p className="text-xs text-gray-600 mt-1">Se comprimirá a WebP (máx 800px)</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
