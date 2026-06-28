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
  tipoPromocion: 'none' | 'promocion';
  puestosPromocionDesde: number;
  puestosPromocionHasta: number;
  bannerBase64: string;
  ascensos: number;
  descensos: number;
}
