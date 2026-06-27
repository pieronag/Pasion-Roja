export type TipoMultimedia = 'imagen' | 'video' | 'audio';

export interface Multimedia {
  id: string;
  tipo: TipoMultimedia;
  titulo: string;
  descripcion: string;
  url: string;
  base64?: string;
  thumbnail?: string;
  fecha: number;
  programaId?: string;
  partidoId?: string;
  galeria?: string;
  destacado: boolean;
  deporteId?: string;
}
