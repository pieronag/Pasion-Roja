export type EstadoTransmision = 'en_vivo' | 'programado' | 'terminado' | 'none';

export interface ConfigTransmision {
  id: string;
  youtubeLiveId: string | null;
  youtubeUrl: string | null;
  estadoTransmision: EstadoTransmision;
  programadoPara: number | null;
  actualizadoEn: number;
}
