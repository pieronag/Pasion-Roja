export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  equipoId: string;
  deporteId: string;
  numero: number;
  posicion: string;
  fotoBase64: string;
  fechaNacimiento: number;
  nacionalidad: string;
  altura: number;
  peso: number;
  activo: boolean;
  estadisticasTemp: Record<string, number>;
  temporadaActual: string;
}
