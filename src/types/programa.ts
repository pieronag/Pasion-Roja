export type TipoPrograma = 'radio' | 'tv' | 'ambos';
export type CategoriaPrograma = 'deportes' | 'noticias' | 'entrevistas' | 'musica' | 'especial';

export interface DiasHorario {
  dia: number;
  horaInicio: string;
  horaFin: string;
}

export interface Programa {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoPrograma;
  host: string;
  horarios: DiasHorario[];
  imagenPortada: string;
  activo: boolean;
  categoria: CategoriaPrograma;
  redes?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
}
