export type EstadoPartido = 'programado' | 'en_vivo' | 'finalizado' | 'suspendido';

export interface EventoPartido {
  id: string;
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'cambio' | 'punto' | 'set' | 'try' | 'canasta';
  equipo: 'local' | 'visita';
  jugador: string;
  jugadorId?: string;
  minuto: string;
  timestamp: number;
}

export interface Partido {
  id: string;
  deporteId: string;
  divisionId: string;
  equipoLocalId: string;
  equipoVisitaId: string;
  equipoLocalNombre: string;
  equipoVisitaNombre: string;
  fecha: number;
  estado: EstadoPartido;
  marcadorLocal: number;
  marcadorVisita: number;
  minuto: string;
  jornada: number;
  estadio: string;
  eventos: EventoPartido[];
  actualizadoEn: number;
}

export interface Comentario {
  id: string;
  usuario: string;
  texto: string;
  timestamp: number;
}

export interface Reaccion {
  emoji: string;
  count: number;
}
