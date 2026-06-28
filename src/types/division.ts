export type TipoDivision = 'liga' | 'copa' | 'torneo';
export type TipoLiguilla = 'none' | 'cuadrangular' | 'liguilla';

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
  tipoLiguilla: TipoLiguilla;
  puestosLiguillaDesde: number;
  puestosLiguillaHasta: number;
  ascensos: number;
  descensos: number;
}
