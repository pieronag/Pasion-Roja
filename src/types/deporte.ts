export interface Deporte {
  id: string;
  nombre: string;
  nombreUpper: string;
  icono: string;
  bannerBase64?: string;
  activo: boolean;
  orden: number;
  sistemaPuntos: {
    victoria: number;
    empate: number;
    derrota: number;
  };
  estadisticasDisponibles: string[];
}
