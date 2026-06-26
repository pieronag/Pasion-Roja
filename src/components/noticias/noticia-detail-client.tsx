'use client';

import { DetalleNoticia } from './detalle-noticia';

export function NoticiaDetailClient({ id }: { id: string }) {
  return <DetalleNoticia id={id} />;
}
