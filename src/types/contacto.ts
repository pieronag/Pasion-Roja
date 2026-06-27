export interface MensajeContacto {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
  leido: boolean;
  timestamp: number;
}
