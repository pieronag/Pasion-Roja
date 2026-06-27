export type TipoSponsor = 'principal' | 'oficial' | 'auspiciador' | 'media';

export interface Sponsor {
  id: string;
  nombre: string;
  logoBase64: string;
  url: string;
  tipo: TipoSponsor;
  orden: number;
  activo: boolean;
  descripcion: string;
  desde: number;
  equipoId?: string;
  deporteId?: string;
}
