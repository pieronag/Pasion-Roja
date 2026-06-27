import { ContactoBandeja } from '@/components/admin/contacto-bandeja';

export default function AdminContactoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display text-[var(--text)]">Bandeja de Contacto</h1>
      <ContactoBandeja />
    </div>
  );
}
