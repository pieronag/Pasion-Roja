export interface Noticia {
  id: string;
  titulo: string;
  cuerpo: string;
  resumen: string;
  miniBase64: string;
  imgFullBase64: string;
  categoria: 'partido' | 'torneo' | 'entrevista' | 'general';
  deporteId?: string;
  equipoId?: string;
  createdAt: number;
  updatedAt: number;
  publishAt: number | null;
  publicado: boolean;
}
