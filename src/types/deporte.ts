export interface Deporte {
  id: string;
  nombre: string;
  icono: string;
  activo: boolean;
  orden: number;
  sistemaPuntos: {
    victoria: number;
    empate: number;
    derrota: number;
  };
  estadisticasDisponibles: string[];
}
