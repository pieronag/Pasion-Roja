'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEquipos } from '@/hooks/use-equipos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/shared/loader';
import { cn } from '@/lib/utils';
import { Upload, CheckCircle2, AlertCircle, Shield, Users, Search } from 'lucide-react';
import type { Equipo } from '@/types/equipo';

interface RawPlayer {
  nombre: string;
  club: string;
  goles: number;
  posicion: string;
}

const RAW_DATA: RawPlayer[] = [
  { nombre: 'Bastián Arraño', club: 'Aguará', goles: 1, posicion: 'Delantero' },
  { nombre: 'Brian Mondaca', club: 'Rodelindo Román', goles: 1, posicion: 'Delantero' },
  { nombre: 'Sebastián Medina Nahuelhual', club: 'Futuro', goles: 0, posicion: 'Defensa' },
  { nombre: 'Ricardo Contreras', club: 'Futuro', goles: 0, posicion: 'Portero' },
  { nombre: 'Joaquín Yévenes', club: 'Deportes Rancagua', goles: 0, posicion: 'Defensa' },
  { nombre: 'Lucas Espinoza', club: 'Deportes Rancagua', goles: 0, posicion: 'Defensa' },
  { nombre: 'Ignacio Maldonado', club: 'Deportes Rancagua', goles: 0, posicion: 'Volante' },
  { nombre: 'Harry Carnarton', club: 'Futuro', goles: 0, posicion: 'Volante' },
  { nombre: 'Bastián Fuentes', club: 'Deportes Rancagua', goles: 0, posicion: 'Portero' },
  { nombre: 'Martín Hormazábal', club: 'Atlético Oriente', goles: 0, posicion: 'Volante' },
  { nombre: 'Pablo Chamorro', club: 'Atlético Oriente', goles: 0, posicion: 'Delantero' },
  { nombre: 'Agustín Oyarce', club: 'Atlético Oriente', goles: 0, posicion: 'Volante' },
  { nombre: 'Leandro Espinoza', club: 'Futuro', goles: 0, posicion: 'Defensa' },
  { nombre: 'Kevin Reyes Ortega', club: 'Deportes Rancagua', goles: 0, posicion: 'Volante' },
  { nombre: 'Daniel Barrios', club: 'Deportes Rancagua', goles: 0, posicion: 'Volante' },
  { nombre: 'Mauricio Zenteno Jiménez', club: 'Deportes Rancagua', goles: 0, posicion: 'Delantero' },
  { nombre: 'Alonso Benavente', club: 'Naval', goles: 0, posicion: 'Delantero' },
  { nombre: 'Tomás Meyer', club: 'Futuro', goles: 0, posicion: 'Portero' },
  { nombre: 'Benjamín Soto', club: 'Futuro', goles: 0, posicion: 'Volante' },
  { nombre: 'Williams Silva', club: 'Deportes Rancagua', goles: 0, posicion: 'Defensa' },
  { nombre: 'Ignacio Carreño', club: 'Deportes Rancagua', goles: 0, posicion: 'Volante' },
  { nombre: 'José Meneses', club: 'Deportes Rancagua', goles: 0, posicion: 'Volante' },
  { nombre: 'Mauricio Catalán', club: 'Deportes Rancagua', goles: 0, posicion: 'Defensa' },
  { nombre: 'Ignacio Aguilar', club: 'Futuro', goles: 0, posicion: 'Defensa' },
  { nombre: 'Enzo Pérez Román', club: 'Deportes Rancagua', goles: 0, posicion: 'Defensa' },
  { nombre: 'Nicolás López', club: 'Futuro', goles: 0, posicion: 'Volante' },
  { nombre: 'Benjamín Salazar', club: 'Futuro', goles: 0, posicion: 'Defensa' },
  { nombre: 'Oscar Suárez', club: 'Atlético Oriente', goles: 0, posicion: 'Portero' },
  { nombre: 'Kevin Aranda', club: 'Atlético Oriente', goles: 0, posicion: 'Volante' },
  { nombre: 'Matías Ramírez Yáñez', club: 'Futuro', goles: 0, posicion: 'Portero' },
  { nombre: 'Benjamín Vásquez Pérez', club: 'Futuro', goles: 0, posicion: 'Defensa' },
  { nombre: 'Gabriel Vásquez', club: 'Futuro', goles: 0, posicion: 'Volante' },
  { nombre: 'Bastián Toloza', club: 'Futuro', goles: 0, posicion: 'Volante' },
  { nombre: 'Benjamín Gamboa', club: 'Futuro', goles: 0, posicion: 'Volante' },
  { nombre: 'Isaac Crisóstomo', club: 'Futuro', goles: 0, posicion: 'Volante' },
  { nombre: 'Vicente Fernández Cortés', club: 'Atlético Oriente', goles: 0, posicion: 'Delantero' },
  { nombre: 'Benjamín Troncoso', club: 'Atlético Oriente', goles: 0, posicion: 'Defensa' },
  { nombre: 'Daglas Maldonado', club: 'Atlético Oriente', goles: 0, posicion: 'Defensa' },
  { nombre: 'Jonathan Miranda', club: 'Futuro', goles: 0, posicion: 'Defensa' },
  { nombre: 'Benjamín Urrutia', club: 'Naval', goles: 0, posicion: 'Defensa' },
  { nombre: 'Vicente Cid', club: 'Naval', goles: 0, posicion: 'Volante' },
  { nombre: 'Juan Geraldo', club: 'Futuro', goles: 0, posicion: 'Volante' },
  { nombre: 'Sergio Zúñiga', club: 'Naval', goles: 0, posicion: 'Volante' },
  { nombre: 'Ignacio Saldías', club: 'Atlético Oriente', goles: 0, posicion: 'Defensa' },
  { nombre: 'Arnaldo Ramírez', club: 'Futuro', goles: 0, posicion: 'Defensa' },
  { nombre: 'Vladimir Quiroz', club: 'Atlético Oriente', goles: 0, posicion: 'Defensa' },
  { nombre: 'Yeiko Cartagena', club: 'Quintero Unido', goles: 2, posicion: 'Volante' },
  { nombre: 'Bayron Espinoza', club: 'Futuro', goles: 2, posicion: 'Delantero' },
  { nombre: 'Gustavo Luarte', club: 'Lautaro de Buin', goles: 2, posicion: 'Delantero' },
  { nombre: 'Martín Serrano', club: 'Deportes Rancagua', goles: 2, posicion: 'Volante' },
  { nombre: 'Rodrigo Toloza Rojas', club: 'Malleco Unido', goles: 2, posicion: 'Defensa' },
  { nombre: 'Nicolás Arancibia', club: 'Naval', goles: 1, posicion: 'Delantero' },
  { nombre: 'Walter Estrada', club: 'Naval', goles: 1, posicion: 'Volante' },
  { nombre: 'Freddy Barahona', club: 'Constitución Unido', goles: 1, posicion: 'Delantero' },
  { nombre: 'Rodrigo Salcedo', club: 'Comunal Cabrero', goles: 1, posicion: 'Volante' },
  { nombre: 'Benjamín Gómez', club: 'Lautaro de Buin', goles: 1, posicion: 'Defensa' },
  { nombre: 'Diego Gaune', club: 'Lautaro de Buin', goles: 1, posicion: 'Volante' },
  { nombre: 'Martín Oñate', club: 'Naval', goles: 1, posicion: 'Delantero' },
  { nombre: 'Nicolás Lecaros Meneses', club: 'Lautaro de Buin', goles: 1, posicion: 'Delantero' },
  { nombre: 'Kevin Gamboa', club: 'Deportes Rancagua', goles: 1, posicion: 'Delantero' },
  { nombre: 'Pablo Sanhueza', club: 'Comunal Cabrero', goles: 1, posicion: 'Defensa' },
  { nombre: 'Matías Lagos', club: 'Comunal Cabrero', goles: 1, posicion: 'Defensa' },
  { nombre: 'Iván Garrido', club: 'Constitución Unido', goles: 1, posicion: 'Delantero' },
  { nombre: 'Manuel Gallardo Vera', club: 'Constitución Unido', goles: 1, posicion: 'Volante' },
  { nombre: 'Nicolás Riquelme', club: 'Municipal Puente Alto', goles: 1, posicion: 'Defensa' },
  { nombre: 'Marcelo González', club: 'Municipal Puente Alto', goles: 1, posicion: 'Volante' },
  { nombre: 'Jesús Gacitúa', club: 'Municipal Puente Alto', goles: 1, posicion: 'Delantero' },
  { nombre: 'Benjamín Miranda Castro', club: 'Deportes Rancagua', goles: 1, posicion: 'Delantero' },
  { nombre: 'Santiago Medina', club: 'Chimbarongo F.C', goles: 1, posicion: 'Defensa' },
  { nombre: 'Rodrigo Flores', club: 'Municipal Puente Alto', goles: 1, posicion: 'Volante' },
  { nombre: 'Matías Torres Véliz', club: 'Chimbarongo F.C', goles: 1, posicion: 'Defensa' },
  { nombre: 'Nicolás Ibarra', club: 'Deportes Rancagua', goles: 1, posicion: 'Delantero' },
  { nombre: 'Julio Zúñiga', club: 'Deportes Rancagua', goles: 1, posicion: 'Volante' },
  { nombre: 'Ignacio López', club: 'Municipal Puente Alto', goles: 1, posicion: 'Volante' },
  { nombre: 'Benjamín Romo', club: 'Municipal Puente Alto', goles: 1, posicion: 'Defensa' },
  { nombre: 'Matías Vidal', club: 'Chimbarongo F.C', goles: 1, posicion: 'Delantero' },
  { nombre: 'Jorge Contreras', club: 'Deportes Rancagua', goles: 1, posicion: 'Delantero' },
  { nombre: 'Máximo Arancibia', club: 'Lautaro de Buin', goles: 1, posicion: 'Volante' },
  { nombre: 'Christopher Navarro', club: 'Malleco Unido', goles: 1, posicion: 'Volante' },
  { nombre: 'Benjamín Oreste', club: 'Malleco Unido', goles: 1, posicion: 'Volante' },
  { nombre: 'Agustín García', club: 'Atlético Oriente', goles: 1, posicion: 'Volante' },
  { nombre: 'Nicolás Muñoz Lillo', club: 'Municipal Puente Alto', goles: 1, posicion: 'Defensa' },
  { nombre: 'Michel Morales Parra', club: 'Imperial Unido', goles: 1, posicion: 'Volante' },
  { nombre: 'Cristóbal Ríos', club: 'Futuro', goles: 1, posicion: 'Defensa' },
  { nombre: 'Javier González Bucarey', club: 'Futuro', goles: 1, posicion: 'Volante' },
  { nombre: 'Ángel Melo', club: 'Futuro', goles: 1, posicion: 'Delantero' },
  { nombre: 'Ignacio Miranda', club: 'Aguará', goles: 1, posicion: 'Defensa' },
  { nombre: 'Lukas Román', club: 'Futuro', goles: 1, posicion: 'Delantero' },
  { nombre: 'Matías Toledo', club: 'Imperial Unido', goles: 1, posicion: 'Volante' },
  { nombre: 'José Mateo Cabrera', club: 'Futuro', goles: 1, posicion: 'Defensa' },
  { nombre: 'Cristopher Zamora', club: 'Imperial Unido', goles: 1, posicion: 'Delantero' },
  { nombre: 'Lucas Viveros', club: 'Imperial Unido', goles: 1, posicion: 'Defensa' },
  { nombre: 'Agustín Peñailillo', club: 'Imperial Unido', goles: 1, posicion: 'Defensa' },
  { nombre: 'Vicente Veloso', club: 'Constitución Unido', goles: 1, posicion: 'Volante' },
  { nombre: 'Hernán Ulloa', club: 'Futuro', goles: 1, posicion: 'Defensa' },
  { nombre: 'Martín Orellana', club: 'Constitución Unido', goles: 1, posicion: 'Defensa' },
  { nombre: 'Matías Leiva', club: 'Quintero Unido', goles: 10, posicion: 'Delantero' },
  { nombre: 'Luciano Parra', club: 'Aguará', goles: 7, posicion: 'Delantero' },
  { nombre: 'Matías Aguilar', club: 'Malleco Unido', goles: 6, posicion: 'Delantero' },
  { nombre: 'Pablo Araya', club: 'Atlético Oriente', goles: 6, posicion: 'Delantero' },
  { nombre: 'Carlos Vásquez', club: 'Constitución Unido', goles: 6, posicion: 'Volante' },
  { nombre: 'Ignacio Flores', club: 'Comunal Cabrero', goles: 5, posicion: 'Delantero' },
  { nombre: 'Tomás Matías Andrades', club: 'Imperial Unido', goles: 5, posicion: 'Volante' },
  { nombre: 'Luis Silva Gaunes', club: 'Chimbarongo F.C', goles: 4, posicion: 'Delantero' },
  { nombre: 'Felipe Zúñiga', club: 'Malleco Unido', goles: 4, posicion: 'Delantero' },
  { nombre: 'Mateo Toro', club: 'Comunal Cabrero', goles: 4, posicion: 'Defensa' },
  { nombre: 'José Luis Silva', club: 'Lautaro de Buin', goles: 4, posicion: 'Volante' },
  { nombre: 'Esteban Céspedes', club: 'Atlético Oriente', goles: 4, posicion: 'Delantero' },
  { nombre: 'Álvaro López', club: 'Lautaro de Buin', goles: 4, posicion: 'Delantero' },
  { nombre: 'Matías Osorio Salazar', club: 'Atlético Oriente', goles: 4, posicion: 'Delantero' },
  { nombre: 'Tomás Huerta', club: 'Naval', goles: 3, posicion: 'Volante' },
  { nombre: 'David Quiroz', club: 'Lautaro de Buin', goles: 3, posicion: 'Delantero' },
  { nombre: 'Esteban Onetto', club: 'Aguará', goles: 3, posicion: 'Volante' },
  { nombre: 'Massami Gutiérrez', club: 'Chimbarongo F.C', goles: 3, posicion: 'Delantero' },
  { nombre: 'Iván Martínez', club: 'Aguará', goles: 3, posicion: 'Delantero' },
  { nombre: 'Moisés Calupi', club: 'Malleco Unido', goles: 3, posicion: 'Volante' },
  { nombre: 'Gianfranco Sepúlveda', club: 'Quintero Unido', goles: 3, posicion: 'Volante' },
  { nombre: 'Juan Villablanca', club: 'Naval', goles: 3, posicion: 'Volante' },
  { nombre: 'Yerald Toledo', club: 'Naval', goles: 3, posicion: 'Delantero' },
  { nombre: 'Martín Garrido', club: 'Rodelindo Román', goles: 3, posicion: 'Delantero' },
  { nombre: 'Brayan Paredes', club: 'Constitución Unido', goles: 3, posicion: 'Volante' },
  { nombre: 'Diego Urzúa', club: 'Chimbarongo F.C', goles: 2, posicion: 'Volante' },
  { nombre: 'Emerson Figueroa', club: 'Municipal Puente Alto', goles: 2, posicion: 'Delantero' },
  { nombre: 'Álvaro Arredondo', club: 'Deportes Rancagua', goles: 2, posicion: 'Defensa' },
  { nombre: 'Marcelo Iván Riquelme', club: 'Constitución Unido', goles: 2, posicion: 'Volante' },
  { nombre: 'Jeremy Rey', club: 'Imperial Unido', goles: 2, posicion: 'Defensa' },
  { nombre: 'Cristián Opazo', club: 'Comunal Cabrero', goles: 2, posicion: 'Delantero' },
  { nombre: 'Marco Sandoval', club: 'Imperial Unido', goles: 2, posicion: 'Delantero' },
  { nombre: 'Víctor Vásquez', club: 'Rodelindo Román', goles: 2, posicion: 'Delantero' },
  { nombre: 'Cristián González Espinosa', club: 'Constitución Unido', goles: 2, posicion: 'Delantero' },
  { nombre: 'José Palma', club: 'Municipal Puente Alto', goles: 2, posicion: 'Delantero' },
  { nombre: 'Bastián Castañeda', club: 'Rodelindo Román', goles: 2, posicion: 'Delantero' },
  { nombre: 'Javier Medina', club: 'Chimbarongo F.C', goles: 2, posicion: 'Delantero' },
  { nombre: 'Patricio Romero Ramírez', club: 'Constitución Unido', goles: 2, posicion: 'Defensa' },
  { nombre: 'Jorge Faúndez', club: 'Rodelindo Román', goles: 2, posicion: 'Volante' },
  { nombre: 'Roberto Zenteno', club: 'Aguará', goles: 2, posicion: 'Defensa' },
  { nombre: 'Alonso Lagos', club: 'Quintero Unido', goles: 2, posicion: 'Delantero' },
  { nombre: 'Claudio Muñoz Uribe', club: 'Naval', goles: 2, posicion: 'Defensa' },
  { nombre: 'Diego Chávez', club: 'Deportes Rancagua', goles: 2, posicion: 'Delantero' },
  { nombre: 'Maximiliano Aravena', club: 'Malleco Unido', goles: 2, posicion: 'Defensa' },
  { nombre: 'Joaquín Albornoz', club: 'Futuro', goles: 2, posicion: 'Volante' },
  { nombre: 'Alejandro Zúñiga', club: 'Deportes Rancagua', goles: 2, posicion: 'Volante' },
  { nombre: 'Rodrigo Díaz Toro', club: 'Naval', goles: 2, posicion: 'Delantero' },
  { nombre: 'Matías Pino Rozas', club: 'Naval', goles: 2, posicion: 'Volante' },
  { nombre: 'Álvaro Pilquimán', club: 'Atlético Oriente', goles: 2, posicion: 'Delantero' },
  { nombre: 'Giovanni Davis', club: 'Quintero Unido', goles: 2, posicion: 'Volante' },
];

