export interface AdminLog {
  id: string;
  accion: string;
  coleccion: string;
  documentId: string;
  cambios: string;
  adminEmail: string;
  timestamp: number;
}
