export interface PartidoEnVivo {
  id: string;
  equipoLocal: string;
  equipoVis: string;
  marcadorLocal: number;
  marcadorVis: number;
  minuto: string;
  actualizadoEn: number;
}

export interface EventoPartido {
  id: string;
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'cambio';
  equipo: 'local' | 'visita';
  jugador: string;
  minuto: string;
  timestamp: number;
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