const POSITION_MAP: Record<string, string> = {
  volante: 'Mediocampista',
  delantero: 'Delantero',
  defensa: 'Defensa',
  portero: 'Portero',
};

function matchEquipo(rawName: string, equipos: Equipo[]): Equipo | null {
  const q = rawName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const eq of equipos) {
    const eqName = eq.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (eqName.includes(q) || q.includes(eqName)) return eq;
  }
  return null;
}

function splitName(full: string): { nombre: string; apellido: string } {
  const idx = full.indexOf(' ');
  if (idx === -1) return { nombre: full, apellido: '' };
  return { nombre: full.slice(0, idx), apellido: full.slice(idx + 1).trim() };
}

export default function ImportarJugadoresPage() {
  const { equipos } = useEquipos();
  const [existingIds, setExistingIds] = useState<Set<string>>(new Set());
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [importing, setImporting] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [errores, setErrores] = useState<string[]>([]);
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'jugadores')), (snap) => {
      setExistingIds(new Set(snap.docs.map(d => (d.data().nombreCompleto || '').toLowerCase().trim())));
      setLoadingExisting(false);
    });
    return () => unsub();
  }, []);

  const importar = async () => {
    setImporting(true);
    setLog([]);
    setErrores([]);
    let ok = 0;
    let err = 0;
    let skipped = 0;

    for (const raw of RAW_DATA) {
      const key = raw.nombre.toLowerCase().trim();
      if (existingIds.has(key)) {
        skipped++;
        setLog(prev => [...prev, `⏭ ${raw.nombre} — ya existe`]);
        continue;
      }

      const equipo = matchEquipo(raw.club, equipos);
      if (!equipo) {
        err++;
        const msg = `❌ ${raw.nombre} — no se encontro equipo para "${raw.club}"`;
        setErrores(prev => [...prev, msg]);
        setLog(prev => [...prev, msg]);
        continue;
      }

      const posicionNormalizada = POSITION_MAP[raw.posicion.toLowerCase()] || 'Mediocampista';
      const { nombre, apellido } = splitName(raw.nombre);

      try {
        await addDoc(collection(db, 'jugadores'), {
          nombre,
          apellido,
          nombreCompleto: raw.nombre.trim(),
          equipoId: equipo.id,
          deporteId: equipo.deporteId || '',
          numero: 0,
          posicion: posicionNormalizada,
          fotoBase64: '',
          fechaNacimiento: 0,
          nacionalidad: 'Chilena',
          altura: 0,
          peso: 0,
          pie: 'Derecho',
          fichado: '',
          contratoHasta: '',
          valorMercado: '',
          activo: true,
          estadisticasTemp: { goles: raw.goles },
          temporadaActual: '2026',
        });
        ok++;
        setLog(prev => [...prev, `✅ ${raw.nombre} (${equipo.nombre}, ${posicionNormalizada}, ${raw.goles} g)`]);
      } catch (e: any) {
        err++;
        setErrores(prev => [...prev, `❌ ${raw.nombre} — ${e.message}`]);
        setLog(prev => [...prev, `❌ ${raw.nombre} — error al guardar`]);
      }
    }

    setLog(prev => [...prev, '', `📊 ${ok} insertados, ${skipped} omitidos, ${err} errores`]);
    setCompletado(true);
    setImporting(false);
  };

  const clubes = [...new Set(RAW_DATA.map(p => p.club))].sort();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[var(--text)]">Importar Jugadores</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {RAW_DATA.length} registros de {clubes.length} clubes distintos
        </p>
      </div>

      {loadingExisting ? (
        <Loader size="sm" />
      ) : (
        <>
          {/* Club summary */}
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--accent)]" /> Clubes detectados
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {clubes.map((c) => {
                const eq = matchEquipo(c, equipos);
                const count = RAW_DATA.filter(p => p.club === c).length;
                return (
                  <div key={c} className={cn(
                    'flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border text-xs',
                    eq ? 'border-emerald-500/30 bg-emerald-500/[0.05]' : 'border-red-500/30 bg-red-500/[0.05]'
                  )}>
                    {eq?.logoBase64 ? <img src={eq.logoBase64} alt="" className="w-5 h-5 object-contain" /> : <div className="w-5 h-5 rounded-full bg-[var(--bg-secondary)]" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text)] truncate">{c}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{eq ? eq.nombre : 'SIN MATCH'} · {count} jug.</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <p className="text-2xl font-black text-[var(--text)]">{RAW_DATA.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Registros totales</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <p className="text-2xl font-black text-[var(--text)]">{clubes.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Clubes</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <p className="text-2xl font-black text-[var(--text)]">{existingIds.size}</p>
              <p className="text-xs text-[var(--text-muted)]">Jugadores existentes</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <p className="text-2xl font-black text-[var(--text)]">{RAW_DATA.length - existingIds.size}</p>
              <p className="text-xs text-[var(--text-muted)]">A insertar</p>
            </div>
          </div>

          {/* Action */}
          <Button onClick={importar} loading={importing} disabled={importing || completado} size="lg" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            {completado ? 'Importacion completada' : importing ? 'Importando...' : `Importar ${RAW_DATA.length} jugadores`}
          </Button>

          {/* Log */}
          {log.length > 0 && (
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
              <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-xs font-semibold text-[var(--text)]">Bitacora</span>
                {errores.length > 0 && <span className="text-xs text-red-400 ml-auto">{errores.length} errores</span>}
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
