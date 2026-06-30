'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEquipos } from '@/hooks/use-equipos';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/shared/loader';
import { cn } from '@/lib/utils';
import { Upload, CheckCircle2, AlertCircle, Shield, Users, RefreshCw } from 'lucide-react';
import type { Equipo } from '@/types/equipo';

interface RawPlayer {
  nombre: string;
  club: string;
  goles: number;
  posicion: string;
}

interface DetailedPlayer {
  nombre: string;
  club: string;
  numero: string;
  posicion: string;
  fechaNacimiento: string;
  altura: string;
  pie: string;
  fichado: string;
  contrato: string;
  valorMercado?: string;
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

const DETALLED_DATA: DetailedPlayer[] = [
  // ===== MALLECO UNIDO =====
  { nombre: 'Juaquín Gutiérrez', club: 'Malleco Unido', numero: '1', posicion: 'Portero', fechaNacimiento: '14/04/2002', altura: '1,88m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Javier Díaz', club: 'Malleco Unido', numero: '33', posicion: 'Portero', fechaNacimiento: '04/02/2003', altura: '1,85m', pie: 'Derecho', fichado: '01/01/2024', contrato: '-' },
  { nombre: 'Nicolás Garrido', club: 'Malleco Unido', numero: '15', posicion: 'Portero', fechaNacimiento: '19/06/2005', altura: '1,95m', pie: 'Derecho', fichado: '17/02/2026', contrato: '-' },
  { nombre: 'Claudio Navarrete', club: 'Malleco Unido', numero: '4', posicion: 'Defensa central', fechaNacimiento: '05/11/1998', altura: '1,82m', pie: 'Derecho', fichado: '30/08/2025', contrato: '-' },
  { nombre: 'Moises Calupi', club: 'Malleco Unido', numero: '26', posicion: 'Defensa central', fechaNacimiento: '15/03/2002', altura: '-', pie: 'Derecho', fichado: '20/03/2024', contrato: '-' },
  { nombre: 'Gabriel Zúñiga', club: 'Malleco Unido', numero: '2', posicion: 'Defensa central', fechaNacimiento: '26/02/2004', altura: '1,80m', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Manuel Aravena', club: 'Malleco Unido', numero: '19', posicion: 'Lateral izquierdo', fechaNacimiento: '04/03/2004', altura: '1,74m', pie: 'Izquierdo', fichado: '24/01/2026', contrato: '-' },
  { nombre: 'Maximiliano Aravena', club: 'Malleco Unido', numero: '25', posicion: 'Lateral izquierdo', fechaNacimiento: '18/03/2003', altura: '-', pie: 'Izquierdo', fichado: '01/01/2026', contrato: '31/12/2026' },
  { nombre: 'Josué Filún', club: 'Malleco Unido', numero: '6', posicion: 'Mediocentro', fechaNacimiento: '12/04/2002', altura: '1,72m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Rodrigo Toloza', club: 'Malleco Unido', numero: '20', posicion: 'Mediocentro', fechaNacimiento: '29/09/2000', altura: '1,65m', pie: 'Izquierdo', fichado: '20/03/2024', contrato: '-' },
  { nombre: 'Michel Parra', club: 'Imperial Unido', numero: '-', posicion: 'Mediocentro ofensivo', fechaNacimiento: '-', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Hugo Labrin', club: 'Malleco Unido', numero: '10', posicion: 'Mediocentro ofensivo', fechaNacimiento: '18/05/2002', altura: '-', pie: '', fichado: '01/01/2023', contrato: '-' },
  { nombre: 'Lucas Benavides', club: 'Malleco Unido', numero: '-', posicion: 'Extremo izquierdo', fechaNacimiento: '24/08/1999', altura: '1,70m', pie: 'Derecho', fichado: '22/01/2025', contrato: '-' },
  { nombre: 'Matías Aguilar', club: 'Malleco Unido', numero: '9', posicion: 'Extremo derecho', fechaNacimiento: '20/06/2001', altura: '1,73m', pie: 'Derecho', fichado: '06/01/2026', contrato: '-' },
  { nombre: 'Christopher Navarro', club: 'Malleco Unido', numero: '23', posicion: 'Extremo derecho', fechaNacimiento: '02/10/2002', altura: '1,70m', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Mauro Díaz', club: 'Malleco Unido', numero: '-', posicion: 'Extremo derecho', fechaNacimiento: '-', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Felipe Zúñiga', club: 'Malleco Unido', numero: '11', posicion: 'Delantero centro', fechaNacimiento: '24/01/2000', altura: '-', pie: 'Derecho', fichado: '06/01/2026', contrato: '31/12/2026' },
  // ===== QUINTERO UNIDO =====
  { nombre: 'Cristóbal González', club: 'Quintero Unido', numero: '1', posicion: 'Portero', fechaNacimiento: '28/04/2003', altura: '1,82m', pie: 'Derecho', fichado: '15/03/2026', contrato: '-' },
  { nombre: 'Benjamín Araya', club: 'Quintero Unido', numero: '4', posicion: 'Defensa central', fechaNacimiento: '26/01/2004', altura: '1,80m', pie: 'Izquierdo', fichado: '24/01/2026', contrato: '-' },
  { nombre: 'Joaquín Campano', club: 'Quintero Unido', numero: '13', posicion: 'Lateral derecho', fechaNacimiento: '08/08/2003', altura: '-', pie: 'Derecho', fichado: '18/02/2026', contrato: '-' },
  { nombre: 'Nicolas Fuentes Carvacho', club: 'Quintero Unido', numero: '33', posicion: 'Lateral derecho', fechaNacimiento: '30/04/2002', altura: '1,78m', pie: 'Derecho', fichado: '17/02/2026', contrato: '-' },
  { nombre: 'Ignacio Pizarro', club: 'Quintero Unido', numero: '16', posicion: 'Centrocampista', fechaNacimiento: '-', altura: '-', pie: '', fichado: '24/02/2024', contrato: '-' },
  { nombre: 'Giovanni Davis', club: 'Quintero Unido', numero: '21', posicion: 'Mediocentro', fechaNacimiento: '01/08/2000', altura: '1,70m', pie: 'Derecho', fichado: '05/03/2026', contrato: '-' },
  { nombre: 'Kevin Jara', club: 'Quintero Unido', numero: '28', posicion: 'Mediocentro', fechaNacimiento: '01/03/2002', altura: '-', pie: 'Derecho', fichado: '01/01/2025', contrato: '31/12/2026' },
  { nombre: 'Bastián Marchant', club: 'Quintero Unido', numero: '19', posicion: 'Mediocentro', fechaNacimiento: '19/12/2001', altura: '-', pie: '', fichado: '01/03/2025', contrato: '-' },
  { nombre: 'Gianfranco Sepúlveda', club: 'Quintero Unido', numero: '10', posicion: 'Mediocentro ofensivo', fechaNacimiento: '18/03/2002', altura: '1,61m', pie: 'Derecho', fichado: '19/02/2026', contrato: '-' },
  { nombre: 'Yeiko Cartagena', club: 'Quintero Unido', numero: '29', posicion: 'Mediocentro ofensivo', fechaNacimiento: '09/06/2002', altura: '1,72m', pie: 'Izquierdo', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Matías Leiva', club: 'Quintero Unido', numero: '11', posicion: 'Extremo derecho', fechaNacimiento: '24/07/1999', altura: '1,75m', pie: 'Derecho', fichado: '26/01/2026', contrato: '-' },
  { nombre: 'Alonso Lagos', club: 'Quintero Unido', numero: '7', posicion: 'Extremo derecho', fechaNacimiento: '12/05/2000', altura: '-', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Marco Contreras', club: 'Quintero Unido', numero: '9', posicion: 'Delantero centro', fechaNacimiento: '-', altura: '-', pie: '', fichado: '23/02/2023', contrato: '-' },
  // ===== AGUARÁ =====
  { nombre: 'Ignacio Azúa', club: 'Aguará', numero: '24', posicion: 'Portero', fechaNacimiento: '23/06/1998', altura: '1,83m', pie: '', fichado: '17/03/2024', contrato: '-' },
  { nombre: 'Ignacio Miranda', club: 'Aguará', numero: '17', posicion: 'Defensa central', fechaNacimiento: '07/10/2002', altura: '-', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Ariel Pizarro', club: 'Aguará', numero: '8', posicion: 'Defensa central', fechaNacimiento: '05/09/2002', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Sebastián Painen', club: 'Aguará', numero: '30', posicion: 'Defensa central', fechaNacimiento: '13/06/2004', altura: '-', pie: 'Izquierdo', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Jesrrel Gálvez', club: 'Aguará', numero: '21', posicion: 'Lateral izquierdo', fechaNacimiento: '21/08/2002', altura: '-', pie: '', fichado: '01/01/2026', contrato: '31/12/2026' },
  { nombre: 'Jaime Torres', club: 'Aguará', numero: '27', posicion: 'Lateral derecho', fechaNacimiento: '17/12/2001', altura: '1,78m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Richard Arenas', club: 'Aguará', numero: '19', posicion: 'Pivote', fechaNacimiento: '25/09/2000', altura: '1,75m', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Esteban Onetto', club: 'Aguará', numero: '6', posicion: 'Mediocentro', fechaNacimiento: '20/08/2004', altura: '-', pie: 'Izquierdo', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Tomás Roa', club: 'Aguará', numero: '29', posicion: 'Mediocentro ofensivo', fechaNacimiento: '08/02/2001', altura: '1,84m', pie: 'Izquierdo', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Bastián Arraño', club: 'Aguará', numero: '11', posicion: 'Extremo derecho', fechaNacimiento: '12/07/2001', altura: '-', pie: 'Derecho', fichado: '01/01/2026', contrato: '31/12/2026' },
  { nombre: 'Luciano Parra', club: 'Aguará', numero: '9', posicion: 'Delantero centro', fechaNacimiento: '24/10/2002', altura: '1,85m', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  // ===== NAVAL =====
  { nombre: 'Sebastián Rojas', club: 'Naval', numero: '25', posicion: 'Portero', fechaNacimiento: '06/03/2001', altura: '1,84m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Guillermo Gajardo', club: 'Naval', numero: '32', posicion: 'Portero', fechaNacimiento: '05/06/2002', altura: '1,83m', pie: '', fichado: '01/01/2024', contrato: '-' },
  { nombre: 'Renato Subiabre', club: 'Naval', numero: '-', posicion: 'Portero', fechaNacimiento: '02/07/2005', altura: '-', pie: 'Derecho', fichado: '26/03/2026', contrato: '-' },
  { nombre: 'Pablo Ramírez', club: 'Naval', numero: '1', posicion: 'Portero', fechaNacimiento: '20/02/2003', altura: '-', pie: '', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Alexis Riquelme', club: 'Naval', numero: '8', posicion: 'Defensa', fechaNacimiento: '-', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Mauricio Avilés', club: 'Naval', numero: '19', posicion: 'Defensa', fechaNacimiento: '-', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Claudio Muñoz', club: 'Naval', numero: '5', posicion: 'Defensa central', fechaNacimiento: '21/11/1981', altura: '1,83m', pie: 'Izquierdo', fichado: '01/04/2026', contrato: '-' },
  { nombre: 'Leonardo Contreras', club: 'Naval', numero: '-', posicion: 'Defensa central', fechaNacimiento: '29/09/2002', altura: '1,80m', pie: 'Derecho', fichado: '11/02/2026', contrato: '-' },
  { nombre: 'Raúl Muñoz', club: 'Naval', numero: '2', posicion: 'Defensa central', fechaNacimiento: '03/05/2004', altura: '1,81m', pie: 'Derecho', fichado: '30/03/2026', contrato: '-' },
  { nombre: 'Luis Wills', club: 'Naval', numero: '23', posicion: 'Defensa central', fechaNacimiento: '14/12/2004', altura: '-', pie: '', fichado: '12/03/2026', contrato: '-' },
  { nombre: 'Boris Sandoval', club: 'Naval', numero: '19', posicion: 'Lateral izquierdo', fechaNacimiento: '23/03/1987', altura: '1,68m', pie: 'Izquierdo', fichado: '13/02/2026', contrato: '-' },
  { nombre: 'Felipe Rivas', club: 'Naval', numero: '-', posicion: 'Lateral izquierdo', fechaNacimiento: '17/08/2000', altura: '-', pie: '', fichado: '01/01/2022', contrato: '-' },
  { nombre: 'Mateo Toro', club: 'Naval', numero: '-', posicion: 'Lateral derecho', fechaNacimiento: '19/02/2005', altura: '-', pie: 'Derecho', fichado: '10/02/2026', contrato: '-' },
  { nombre: 'Ignacio Villablanca', club: 'Naval', numero: '-', posicion: 'Lateral derecho', fechaNacimiento: '28/05/2004', altura: '-', pie: 'Derecho', fichado: '01/04/2026', contrato: '31/12/2026' },
  { nombre: 'Kevin Orellana', club: 'Naval', numero: '30', posicion: 'Lateral derecho', fechaNacimiento: '08/02/2004', altura: '-', pie: 'Derecho', fichado: '30/01/2026', contrato: '-' },
  { nombre: 'Alexander Merino', club: 'Naval', numero: '-', posicion: 'Pivote', fechaNacimiento: '13/10/2001', altura: '1,75m', pie: 'Derecho', fichado: '01/01/2022', contrato: '-' },
  { nombre: 'Walter Estrada', club: 'Naval', numero: '6', posicion: 'Pivote', fechaNacimiento: '11/02/2002', altura: '1,77m', pie: 'Derecho', fichado: '10/02/2026', contrato: '-' },
  { nombre: 'Francisco Wastavino', club: 'Naval', numero: '13', posicion: 'Pivote', fechaNacimiento: '01/05/2003', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Brandon Ortiz', club: 'Naval', numero: '21', posicion: 'Centrocampista', fechaNacimiento: '-', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Bastián Suazo', club: 'Naval', numero: '31', posicion: 'Centrocampista', fechaNacimiento: '-', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Carlos Hernández', club: 'Naval', numero: '10', posicion: 'Mediocentro', fechaNacimiento: '20/11/1996', altura: '1,77m', pie: 'Derecho', fichado: '07/03/2025', contrato: '-' },
  { nombre: 'Matías Pino', club: 'Naval', numero: '34', posicion: 'Mediocentro', fechaNacimiento: '13/02/2003', altura: '1,77m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Tomás Huerta', club: 'Naval', numero: '-', posicion: 'Mediocentro', fechaNacimiento: '26/07/2004', altura: '-', pie: '', fichado: '16/03/2026', contrato: '-' },
  { nombre: 'Martín Oñate', club: 'Naval', numero: '24', posicion: 'Mediocentro ofensivo', fechaNacimiento: '14/02/2005', altura: '-', pie: 'Derecho', fichado: '27/03/2026', contrato: '-' },
  { nombre: 'Ignacio Sepúlveda', club: 'Naval', numero: '17', posicion: 'Extremo izquierdo', fechaNacimiento: '24/10/1996', altura: '1,77m', pie: 'Derecho', fichado: '19/01/2025', contrato: '-' },
  { nombre: 'Ignacio Flores', club: 'Naval', numero: '9', posicion: 'Extremo izquierdo', fechaNacimiento: '13/03/2002', altura: '-', pie: 'Izquierdo', fichado: '01/01/2022', contrato: '-' },
  { nombre: 'Felipe Vargas', club: 'Naval', numero: '-', posicion: 'Extremo derecho', fechaNacimiento: '29/11/2003', altura: '-', pie: '', fichado: '10/02/2026', contrato: '-' },
  { nombre: 'Michael Garcés', club: 'Naval', numero: '-', posicion: 'Extremo derecho', fechaNacimiento: '10/05/2001', altura: '-', pie: 'Izquierdo', fichado: '01/03/2021', contrato: '-' },
  { nombre: 'Rodrigo Diaz', club: 'Naval', numero: '29', posicion: 'Delantero centro', fechaNacimiento: '17/04/2002', altura: '1,78m', pie: 'Derecho', fichado: '04/04/2026', contrato: '-' },
  { nombre: 'Nicolás Arancibia', club: 'Naval', numero: '-', posicion: 'Delantero centro', fechaNacimiento: '-', altura: '1,84m', pie: '', fichado: '11/02/2026', contrato: '-' },
  { nombre: 'Yerald Toledo', club: 'Naval', numero: '23', posicion: 'Delantero centro', fechaNacimiento: '12/05/2003', altura: '-', pie: 'Derecho', fichado: '14/03/2025', contrato: '-' },
  { nombre: 'Benjamin Moraga', club: 'Naval', numero: '29', posicion: 'Delantero', fechaNacimiento: '-', altura: '-', pie: '', fichado: '', contrato: '-' },
  // ===== ATLÉTICO ORIENTE =====
  { nombre: 'Benjamín Troncoso', club: 'Atlético Oriente', numero: '6', posicion: 'Defensa', fechaNacimiento: '15/01/2001', altura: '-', pie: '', fichado: '15/03/2023', contrato: '-' },
  { nombre: 'Sebastián Leiva', club: 'Atlético Oriente', numero: '-', posicion: 'Defensa', fechaNacimiento: '15/01/2002', altura: '-', pie: '', fichado: '30/01/2023', contrato: '-' },
  { nombre: 'Rodrigo Vidal', club: 'Atlético Oriente', numero: '26', posicion: 'Defensa central', fechaNacimiento: '15/12/2003', altura: '-', pie: '', fichado: '16/02/2024', contrato: '-' },
  { nombre: 'Ignacio Valenzuela C.', club: 'Atlético Oriente', numero: '22', posicion: 'Defensa central', fechaNacimiento: '26/01/2004', altura: '-', pie: '', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Mauricio Aravena', club: 'Atlético Oriente', numero: '20', posicion: 'Lateral derecho', fechaNacimiento: '07/10/2000', altura: '-', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Daglas Maldonado', club: 'Atlético Oriente', numero: '14', posicion: 'Pivote', fechaNacimiento: '13/02/2001', altura: '-', pie: '', fichado: '30/01/2023', contrato: '-' },
  { nombre: 'José Montanares', club: 'Atlético Oriente', numero: '27', posicion: 'Centrocampista', fechaNacimiento: '27/04/2005', altura: '-', pie: '', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Víctor Cisterna', club: 'Atlético Oriente', numero: '10', posicion: 'Mediocentro', fechaNacimiento: '11/12/1991', altura: '1,74m', pie: 'Izquierdo', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Brayan Quezada', club: 'Atlético Oriente', numero: '28', posicion: 'Mediocentro', fechaNacimiento: '02/02/2002', altura: '1,75m', pie: 'Derecho', fichado: '01/04/2024', contrato: '-' },
  { nombre: 'Alans Yañez', club: 'Atlético Oriente', numero: '-', posicion: 'Interior izquierdo', fechaNacimiento: '19/02/2000', altura: '-', pie: '', fichado: '19/02/2024', contrato: '-' },
  { nombre: 'Sebastián Sasso', club: 'Atlético Oriente', numero: '-', posicion: 'Mediocentro ofensivo', fechaNacimiento: '19/04/2000', altura: '1,69m', pie: 'Derecho', fichado: '26/02/2024', contrato: '-' },
  { nombre: 'Emanuel Vargas', club: 'Atlético Oriente', numero: '11', posicion: 'Mediocentro ofensivo', fechaNacimiento: '28/03/2001', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Darío Aravena', club: 'Atlético Oriente', numero: '15', posicion: 'Mediocentro ofensivo', fechaNacimiento: '20/10/2002', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Pablo Araya', club: 'Atlético Oriente', numero: '11', posicion: 'Extremo derecho', fechaNacimiento: '19/09/2000', altura: '-', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Pablo Pereira', club: 'Atlético Oriente', numero: '7', posicion: 'Extremo derecho', fechaNacimiento: '10/04/2000', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Paulo Villalon', club: 'Atlético Oriente', numero: '-', posicion: 'Delantero', fechaNacimiento: '20/04/2001', altura: '-', pie: '', fichado: '13/03/2024', contrato: '-' },
  { nombre: 'Álvaro Pilquiman', club: 'Atlético Oriente', numero: '15', posicion: 'Delantero centro', fechaNacimiento: '28/02/2000', altura: '1,80m', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  // ===== LAUTARO DE BUIN =====
  { nombre: 'Sebastián Tapia', club: 'Lautaro de Buin', numero: '12', posicion: 'Portero', fechaNacimiento: '10/12/2004', altura: '1,81m', pie: '', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Francisco Reyes', club: 'Lautaro de Buin', numero: '3', posicion: 'Defensa central', fechaNacimiento: '-', altura: '-', pie: '', fichado: '01/01/2024', contrato: '-' },
  { nombre: 'Benjamín Gómez', club: 'Lautaro de Buin', numero: '18', posicion: 'Lateral izquierdo', fechaNacimiento: '04/01/2001', altura: '1,67m', pie: 'Izquierdo', fichado: '01/01/2023', contrato: '-' },
  { nombre: 'Eduardo Vidal', club: 'Lautaro de Buin', numero: '3', posicion: 'Lateral derecho', fechaNacimiento: '30/08/1992', altura: '1,74m', pie: 'Derecho', fichado: '01/01/2024', contrato: '-' },
  { nombre: 'Ignacio Novoa', club: 'Lautaro de Buin', numero: '4', posicion: 'Lateral derecho', fechaNacimiento: '19/08/2002', altura: '1,79m', pie: 'Derecho', fichado: '01/01/2024', contrato: '-' },
  { nombre: 'Alan Fernández', club: 'Lautaro de Buin', numero: '-', posicion: 'Pivote', fechaNacimiento: '12/11/1996', altura: '-', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Erik Ottesen', club: 'Lautaro de Buin', numero: '6', posicion: 'Mediocentro', fechaNacimiento: '03/01/2003', altura: '1,87m', pie: 'Izquierdo', fichado: '01/07/2025', contrato: '-' },
  { nombre: 'Ian Godoy', club: 'Lautaro de Buin', numero: '8', posicion: 'Mediocentro', fechaNacimiento: '09/01/2003', altura: '-', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Nicolás Pardo', club: 'Lautaro de Buin', numero: '16', posicion: 'Mediocentro', fechaNacimiento: '26/02/2001', altura: '1,71m', pie: 'Derecho', fichado: '01/01/2023', contrato: '-' },
  { nombre: 'Rodrigo Cisterna', club: 'Lautaro de Buin', numero: '11', posicion: 'Mediocentro ofensivo', fechaNacimiento: '25/03/2002', altura: '1,73m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'David Quiroz', club: 'Lautaro de Buin', numero: '20', posicion: 'Extremo derecho', fechaNacimiento: '09/04/2001', altura: '1,71m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Álvaro López', club: 'Lautaro de Buin', numero: '-', posicion: 'Delantero centro', fechaNacimiento: '24/09/1992', altura: '1,73m', pie: 'Derecho', fichado: '20/03/2026', contrato: '-' },
  { nombre: 'Lucas Candia', club: 'Lautaro de Buin', numero: '5', posicion: 'Delantero', fechaNacimiento: '-', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  // ===== COMUNAL CABRERO =====
  { nombre: 'Joaquín Araya', club: 'Comunal Cabrero', numero: '-', posicion: 'Portero', fechaNacimiento: '28/02/2004', altura: '1,81m', pie: 'Derecho', fichado: '21/02/2026', contrato: '-' },
  { nombre: 'Juan Pablo Andrade', club: 'Comunal Cabrero', numero: '-', posicion: 'Defensa central', fechaNacimiento: '29/11/1988', altura: '1,84m', pie: 'Derecho', fichado: '01/01/2026', contrato: '31/12/2026' },
  { nombre: 'Javier Diaz', club: 'Comunal Cabrero', numero: '-', posicion: 'Defensa central', fechaNacimiento: '-', altura: '-', pie: '', fichado: '01/01/2026', contrato: '31/12/2026' },
  { nombre: 'Yonathan Suazo', club: 'Comunal Cabrero', numero: '-', posicion: 'Lateral derecho', fechaNacimiento: '04/08/1989', altura: '1,79m', pie: 'Derecho', fichado: '21/02/2026', contrato: '-' },
  { nombre: 'Matías Lagos', club: 'Comunal Cabrero', numero: '-', posicion: 'Lateral derecho', fechaNacimiento: '03/01/1997', altura: '1,74m', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Benjamín Riquelme', club: 'Comunal Cabrero', numero: '7', posicion: 'Lateral derecho', fechaNacimiento: '24/02/2002', altura: '1,70m', pie: 'Derecho', fichado: '', contrato: '-' },
  { nombre: 'Jesús Arancibia', club: 'Comunal Cabrero', numero: '-', posicion: 'Mediocentro', fechaNacimiento: '05/07/2001', altura: '1,75m', pie: 'Izquierdo', fichado: '12/03/2026', contrato: '-' },
  { nombre: 'Fabián Quilaleo', club: 'Comunal Cabrero', numero: '8', posicion: 'Mediocentro', fechaNacimiento: '13/01/2000', altura: '1,70m', pie: 'Izquierdo', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Mauro Heredia', club: 'Comunal Cabrero', numero: '20', posicion: 'Mediocentro', fechaNacimiento: '05/07/2002', altura: '1,75m', pie: 'Derecho', fichado: '26/03/2024', contrato: '-' },
  { nombre: 'Emmanuel Arismendi', club: 'Comunal Cabrero', numero: '21', posicion: 'Mediocentro', fechaNacimiento: '05/12/2001', altura: '1,69m', pie: 'Derecho', fichado: '04/03/2025', contrato: '-' },
  { nombre: 'David Sidan Nuñez', club: 'Comunal Cabrero', numero: '-', posicion: 'Mediocentro ofensivo', fechaNacimiento: '19/10/2001', altura: '1,70m', pie: 'Derecho', fichado: '12/03/2026', contrato: '-' },
  { nombre: 'Jaime Caro', club: 'Comunal Cabrero', numero: '11', posicion: 'Extremo derecho', fechaNacimiento: '05/06/2003', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Mauricio Cortez', club: 'Comunal Cabrero', numero: '32', posicion: 'Extremo derecho', fechaNacimiento: '20/03/2001', altura: '-', pie: '', fichado: '03/04/2025', contrato: '-' },
  // ===== CONSTITUCIÓN UNIDO =====
  { nombre: 'Felipe Yáñez', club: 'Constitución Unido', numero: '-', posicion: 'Portero', fechaNacimiento: '12/09/1997', altura: '1,83m', pie: 'Derecho', fichado: '17/02/2024', contrato: '-' },
  { nombre: 'Marcelo Suárez', club: 'Constitución Unido', numero: '1', posicion: 'Portero', fechaNacimiento: '21/08/2000', altura: '1,87m', pie: 'Derecho', fichado: '02/01/2025', contrato: '31/12/2026' },
  { nombre: 'Francisco Bugueño', club: 'Constitución Unido', numero: '31', posicion: 'Portero', fechaNacimiento: '19/05/2002', altura: '1,83m', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Patricio Romero', club: 'Constitución Unido', numero: '3', posicion: 'Defensa central', fechaNacimiento: '29/05/2002', altura: '1,92m', pie: 'Izquierdo', fichado: '05/03/2026', contrato: '-' },
  { nombre: 'Alex Carquín', club: 'Constitución Unido', numero: '2', posicion: 'Defensa central', fechaNacimiento: '06/03/2001', altura: '1,78m', pie: 'Derecho', fichado: '05/03/2024', contrato: '-' },
  { nombre: 'Piero Benítez', club: 'Constitución Unido', numero: '15', posicion: 'Defensa central', fechaNacimiento: '30/11/2002', altura: '1,83m', pie: 'Derecho', fichado: '18/03/2026', contrato: '-' },
  { nombre: 'Brandon Cáceres', club: 'Constitución Unido', numero: '-', posicion: 'Lateral izquierdo', fechaNacimiento: '04/05/2001', altura: '1,76m', pie: 'Izquierdo', fichado: '22/06/2026', contrato: '-' },
  { nombre: 'Jeferson Castro', club: 'Constitución Unido', numero: '5', posicion: 'Lateral izquierdo', fechaNacimiento: '-', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Gonzalo Espinoza', club: 'Constitución Unido', numero: '21', posicion: 'Pivote', fechaNacimiento: '09/04/1990', altura: '1,77m', pie: 'Derecho', fichado: '10/02/2026', contrato: '31/12/2026' },
  { nombre: 'Vicente Veloso', club: 'Constitución Unido', numero: '8', posicion: 'Centrocampista', fechaNacimiento: '-', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Bryan Paredes', club: 'Constitución Unido', numero: '20', posicion: 'Centrocampista', fechaNacimiento: '03/10/2001', altura: '-', pie: '', fichado: '30/01/2026', contrato: '-' },
  { nombre: 'Nicolás Barrera', club: 'Constitución Unido', numero: '27', posicion: 'Centrocampista', fechaNacimiento: '-', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Lucas Reyes', club: 'Constitución Unido', numero: '23', posicion: 'Mediocentro', fechaNacimiento: '16/08/2004', altura: '1,79m', pie: '', fichado: '25/01/2026', contrato: '-' },
  { nombre: 'Eduardo Arévalo', club: 'Constitución Unido', numero: '27', posicion: 'Mediocentro', fechaNacimiento: '09/02/2004', altura: '1,70m', pie: 'Izquierdo', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Matías Faúndez', club: 'Constitución Unido', numero: '-', posicion: 'Mediocentro ofensivo', fechaNacimiento: '14/06/2001', altura: '1,70m', pie: 'Derecho', fichado: '20/01/2025', contrato: '-' },
  { nombre: 'Iván Garrido', club: 'Constitución Unido', numero: '26', posicion: 'Mediocentro ofensivo', fechaNacimiento: '19/11/2003', altura: '1,62m', pie: 'Derecho', fichado: '13/03/2026', contrato: '-' },
  { nombre: 'Iván Riquelme', club: 'Constitución Unido', numero: '10', posicion: 'Mediocentro ofensivo', fechaNacimiento: '04/01/2003', altura: '1,81m', pie: 'Izquierdo', fichado: '02/01/2025', contrato: '-' },
  { nombre: 'Benjamín Sereño', club: 'Constitución Unido', numero: '14', posicion: 'Mediocentro ofensivo', fechaNacimiento: '06/04/2003', altura: '-', pie: 'Derecho', fichado: '23/01/2026', contrato: '-' },
  { nombre: 'Eduardo Faúndez', club: 'Constitución Unido', numero: '-', posicion: 'Extremo izquierdo', fechaNacimiento: '01/07/2004', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Freddy Barahona', club: 'Constitución Unido', numero: '9', posicion: 'Delantero centro', fechaNacimiento: '15/06/1992', altura: '1,86m', pie: 'Izquierdo', fichado: '06/02/2026', contrato: '-' },
  { nombre: 'Cristian González Espinoza', club: 'Constitución Unido', numero: '7', posicion: 'Delantero centro', fechaNacimiento: '-', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Carlos Vásquez', club: 'Constitución Unido', numero: '16', posicion: 'Delantero centro', fechaNacimiento: '16/01/2003', altura: '1,75m', pie: 'Derecho', fichado: '25/03/2026', contrato: '-' },
  { nombre: 'Nicolás Martínez', club: 'Constitución Unido', numero: '16', posicion: 'Delantero', fechaNacimiento: '01/07/2004', altura: '-', pie: '', fichado: '', contrato: '-' },
  // ===== DEPORTES RANCAGUA =====
  { nombre: 'Bastián Fuentes', club: 'Deportes Rancagua', numero: '34', posicion: 'Portero', fechaNacimiento: '31/07/2001', altura: '1,84m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Lucas Espinoza', club: 'Deportes Rancagua', numero: '4', posicion: 'Defensa central', fechaNacimiento: '05/04/1999', altura: '1,77m', pie: 'Derecho', fichado: '24/03/2025', contrato: '-' },
  { nombre: 'Enzo Pérez', club: 'Deportes Rancagua', numero: '22', posicion: 'Defensa central', fechaNacimiento: '10/01/2005', altura: '-', pie: 'Derecho', fichado: '24/03/2025', contrato: '-' },
  { nombre: 'Mauricio Catalán', club: 'Deportes Rancagua', numero: '25', posicion: 'Defensa central', fechaNacimiento: '14/02/2003', altura: '1,83m', pie: 'Derecho', fichado: '26/03/2026', contrato: '-' },
  { nombre: 'Álvaro Arredondo', club: 'Deportes Rancagua', numero: '29', posicion: 'Defensa central', fechaNacimiento: '05/10/2004', altura: '1,73m', pie: 'Derecho', fichado: '20/01/2026', contrato: '31/12/2026' },
  { nombre: 'Luciano Iglesias', club: 'Deportes Rancagua', numero: '-', posicion: 'Lateral izquierdo', fechaNacimiento: '14/08/2004', altura: '-', pie: 'Izquierdo', fichado: '01/01/2026', contrato: '31/12/2026' },
  { nombre: 'Jorge Contreras', club: 'Deportes Rancagua', numero: '26', posicion: 'Lateral derecho', fechaNacimiento: '14/01/2003', altura: '-', pie: 'Derecho', fichado: '24/03/2025', contrato: '-' },
  { nombre: 'José Meneses', club: 'Deportes Rancagua', numero: '8', posicion: 'Pivote', fechaNacimiento: '-', altura: '-', pie: '', fichado: '05/01/2024', contrato: '-' },
  { nombre: 'Rony Albornoz', club: 'Deportes Rancagua', numero: '-', posicion: 'Mediocentro', fechaNacimiento: '23/09/2002', altura: '1,75m', pie: 'Derecho', fichado: '24/03/2025', contrato: '-' },
  { nombre: 'Julio Zúñiga', club: 'Deportes Rancagua', numero: '6', posicion: 'Mediocentro', fechaNacimiento: '21/02/2000', altura: '1,77m', pie: 'Derecho', fichado: '24/03/2025', contrato: '-' },
  { nombre: 'Alejandro Zúñiga', club: 'Deportes Rancagua', numero: '10', posicion: 'Mediocentro', fechaNacimiento: '21/11/2001', altura: '-', pie: '', fichado: '21/02/2024', contrato: '-' },
  { nombre: 'Ignacio Carreño', club: 'Deportes Rancagua', numero: '30', posicion: 'Mediocentro', fechaNacimiento: '24/08/2004', altura: '-', pie: '', fichado: '01/01/2026', contrato: '31/12/2026' },
  { nombre: 'Bryan Mardones', club: 'Deportes Rancagua', numero: '-', posicion: 'Mediocentro ofensivo', fechaNacimiento: '08/01/1996', altura: '1,74m', pie: 'Derecho', fichado: '24/03/2025', contrato: '-' },
  { nombre: 'Benjamín Miranda', club: 'Deportes Rancagua', numero: '20', posicion: 'Extremo izquierdo', fechaNacimiento: '08/03/2004', altura: '-', pie: 'Derecho', fichado: '25/03/2026', contrato: '31/12/2026' },
  { nombre: 'Mauricio Zenteno', club: 'Deportes Rancagua', numero: '9', posicion: 'Extremo izquierdo', fechaNacimiento: '22/05/2003', altura: '1,74m', pie: 'Derecho', fichado: '24/03/2025', contrato: '-' },
  { nombre: 'Diego Chávez', club: 'Deportes Rancagua', numero: '11', posicion: 'Extremo derecho', fechaNacimiento: '19/01/2000', altura: '1,75m', pie: 'Derecho', fichado: '26/01/2026', contrato: '31/12/2026' },
  { nombre: 'Nicolás Ibarra', club: 'Deportes Rancagua', numero: '24', posicion: 'Delantero centro', fechaNacimiento: '09/08/2005', altura: '-', pie: 'Derecho', fichado: '01/03/2026', contrato: '-' },
  // ===== IMPERIAL UNIDO =====
  { nombre: 'Víctor Castro', club: 'Imperial Unido', numero: '33', posicion: 'Portero', fechaNacimiento: '05/05/2001', altura: '1,88m', pie: 'Derecho', fichado: '28/01/2025', contrato: '-' },
  { nombre: 'Jeremy Rey', club: 'Imperial Unido', numero: '-', posicion: 'Defensa central', fechaNacimiento: '11/04/2001', altura: '-', pie: '', fichado: '01/01/2026', contrato: '31/12/2026' },
  { nombre: 'Bastián Bravo', club: 'Imperial Unido', numero: '-', posicion: 'Defensa central', fechaNacimiento: '14/07/2003', altura: '-', pie: '', fichado: '12/02/2026', contrato: '-' },
  { nombre: 'Benjamín Miranda', club: 'Imperial Unido', numero: '3', posicion: 'Defensa central', fechaNacimiento: '21/05/2003', altura: '-', pie: '', fichado: '16/01/2025', contrato: '-' },
  { nombre: 'Josthin Neira', club: 'Imperial Unido', numero: '4', posicion: 'Defensa central', fechaNacimiento: '04/03/2001', altura: '-', pie: 'Derecho', fichado: '', contrato: '-' },
  { nombre: 'Felipe Lee-Chong', club: 'Imperial Unido', numero: '13', posicion: 'Defensa central', fechaNacimiento: '21/10/1997', altura: '1,78m', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Camilo Fuentes', club: 'Imperial Unido', numero: '-', posicion: 'Lateral izquierdo', fechaNacimiento: '09/03/2000', altura: '-', pie: 'Izquierdo', fichado: '12/01/2025', contrato: '-' },
  { nombre: 'Agustín Peñailillo', club: 'Imperial Unido', numero: '-', posicion: 'Lateral derecho', fechaNacimiento: '05/03/2003', altura: '1,78m', pie: 'Derecho', fichado: '01/01/2026', contrato: '31/12/2026' },
  { nombre: 'Benjamin Manquilef', club: 'Imperial Unido', numero: '-', posicion: 'Lateral derecho', fechaNacimiento: '18/05/2001', altura: '1,75m', pie: 'Derecho', fichado: '18/03/2026', contrato: '-' },
  { nombre: 'José Gutiérrez', club: 'Imperial Unido', numero: '13', posicion: 'Lateral derecho', fechaNacimiento: '11/10/2002', altura: '1,75m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Matías Tapia', club: 'Imperial Unido', numero: '21', posicion: 'Lateral derecho', fechaNacimiento: '28/03/2002', altura: '1,80m', pie: 'Derecho', fichado: '01/02/2025', contrato: '-' },
  { nombre: 'Matías Toledo', club: 'Imperial Unido', numero: '21', posicion: 'Pivote', fechaNacimiento: '10/06/2000', altura: '1,78m', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Benjamín Iglesias', club: 'Imperial Unido', numero: '-', posicion: 'Mediocentro', fechaNacimiento: '02/08/2002', altura: '1,71m', pie: 'Derecho', fichado: '12/03/2026', contrato: '-' },
  { nombre: 'Matías Andrades', club: 'Imperial Unido', numero: '-', posicion: 'Mediocentro', fechaNacimiento: '31/08/2000', altura: '1,75m', pie: 'Derecho', fichado: '14/01/2026', contrato: '-' },
  { nombre: 'Jarol Chamorro', club: 'Imperial Unido', numero: '6', posicion: 'Mediocentro', fechaNacimiento: '16/06/2000', altura: '1,77m', pie: 'Derecho', fichado: '15/02/2024', contrato: '-' },
  { nombre: 'Bastián Henríquez', club: 'Imperial Unido', numero: '10', posicion: 'Extremo derecho', fechaNacimiento: '20/04/2000', altura: '1,71m', pie: 'Derecho', fichado: '10/01/2025', contrato: '-' },
  { nombre: 'Hernán Astudillo', club: 'Imperial Unido', numero: '26', posicion: 'Extremo izquierdo', fechaNacimiento: '08/06/2002', altura: '1,80m', pie: 'Izquierdo', fichado: '01/01/2025', contrato: '-' },
  // ===== RODELINDO ROMÁN =====
  { nombre: 'Elías Hartard', club: 'Rodelindo Román', numero: '12', posicion: 'Portero', fechaNacimiento: '18/05/1987', altura: '1,85m', pie: 'Derecho', fichado: '23/01/2026', contrato: '-' },
  { nombre: 'Álex Matamala', club: 'Rodelindo Román', numero: '3', posicion: 'Defensa central', fechaNacimiento: '18/01/2001', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Ronaldo Oyanedel', club: 'Rodelindo Román', numero: '21', posicion: 'Defensa central', fechaNacimiento: '04/05/2004', altura: '1,80m', pie: 'Derecho', fichado: '23/01/2026', contrato: '31/12/2026' },
  { nombre: 'Nicolás Fuentes F.', club: 'Rodelindo Román', numero: '6', posicion: 'Lateral derecho', fechaNacimiento: '16/02/2001', altura: '1,78m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Jorge Faúndez', club: 'Rodelindo Román', numero: '10', posicion: 'Pivote', fechaNacimiento: '13/04/1996', altura: '1,78m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Leonardo Vásquez', club: 'Rodelindo Román', numero: '8', posicion: 'Centrocampista', fechaNacimiento: '21/02/2001', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Matías Puebla', club: 'Rodelindo Román', numero: '5', posicion: 'Mediocentro', fechaNacimiento: '03/03/2004', altura: '1,67m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Brian Mondaca', club: 'Rodelindo Román', numero: '11', posicion: 'Mediocentro ofensivo', fechaNacimiento: '10/11/2003', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Bastián Castañeda', club: 'Rodelindo Román', numero: '7', posicion: 'Extremo derecho', fechaNacimiento: '22/05/1998', altura: '1,83m', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Matías Morales', club: 'Rodelindo Román', numero: '24', posicion: 'Extremo derecho', fechaNacimiento: '21/02/2004', altura: '1,72m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Víctor Vásquez', club: 'Rodelindo Román', numero: '9', posicion: 'Delantero centro', fechaNacimiento: '15/08/2004', altura: '-', pie: 'Derecho', fichado: '01/04/2026', contrato: '31/12/2026', valorMercado: '25 mil €' },
  { nombre: 'Martín Garrido', club: 'Rodelindo Román', numero: '30', posicion: 'Delantero centro', fechaNacimiento: '09/11/2001', altura: '-', pie: 'Derecho', fichado: '01/01/2026', contrato: '-' },
  // ===== CHIMBARONGO F.C =====
  { nombre: 'Leonardo Alegría', club: 'Chimbarongo F.C', numero: '-', posicion: 'Portero', fechaNacimiento: '05/01/2004', altura: '-', pie: '', fichado: '06/02/2026', contrato: '-' },
  { nombre: 'Cristóbal López', club: 'Chimbarongo F.C', numero: '1', posicion: 'Portero', fechaNacimiento: '14/01/1989', altura: '1,85m', pie: 'Derecho', fichado: '07/02/2024', contrato: '-' },
  { nombre: 'Alberto Acevedo', club: 'Chimbarongo F.C', numero: '12', posicion: 'Portero', fechaNacimiento: '01/07/2005', altura: '-', pie: '', fichado: '06/02/2024', contrato: '-' },
  { nombre: 'Fabián Espinoza F.', club: 'Chimbarongo F.C', numero: '3', posicion: 'Defensa central', fechaNacimiento: '25/06/2003', altura: '-', pie: 'Izquierdo', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Matías Torres Véliz', club: 'Chimbarongo F.C', numero: '23', posicion: 'Defensa central', fechaNacimiento: '29/01/2001', altura: '1,84m', pie: 'Derecho', fichado: '01/03/2026', contrato: '31/12/2026' },
  { nombre: 'Jaime Arévalo', club: 'Chimbarongo F.C', numero: '33', posicion: 'Defensa central', fechaNacimiento: '05/01/2004', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Nicolás Vergara', club: 'Chimbarongo F.C', numero: '-', posicion: 'Lateral izquierdo', fechaNacimiento: '09/04/2003', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Santiago Medina', club: 'Chimbarongo F.C', numero: '22', posicion: 'Lateral izquierdo', fechaNacimiento: '14/02/2006', altura: '1,73m', pie: 'Izquierdo', fichado: '01/03/2026', contrato: '31/12/2026' },
  { nombre: 'Nicolás Ubilla', club: 'Chimbarongo F.C', numero: '20', posicion: 'Lateral derecho', fechaNacimiento: '28/02/2001', altura: '1,73m', pie: 'Derecho', fichado: '01/01/2024', contrato: '-' },
  { nombre: 'Ignacio Vallejos', club: 'Chimbarongo F.C', numero: '6', posicion: 'Pivote', fechaNacimiento: '24/03/2002', altura: '1,71m', pie: '', fichado: '01/01/2026', contrato: '-' },
  { nombre: 'Diego Urzúa', club: 'Chimbarongo F.C', numero: '9', posicion: 'Mediocentro', fechaNacimiento: '04/02/1997', altura: '1,75m', pie: 'Derecho', fichado: '19/03/2026', contrato: '-' },
  { nombre: 'Renato Beltrán', club: 'Chimbarongo F.C', numero: '35', posicion: 'Mediocentro', fechaNacimiento: '04/08/2002', altura: '1,73m', pie: 'Derecho', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Luis Muñoz Faúndez', club: 'Chimbarongo F.C', numero: '8', posicion: 'Mediocentro ofensivo', fechaNacimiento: '-', altura: '-', pie: 'Derecho', fichado: '26/01/2025', contrato: '-' },
  { nombre: 'Massami Gutiérrez', club: 'Chimbarongo F.C', numero: '7', posicion: 'Extremo derecho', fechaNacimiento: '16/08/2003', altura: '1,68m', pie: 'Derecho', fichado: '18/01/2026', contrato: '-' },
  { nombre: 'Luis Silva Gaunes', club: 'Chimbarongo F.C', numero: '10', posicion: 'Extremo derecho', fechaNacimiento: '05/05/2000', altura: '1,77m', pie: 'Derecho', fichado: '01/01/2026', contrato: '31/12/2026' },
  // ===== FUTURO =====
  { nombre: 'Tomas Meyer', club: 'Futuro', numero: '1', posicion: 'Portero', fechaNacimiento: '14/03/2001', altura: '-', pie: '', fichado: '07/04/2026', contrato: '-' },
  { nombre: 'Hernán Ulloa', club: 'Futuro', numero: '3', posicion: 'Defensa central', fechaNacimiento: '23/10/2001', altura: '1,82m', pie: 'Derecho', fichado: '07/04/2026', contrato: '-' },
  { nombre: 'Ignacio Aguilar', club: 'Futuro', numero: '4', posicion: 'Defensa central', fechaNacimiento: '11/12/2000', altura: '1,80m', pie: 'Izquierdo', fichado: '07/04/2025', contrato: '-' },
  { nombre: 'Luciano Cárcamo', club: 'Futuro', numero: '17', posicion: 'Defensa central', fechaNacimiento: '07/11/2004', altura: '-', pie: 'Derecho', fichado: '04/04/2025', contrato: '-' },
  { nombre: 'Kevin Leiva', club: 'Futuro', numero: '28', posicion: 'Lateral izquierdo', fechaNacimiento: '22/09/1999', altura: '1,80m', pie: 'Izquierdo', fichado: '02/07/2025', contrato: '-' },
  { nombre: 'Isaac Crisóstomo', club: 'Futuro', numero: '32', posicion: 'Lateral izquierdo', fechaNacimiento: '10/12/2003', altura: '1,70m', pie: 'Izquierdo', fichado: '07/04/2026', contrato: '-' },
  { nombre: 'Leandro Espinoza', club: 'Futuro', numero: '5', posicion: 'Lateral derecho', fechaNacimiento: '04/04/2003', altura: '-', pie: 'Derecho', fichado: '07/04/2026', contrato: '-' },
  { nombre: 'Isaías Arias', club: 'Futuro', numero: '20', posicion: 'Lateral derecho', fechaNacimiento: '-', altura: '-', pie: '', fichado: '29/03/2024', contrato: '-' },
  { nombre: 'Benjamín Vásquez', club: 'Futuro', numero: '2', posicion: 'Mediocentro', fechaNacimiento: '16/11/2004', altura: '-', pie: '', fichado: '07/04/2026', contrato: '-' },
  { nombre: 'Ángel Melo', club: 'Futuro', numero: '10', posicion: 'Mediocentro ofensivo', fechaNacimiento: '28/08/1997', altura: '1,71m', pie: 'Derecho', fichado: '08/04/2025', contrato: '-' },
  { nombre: 'Benjamín Soto', club: 'Futuro', numero: '16', posicion: 'Mediocentro ofensivo', fechaNacimiento: '16/04/2002', altura: '1,75m', pie: 'Izquierdo', fichado: '07/04/2026', contrato: '-' },
  { nombre: 'Javier Gonzalez', club: 'Futuro', numero: '7', posicion: 'Extremo izquierdo', fechaNacimiento: '23/09/2002', altura: '-', pie: 'Derecho', fichado: '01/04/2024', contrato: '-' },
  { nombre: 'Sebastián Medina', club: 'Futuro', numero: '27', posicion: 'Extremo izquierdo', fechaNacimiento: '19/07/2000', altura: '-', pie: '', fichado: '01/01/2025', contrato: '-' },
  { nombre: 'Joaquín Albornoz', club: 'Futuro', numero: '17', posicion: 'Extremo derecho', fechaNacimiento: '06/08/2003', altura: '-', pie: 'Derecho', fichado: '07/04/2026', contrato: '-' },
  { nombre: 'Yerko Rojas', club: 'Futuro', numero: '-', posicion: 'Delantero centro', fechaNacimiento: '06/10/1995', altura: '1,73m', pie: 'Derecho', fichado: '10/04/2025', contrato: '-' },
  { nombre: 'Matías Zamorano', club: 'Futuro', numero: '-', posicion: 'Delantero centro', fechaNacimiento: '-', altura: '-', pie: '', fichado: '27/03/2024', contrato: '-' },
  { nombre: 'Lukas Román', club: 'Futuro', numero: '11', posicion: 'Delantero centro', fechaNacimiento: '25/01/2002', altura: '1,84m', pie: 'Derecho', fichado: '08/04/2025', contrato: '-' },
  { nombre: 'José Mateo Cabrera', club: 'Futuro', numero: '15', posicion: 'Delantero centro', fechaNacimiento: '-', altura: '-', pie: '', fichado: '07/04/2026', contrato: '-' },
  // ===== MUNICIPAL PUENTE ALTO =====
  { nombre: 'Pablo Lagos', club: 'Municipal Puente Alto', numero: '1', posicion: 'Portero', fechaNacimiento: '01/01/2004', altura: '1,80m', pie: 'Derecho', fichado: '05/02/2025', contrato: '-' },
  { nombre: 'Johan Gamboa', club: 'Municipal Puente Alto', numero: '12', posicion: 'Portero', fechaNacimiento: '28/06/2001', altura: '1,78m', pie: 'Derecho', fichado: '', contrato: '-' },
  { nombre: 'Benjamín Romo', club: 'Municipal Puente Alto', numero: '5', posicion: 'Defensa central', fechaNacimiento: '23/10/2002', altura: '1,85m', pie: 'Derecho', fichado: '25/02/2023', contrato: '31/12/2026' },
  { nombre: 'Esteban Vargas', club: 'Municipal Puente Alto', numero: '24', posicion: 'Defensa central', fechaNacimiento: '25/07/1997', altura: '-', pie: 'Derecho', fichado: '', contrato: '05/04/2024' },
  { nombre: 'Matías Ferrari', club: 'Municipal Puente Alto', numero: '2', posicion: 'Lateral derecho', fechaNacimiento: '08/01/2000', altura: '1,82m', pie: 'Derecho', fichado: '13/04/2024', contrato: '-' },
  { nombre: 'Ignacio Ayala', club: 'Municipal Puente Alto', numero: '28', posicion: 'Lateral derecho', fechaNacimiento: '29/11/1997', altura: '1,69m', pie: 'Derecho', fichado: '', contrato: '26/03/2026' },
  { nombre: 'Carlos Rojas Huete', club: 'Municipal Puente Alto', numero: '4', posicion: 'Pivote', fechaNacimiento: '12/02/2001', altura: '-', pie: '', fichado: '05/04/2024', contrato: '-' },
  { nombre: 'Ignacio López', club: 'Municipal Puente Alto', numero: '6', posicion: 'Pivote', fechaNacimiento: '13/11/2004', altura: '-', pie: 'Derecho', fichado: '', contrato: '01/01/2024' },
  { nombre: 'Rodrigo Flores', club: 'Municipal Puente Alto', numero: '8', posicion: 'Mediocentro', fechaNacimiento: '03/06/2001', altura: '-', pie: 'Derecho', fichado: '', contrato: '-' },
  { nombre: 'Lucas Díaz', club: 'Municipal Puente Alto', numero: '11', posicion: 'Mediocentro', fechaNacimiento: '20/07/2005', altura: '1,88m', pie: 'Derecho', fichado: '', contrato: '28/03/2026' },
  { nombre: 'David Peña', club: 'Municipal Puente Alto', numero: '16', posicion: 'Mediocentro', fechaNacimiento: '09/10/2003', altura: '-', pie: '', fichado: '05/04/2024', contrato: '-' },
  { nombre: 'Nicolás Riquelme', club: 'Municipal Puente Alto', numero: '10', posicion: 'Mediocentro ofensivo', fechaNacimiento: '13/12/2001', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Fabián Salazar', club: 'Municipal Puente Alto', numero: '14', posicion: 'Extremo izquierdo', fechaNacimiento: '09/08/2001', altura: '-', pie: '', fichado: '', contrato: '-' },
  { nombre: 'Emerson Figueroa', club: 'Municipal Puente Alto', numero: '9', posicion: 'Delantero centro', fechaNacimiento: '09/10/2002', altura: '1,81m', pie: 'Derecho', fichado: '', contrato: '01/01/2023' },
  { nombre: 'José Palma', club: 'Municipal Puente Alto', numero: '15', posicion: 'Delantero centro', fechaNacimiento: '19/03/2004', altura: '1,83m', pie: '', fichado: '28/03/2026', contrato: '-' },
  { nombre: 'Jesús Gacitua', club: 'Municipal Puente Alto', numero: '22', posicion: 'Delantero centro', fechaNacimiento: '07/12/2003', altura: '-', pie: 'Derecho', fichado: '', contrato: '01/01/2025' },
];

const POSITION_MAP: Record<string, string> = {
  volante: 'Mediocampista',
  delantero: 'Delantero',
  defensa: 'Defensa',
  portero: 'Portero',
};

function normalizePosition(raw: string): string {
  const p = raw.toLowerCase().trim();
  if (p === 'portero') return 'Portero';
  if (p.includes('defensa') || p.includes('lateral')) return 'Defensa';
  if (p.includes('delantero') || p.includes('extremo') || p === 'delantero') return 'Delantero';
  if (p.includes('mediocentro') || p.includes('centrocampista') || p.includes('pivote') || p.includes('interior') || p === 'volante' || p === 'mediocentro') return 'Mediocampista';
  return 'Mediocampista';
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '');
}

function matchEquipo(rawName: string, equipos: Equipo[]): Equipo | null {
  const q = normalize(rawName);
  for (const eq of equipos) {
    const eqName = normalize(eq.nombre);
    if (eqName.includes(q) || q.includes(eqName)) return eq;
  }
  return null;
}

function splitName(full: string): { nombre: string; apellido: string } {
  const idx = full.indexOf(' ');
  if (idx === -1) return { nombre: full, apellido: '' };
  return { nombre: full.slice(0, idx), apellido: full.slice(idx + 1).trim() };
}

function parseDate(str: string): number {
  if (!str || str === '-' || str === '(-)') return 0;
  const clean = str.replace(/\s*\(.*?\)\s*/g, '').trim();
  if (!clean) return 0;
  const parts = clean.split('/');
  if (parts.length !== 3) return 0;
  const d = parseInt(parts[0]), m = parseInt(parts[1]) - 1, y = parseInt(parts[2]);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return 0;
  return new Date(y, m, d).getTime();
}

function parseAltura(str: string): number {
  if (!str || str === '-' || str === '(-)') return 0;
  const clean = str.replace(',', '.').replace('m', '').trim();
  const h = parseFloat(clean);
  return isNaN(h) ? 0 : Math.round(h * 100);
}

function parseContract(str: string): string {
  if (!str || str === '-' || str === '(-)') return '';
  return str.trim();
}

export default function ImportarJugadoresPage() {
  const { equipos } = useEquipos();
  const [existingJugadores, setExistingJugadores] = useState<any[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [importing, setImporting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [errores, setErrores] = useState<string[]>([]);
  const [dataMode, setDataMode] = useState<'raw' | 'detailed'>('raw');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'jugadores')), (snap) => {
      setExistingJugadores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingExisting(false);
    });
    return () => unsub();
  }, []);

  const findMatch = (nombre: string, clubId: string): any | null => {
    const q = normalize(nombre);
    return existingJugadores.find((j: any) => {
      const jq = normalize(j.nombreCompleto || '');
      const sameClub = j.equipoId === clubId;
      return sameClub && (jq.includes(q) || q.includes(jq));
    }) || null;
  };

  const importRaw = async () => {
    setImporting(true);
    setLog([]);
    setErrores([]);
    let ok = 0, err = 0, skipped = 0;

    for (const raw of RAW_DATA) {
      const key = raw.nombre.toLowerCase().trim();
      if (existingJugadores.some((j: any) => (j.nombreCompleto || '').toLowerCase().trim() === key)) {
        skipped++;
        setLog(prev => [...prev, `⏭ ${raw.nombre} — ya existe`]);
        continue;
      }
      const equipo = matchEquipo(raw.club, equipos);
      if (!equipo) {
        err++; setLog(prev => [...prev, `❌ ${raw.nombre} — no se encontro equipo para "${raw.club}"`]);
        continue;
      }
      const posicionNormalizada = POSITION_MAP[raw.posicion.toLowerCase()] || 'Mediocampista';
      const { nombre, apellido } = splitName(raw.nombre);
      try {
        await addDoc(collection(db, 'jugadores'), {
          nombre, apellido, nombreCompleto: raw.nombre.trim(), equipoId: equipo.id,
          deporteId: equipo.deporteId || '', numero: 0, posicion: posicionNormalizada, fotoBase64: '',
          fechaNacimiento: 0, nacionalidad: 'Chilena', altura: 0, peso: 0, pie: 'Derecho',
          fichado: '', contratoHasta: '', valorMercado: '', activo: true,
          estadisticasTemp: { goles: raw.goles }, temporadaActual: '2026',
        });
        ok++;
        setLog(prev => [...prev, `✅ ${raw.nombre} (${equipo.nombre}, ${posicionNormalizada}, ${raw.goles} g)`]);
      } catch (e: any) {
        err++;
        setLog(prev => [...prev, `❌ ${raw.nombre} — error al guardar`]);
      }
    }
    setLog(prev => [...prev, '', `📊 ${ok} insertados, ${skipped} omitidos, ${err} errores`]);
    setImporting(false);
  };

  const updateDetailed = async () => {
    setUpdating(true);
    setLog([]);
    setErrores([]);
    let inserted = 0, updated = 0, skipped = 0, err = 0, moved = 0;

    for (const d of DETALLED_DATA) {
      const equipo = matchEquipo(d.club, equipos);
      if (!equipo) {
        err++;
        setLog(prev => [...prev, `❌ ${d.nombre} — no se encontro equipo para "${d.club}"`]);
        continue;
      }

      const pos = normalizePosition(d.posicion);
      const fechaNac = parseDate(d.fechaNacimiento);
      const altura = parseAltura(d.altura);
      const pie = d.pie && d.pie !== '-' ? d.pie : 'Derecho';
      const fichado = parseContract(d.fichado);
      const contrato = parseContract(d.contrato);
      const valor = d.valorMercado || '';
      const num = d.numero && d.numero !== '-' ? parseInt(d.numero) : 0;
      const { nombre, apellido } = splitName(d.nombre);

      const match = findMatch(d.nombre, equipo.id);

      if (match) {
        const updateData: any = {};
        if (num && match.numero !== num) updateData.numero = num;
        if (match.posicion !== pos) updateData.posicion = pos;
        if (fechaNac && match.fechaNacimiento !== fechaNac) updateData.fechaNacimiento = fechaNac;
        if (altura && match.altura !== altura) updateData.altura = altura;
        if (match.pie !== pie) updateData.pie = pie;
        if (fichado && match.fichado !== fichado) updateData.fichado = fichado;
        if (contrato && match.contratoHasta !== contrato) updateData.contratoHasta = contrato;
        if (valor && match.valorMercado !== valor) updateData.valorMercado = valor;
        if (match.deporteId !== equipo.deporteId) updateData.deporteId = equipo.deporteId || '';

        if (Object.keys(updateData).length > 0) {
          try {
            await updateDoc(doc(db, 'jugadores', match.id), { ...updateData, actualizadoEn: Date.now() });
            updated++;
            setLog(prev => [...prev, `🔄 ${d.nombre} — ${Object.keys(updateData).length} campos actualizados`]);
          } catch (e: any) {
            err++;
            setLog(prev => [...prev, `❌ ${d.nombre} — error al actualizar`]);
          }
        } else {
          skipped++;
          setLog(prev => [...prev, `⏭ ${d.nombre} — sin cambios`]);
        }
      } else {
        // Try to find in different club (for moves like Ignacio Flores, Mateo Toro)
        const matchOtherClub = existingJugadores.find((j: any) => {
          const jq = normalize(j.nombreCompleto || '');
          const q = normalize(d.nombre);
          return jq.includes(q) || q.includes(jq);
        });

        if (matchOtherClub) {
          try {
            await updateDoc(doc(db, 'jugadores', matchOtherClub.id), {
              equipoId: equipo.id,
              deporteId: equipo.deporteId || '',
              numero: num,
              posicion: pos,
              altura,
              pie,
              fechaNacimiento: fechaNac,
              fichado,
              contratoHasta: contrato,
              valorMercado: valor,
              actualizadoEn: Date.now(),
            });
            moved++;
            setLog(prev => [...prev, `📦 ${d.nombre} — movido a ${equipo.nombre}`]);
          } catch (e: any) {
            err++;
            setLog(prev => [...prev, `❌ ${d.nombre} — error al mover`]);
          }
        } else {
          try {
            await addDoc(collection(db, 'jugadores'), {
              nombre, apellido, nombreCompleto: d.nombre.trim(), equipoId: equipo.id,
              deporteId: equipo.deporteId || '', numero: num, posicion: pos, fotoBase64: '',
              fechaNacimiento: fechaNac, nacionalidad: 'Chilena', altura, peso: 0, pie,
              fichado, contratoHasta: contrato, valorMercado: valor, activo: true,
              estadisticasTemp: {}, temporadaActual: '2026',
            });
            inserted++;
            setLog(prev => [...prev, `✅ ${d.nombre} (${equipo.nombre}, ${pos})`]);
          } catch (e: any) {
            err++;
            setLog(prev => [...prev, `❌ ${d.nombre} — error al insertar`]);
          }
        }
      }
    }

    setLog(prev => [...prev, '', `📊 ${inserted} insertados, ${updated} actualizados, ${moved} movidos, ${skipped} sin cambios, ${err} errores`]);
    setUpdating(false);
  };

  const allClubes = [...new Set(RAW_DATA.map(p => p.club)), ...new Set(DETALLED_DATA.map(p => p.club))].sort();
  const detailedClubes = [...new Set(DETALLED_DATA.map(p => p.club))].sort();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[var(--text)]">Importar / Actualizar Jugadores</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {RAW_DATA.length} registros basicos · {DETALLED_DATA.length} detallados · {allClubes.length} clubes
        </p>
      </div>

      {loadingExisting ? (
        <Loader size="sm" />
      ) : (
        <>
          {/* Mode selector */}
          <div className="flex gap-2">
            <button onClick={() => setDataMode('raw')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', dataMode === 'raw' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
              Datos basicos ({RAW_DATA.length})
            </button>
            <button onClick={() => setDataMode('detailed')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', dataMode === 'detailed' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]')}>
              Datos detallados ({DETALLED_DATA.length})
            </button>
          </div>

          {/* Club summary */}
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--accent)]" /> Clubes {dataMode === 'raw' ? 'basicos' : 'detallados'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {(dataMode === 'raw' ? [...new Set(RAW_DATA.map(p => p.club))].sort() : detailedClubes).map((c) => {
                const eq = matchEquipo(c, equipos);
                const count = dataMode === 'raw' ? RAW_DATA.filter(p => p.club === c).length : DETALLED_DATA.filter(p => p.club === c).length;
                return (
                  <div key={c} className={cn('flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border text-xs', eq ? 'border-emerald-500/30 bg-emerald-500/[0.05]' : 'border-red-500/30 bg-red-500/[0.05]')}>
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
              <p className="text-2xl font-black text-[var(--text)]">{dataMode === 'raw' ? RAW_DATA.length : DETALLED_DATA.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Registros totales</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <p className="text-2xl font-black text-[var(--text)]">{dataMode === 'raw' ? [...new Set(RAW_DATA.map(p => p.club))].length : detailedClubes.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Clubes</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <p className="text-2xl font-black text-[var(--text)]">{existingJugadores.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Jugadores existentes</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <p className="text-2xl font-black text-[var(--text)]">{dataMode === 'raw' ? RAW_DATA.length - existingJugadores.length : DETALLED_DATA.length}</p>
              <p className="text-xs text-[var(--text-muted)]">A procesar</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataMode === 'raw' ? (
              <Button onClick={importRaw} loading={importing} disabled={importing} size="lg">
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Importando...' : `Importar ${RAW_DATA.length} jugadores basicos`}
              </Button>
            ) : (
              <Button onClick={updateDetailed} loading={updating} disabled={updating} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                {updating ? 'Actualizando...' : `Actualizar e insertar ${DETALLED_DATA.length} registros`}
              </Button>
            )}
          </div>

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
                    line.startsWith('❌') ? 'text-red-400' : line.startsWith('✅') ? 'text-emerald-400' : line.startsWith('🔄') ? 'text-sky-400' : line.startsWith('📦') ? 'text-amber-400' : line.startsWith('⏭') ? 'text-yellow-400' : line.startsWith('📊') ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
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
