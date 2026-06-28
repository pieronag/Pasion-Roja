export interface EstadisticaJugador {
  id: string;
  jugadorId: string;
  jugadorNombre: string;
  equipoId: string;
  equipoNombre: string;
  deporteId: string;
  partidoId?: string;
  temporada: string;
  estadisticas: Record<string, number>;
}

export interface TablaPosiciones {
  divisionId: string;
  deporteId: string;
  equipos: EquipoPosicion[];
  actualizadoEn: number;
}

export interface EquipoPosicion {
  equipoId: string;
  nombre: string;
  nombreCorto: string;
  logoBase64: string;
  posicion: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  posicionAnterior: number | null;
  ultimos5: ('G' | 'E' | 'P')[];
}
