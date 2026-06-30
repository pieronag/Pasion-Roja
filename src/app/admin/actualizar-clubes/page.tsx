'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/shared/loader';
import { cn } from '@/lib/utils';
import { Shield, RefreshCw, CheckCircle2, AlertCircle, Building } from 'lucide-react';
import type { Equipo } from '@/types/equipo';

interface ClubData {
  nombre: string;
  fundacion: number;
  presidente: string;
  entrenador: string;
  estadio: string;
  ciudad: string;
  region: string;
}

const CLUBES: ClubData[] = [
  { nombre: 'Aguará FC', fundacion: 2017, presidente: 'SERGIO ALBERTO HIDALGO BRONFMAN', entrenador: 'CARLOS FELIPE LUENGO KANACRI', estadio: 'MUNICIPAL DE SAN JOAQUÍN', ciudad: 'LA REINA', region: 'METROPOLITANA' },
  { nombre: 'Atlético Oriente', fundacion: 2019, presidente: 'JUAN ARTURO GÓMEZ JARPA', entrenador: 'AGUSTÍN ALEX SALVATIERRA CONCHA', estadio: 'MUNICIPAL LO BARNECHEA', ciudad: 'LO BARNECHEA', region: 'METROPOLITANA' },
  { nombre: 'Chimbarongo F.C', fundacion: 2013, presidente: 'HÉCTOR EDUARDO BOZÁN ATALA', entrenador: 'ÍTALO ANDRÉS PINOCHET CRESTTO', estadio: 'MUNICIPAL DE CHIMBARONGO', ciudad: 'CHIMBARONGO', region: "O'HIGGINS" },
  { nombre: 'Comunal Cabrero', fundacion: 2017, presidente: '', entrenador: 'SMITH EDGARDO ABDALA MONTERO', estadio: 'MUNICIPAL LUIS CHIQUI CHAVARRÍA', ciudad: 'CABRERO', region: 'BIOBÍO' },
  { nombre: 'Constitución Unido', fundacion: 1998, presidente: 'CRISTÓBAL GERARDO FAÚNDEZ MUÑOZ', entrenador: 'NELSON ANTONIO TAPAI RÍOS', estadio: 'MUNICIPAL ENRIQUE DONN MÜLLER', ciudad: 'CONSTITUCIÓN', region: 'MAULE' },
  { nombre: 'Deportes Rancagua', fundacion: 2015, presidente: '', entrenador: 'RODRIGO ANTONIO PÉREZ ALBORNOZ', estadio: 'MUNICIPAL DE CODEGUA', ciudad: 'RANCAGUA', region: "O'HIGGINS" },
  { nombre: 'Futuro', fundacion: 2023, presidente: '', entrenador: '', estadio: 'MANUEL RODRÍGUEZ', ciudad: 'PEÑALOLÉN', region: 'METROPOLITANA' },
  { nombre: 'Imperial Unido', fundacion: 2022, presidente: '', entrenador: 'JOHN ROBERT BUSTAMANTE ROBLEDO', estadio: 'MUNICIPAL EL ALTO', ciudad: 'NUEVA IMPERIAL', region: 'LA ARAUCANÍA' },
  { nombre: 'Lautaro de Buin', fundacion: 1923, presidente: 'LEONARDO ALBERTO ZÚÑIGA HURTADO', entrenador: 'CARLOS MAURICIO ENCINAS VÁSQUEZ', estadio: 'LAUTARO DE BUIN', ciudad: 'BUIN', region: 'METROPOLITANA' },
  { nombre: 'Malleco Unido', fundacion: 1974, presidente: '', entrenador: 'LUIS ALBERTO PÉREZ FRANCO', estadio: 'MUNICIPAL ALBERTO LARRAGUIBEL MORALES', ciudad: 'ANGOL', region: 'LA ARAUCANÍA' },
  { nombre: 'Municipal Puente Alto', fundacion: 2019, presidente: '', entrenador: 'MIGUEL ANDRÉS VALDÉS AROS', estadio: 'MUNICIPAL DE PUENTE ALTO', ciudad: 'PUENTE ALTO', region: 'METROPOLITANA' },
  { nombre: 'Naval', fundacion: 1972, presidente: '', entrenador: 'CÉSAR ALEJANDRO PÉREZ SANHUEZA', estadio: 'EL MORRO', ciudad: 'TALCAHUANO', region: 'BIOBÍO' },
  { nombre: 'Quintero Unido', fundacion: 1962, presidente: 'CARLOS IVÁN REJANO FERNÁNDEZ', entrenador: 'FELIPE ALEJANDRO GUTIÉRREZ LEIVA', estadio: 'MUNICIPAL RAÚL VARGAS VERDEJO', ciudad: 'QUINTERO', region: 'VALPARAÍSO' },
  { nombre: 'Rodelindo Román', fundacion: 1956, presidente: '', entrenador: 'JUAN PABLO GUZMÁN PIZARRO', estadio: 'MUNICIPAL SAN GREGORIO', ciudad: 'SAN JOAQUÍN', region: 'METROPOLITANA' },
];

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '');
}

