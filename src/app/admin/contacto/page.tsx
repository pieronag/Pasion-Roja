import { ContactoBandeja } from '@/components/admin/contacto-bandeja';

export default function AdminContactoPage() {
  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-[var(--text)]">Bandeja de Contacto</h2><p className="text-sm text-[var(--text-secondary)]">Mensajes enviados por usuarios</p></div>
      <ContactoBandeja />
    </div>
  );
}
