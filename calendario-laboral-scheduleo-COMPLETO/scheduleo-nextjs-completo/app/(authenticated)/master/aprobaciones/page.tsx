// app/(authenticated)/master/aprobaciones/page.tsx
// Centro de Aprobaciones - Vista Múltiple

import { Suspense } from 'react';
import Header from '@/components/master/Header';
import CentroAprobaciones from '@/components/master/CentroAprobaciones';

async function getAprobacionesData() {
  // En producción vendría de tu API
  return {
    solicitudesVacaciones: [
      {
        id: 'vac_1',
        empleado: { id: 'emp_5', nombre: 'Pedro González Díaz', puesto: 'Reponedor', sede: 'Pescadería Central' },
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-15',
        dias: 15,
        tipo: 'verano',
        fechaSolicitud: '2026-05-20',
        estado: 'pendiente',
        comentarios: 'Vacaciones de verano planificadas',
      },
      {
        id: 'vac_2',
        empleado: { id: 'emp_12', nombre: 'Carmen Navarro Gil', puesto: 'Cajero', sede: 'Restaurante Norte' },
        fechaInicio: '2026-08-10',
        fechaFin: '2026-08-20',
        dias: 11,
        tipo: 'verano',
        fechaSolicitud: '2026-05-22',
        estado: 'pendiente',
        comentarios: '',
      },
      {
        id: 'vac_3',
        empleado: { id: 'emp_18', nombre: 'Rosa Iglesias Fuentes', puesto: 'Cajero', sede: 'Pescadería Central' },
        fechaInicio: '2026-12-23',
        fechaFin: '2026-12-31',
        dias: 9,
        tipo: 'navidad',
        fechaSolicitud: '2026-05-25',
        estado: 'pendiente',
        comentarios: 'Vacaciones de Navidad con familia',
      },
    ],
    cambiosTurno: [
      {
        id: 'cambio_1',
        solicitante: { id: 'emp_3', nombre: 'Carlos Sánchez Ruiz', puesto: 'Encargado' },
        destino: { id: 'emp_7', nombre: 'David Martínez Castro', puesto: 'Cajero' },
        fecha: '2026-06-15',
        turnoOrigen: 'Mañana (08:00 - 16:00)',
        turnoDestino: 'Tarde (16:00 - 00:00)',
        motivo: 'Cita médica por la tarde',
        fechaSolicitud: '2026-06-01',
        estado: 'pendiente',
        aceptadoPorDestino: true,
      },
      {
        id: 'cambio_2',
        solicitante: { id: 'emp_15', nombre: 'Francisco Cruz Medina', puesto: 'Cajero' },
        destino: { id: 'emp_20', nombre: 'Cristina Vidal Santos', puesto: 'Encargado' },
        fecha: '2026-06-20',
        turnoOrigen: 'Tarde (16:00 - 00:00)',
        turnoDestino: 'Mañana (08:00 - 16:00)',
        motivo: 'Asunto personal urgente',
        fechaSolicitud: '2026-06-05',
        estado: 'pendiente',
        aceptadoPorDestino: true,
      },
    ],
    bajasIT: [
      {
        id: 'baja_1',
        empleado: { id: 'emp_8', nombre: 'Isabel Romero Ortiz', puesto: 'Encargado', sede: 'Pescadería Central' },
        fechaInicio: '2026-06-01',
        dias: 7,
        tipo: 'enfermedad',
        documentoURL: '/uploads/baja-it-001.pdf',
        ocrDatos: {
          nombrePaciente: 'Isabel Romero Ortiz',
          dni: '23456789B',
          diagnostico: 'Gripe',
          duracion: '7 días',
          medico: 'Dr. García López',
        },
        fechaRecepcion: '2026-06-01T09:30:00',
        estadoOCR: 'completado',
        estado: 'pendiente',
      },
      {
        id: 'baja_2',
        empleado: { id: 'emp_14', nombre: 'Lucía Herrera Mora', puesto: 'Encargado', sede: 'Restaurante Norte' },
        fechaInicio: '2026-06-03',
        dias: 3,
        tipo: 'accidente',
        documentoURL: '/uploads/baja-it-002.pdf',
        ocrDatos: {
          nombrePaciente: 'Lucía Herrera Mora',
          dni: '34567890C',
          diagnostico: 'Esguince tobillo',
          duracion: '3 días',
          medico: 'Dra. Martínez Ruiz',
        },
        fechaRecepcion: '2026-06-03T11:15:00',
        estadoOCR: 'completado',
        estado: 'pendiente',
      },
    ],
    stats: {
      totalPendientes: 7,
      vacaciones: 3,
      cambios: 2,
      bajasIT: 2,
    }
  };
}

export default async function AprobacionesPage() {
  const data = await getAprobacionesData();

  return (
    <>
      <Header 
        title="Centro de Aprobaciones" 
        subtitle={`${data.stats.totalPendientes} solicitudes pendientes de revisión`}
      />

      <main className="pt-16 p-6">
        <Suspense fallback={<AprobacionesSkeleton />}>
          <CentroAprobaciones data={data} />
        </Suspense>
      </main>
    </>
  );
}

function AprobacionesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