function findMatch(nombre: string, equipos: Equipo[]): Equipo | null {
  const q = normalize(nombre);
  for (const eq of equipos) {
    const eqName = normalize(eq.nombre);
    if (eqName.includes(q) || q.includes(eqName)) return eq;
  }
  return null;
}

export default function ActualizarClubesPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loadingEq, setLoadingEq] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'equipos')), (snap) => {
      setEquipos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Equipo)));
      setLoadingEq(false);
    });
    return () => unsub();
  }, []);

  const actualizar = async () => {
    setUpdating(true);
    setLog([]);
    let ok = 0, err = 0, skipped = 0;

    for (const c of CLUBES) {
      const match = findMatch(c.nombre, equipos);
      if (!match) {
        err++;
        setLog(prev => [...prev, `❌ ${c.nombre} — no se encontró en la DB`]);
        continue;
      }

      const updateData: any = {};

      const upperNombre = c.nombre.toUpperCase();
      if (match.nombre !== upperNombre) updateData.nombre = upperNombre;
      if (match.fundacion !== c.fundacion) updateData.fundacion = c.fundacion;
      if (match.entrenador !== c.entrenador) updateData.entrenador = c.entrenador;
      if (match.estadio !== c.estadio) updateData.estadio = c.estadio;
      if (match.ciudad !== c.ciudad) updateData.ciudad = c.ciudad;
      if (match.region !== c.region) updateData.region = c.region;
      const presActual = (match as any).presidente || '';
      if (presActual !== c.presidente) updateData.presidente = c.presidente;

      if (Object.keys(updateData).length === 0) {
        skipped++;
        setLog(prev => [...prev, `⏭ ${c.nombre} — sin cambios`]);
        continue;
      }

      try {
        await updateDoc(doc(db, 'equipos', match.id), { ...updateData, actualizadoEn: Date.now() });
        ok++;
        const changes = Object.keys(updateData).join(', ');
        setLog(prev => [...prev, `✅ ${c.nombre} — actualizado: ${changes}`]);
      } catch (e: any) {
        err++;
        setLog(prev => [...prev, `❌ ${c.nombre} — ${e.message}`]);
      }
    }

    setLog(prev => [...prev, '', `📊 ${ok} actualizados, ${skipped} sin cambios, ${err} errores`]);
    setUpdating(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[var(--text)]">Actualizar Clubes</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {CLUBES.length} clubes para actualizar · {equipos.length} equipos en DB
        </p>
      </div>

      {loadingEq ? (
        <Loader size="sm" />
      ) : (
        <>
          {/* Club cards preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CLUBES.map((c) => {
              const match = findMatch(c.nombre, equipos);
              return (
                <div key={c.nombre} className={cn(
                  'rounded-[var(--radius-sm)] border p-3 text-xs',
                  match ? 'border-emerald-500/30 bg-emerald-500/[0.05]' : 'border-red-500/30 bg-red-500/[0.05]'
                )}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building className="h-4 w-4 text-[var(--accent)]" />
                    <span className="font-bold text-[var(--text)]">{c.nombre.toUpperCase()}</span>
                  </div>
                  <div className="space-y-0.5 text-[var(--text-secondary)]">
                    <p>Fundación: {c.fundacion}</p>
                    {c.presidente && <p className="truncate">PDTE: {c.presidente}</p>}
                    {c.entrenador && <p className="truncate">DT: {c.entrenador}</p>}
                    <p>Estadio: {c.estadio}</p>
                    <p>Ciudad: {c.ciudad}, {c.region}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action */}
          <Button onClick={actualizar} loading={updating} disabled={updating} size="lg" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            {updating ? 'Actualizando...' : `Actualizar ${CLUBES.length} clubes`}
          </Button>

          {/* Log */}
          {log.length > 0 && (
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
              <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-xs font-semibold text-[var(--text)]">Bitacora</span>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto text-xs font-mono space-y-0.5 scrollbar-thin">
                {log.map((line, i) => (
                  <p key={i} className={cn(
                    line.startsWith('❌') ? 'text-red-400' : line.startsWith('✅') ? 'text-emerald-400' : line.startsWith('⏭') ? 'text-yellow-400' : line.startsWith('📊') ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
                  )}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
