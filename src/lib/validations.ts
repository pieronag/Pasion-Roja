import { z } from 'zod';

export const marcadorSchema = z.object({
  equipoLocal: z.string().min(1, 'Equipo local requerido'),
  equipoVis: z.string().min(1, 'Equipo visitante requerido'),
  marcadorLocal: z.number().int().min(0, 'Debe ser >= 0'),
  marcadorVis: z.number().int().min(0, 'Debe ser >= 0'),
  minuto: z.string().regex(/^\d+(\+\d+)?'?$/, 'Formato inválido (ej: 45+2)'),
  deporteId: z.string().optional(),
});

export const noticiaSchema = z.object({
  titulo: z.string().min(5, 'Título muy corto').max(120, 'Título muy largo'),
  cuerpo: z.string().min(20, 'Contenido muy corto'),
  resumen: z.string().min(10, 'Resumen muy corto').max(300),
  categoria: z.enum(['partido', 'torneo', 'entrevista', 'general']),
  miniBase64: z.string().optional(),
  imgFullBase64: z.string().optional(),
});

export const transmisionSchema = z.object({
  youtubeUrl: z.string().url('URL inválida').or(z.literal('')),
  estadoTransmision: z.enum(['en_vivo', 'programado', 'terminado', 'none']),
  programadoPara: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const deporteSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  icono: z.string().min(1, 'Icono requerido'),
  victoria: z.number().int().min(1),
  empate: z.number().int().min(0),
});

export const equipoSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  nombreCorto: z.string().length(3).optional(),
  deporteId: z.string().min(1, 'Deporte requerido'),
});

export const jugadorSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  numero: z.number().int().min(0).max(99),
  posicion: z.string().min(2),
  equipoId: z.string().min(1),
});

export const partidoSchema = z.object({
  deporteId: z.string().min(1),
  equipoLocalId: z.string().min(1),
  equipoVisitaId: z.string().min(1),
  fecha: z.number().positive(),
  jornada: z.number().int().min(1),
});

export const sponsorSchema = z.object({
  nombre: z.string().min(2),
  url: z.string().url().optional().or(z.literal('')),
  tipo: z.enum(['principal', 'oficial', 'auspiciador', 'media']),
  descripcion: z.string().optional(),
});

export type MarcadorFormData = z.infer<typeof marcadorSchema>;
export type NoticiaFormData = z.infer<typeof noticiaSchema>;
export type TransmisionFormData = z.infer<typeof transmisionSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
