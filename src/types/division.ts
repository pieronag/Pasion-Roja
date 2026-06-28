export type TipoDivision = 'liga' | 'copa' | 'torneo';

export interface Division {
  id: string;
  deporteId: string;
  nombre: string;
  temporada: string;
  tipo: TipoDivision;
  activa: boolean;
  equipoIds: string[];
  totalJornadas: number;
  tieneCuadrangular: boolean;
  equiposCuadrangular: number;
  ascensos: number;
  descensos: number;
}
