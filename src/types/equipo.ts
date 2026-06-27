export interface Equipo {
  id: string;
  nombre: string;
  nombreCorto: string;
  deporteId: string;
  divisionId: string;
  logoBase64: string;
  colorPrimario: string;
  colorSecundario: string;
  fundacion: number;
  estadio: string;
  ciudad: string;
  entrenador: string;
  activo: boolean;
  redes?: {
    instagram?: string;
    facebook?: string;
    web?: string;
  };
}
