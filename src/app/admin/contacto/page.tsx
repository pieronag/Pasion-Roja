import { ContactoBandeja } from '@/components/admin/contacto-bandeja';

export default function AdminContactoPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-[var(--text)]">Bandeja de Contacto</h1><p className="text-sm text-[var(--text-secondary)]">Mensajes enviados por los usuarios.</p></div>
      <ContactoBandeja />
    </div>
  );
}
