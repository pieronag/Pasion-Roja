export interface Goleador {
  id: string;
  nombre: string;
  equipoId: string;
  goles: number;
  fotoBase64?: string;
  activo: boolean;
}
