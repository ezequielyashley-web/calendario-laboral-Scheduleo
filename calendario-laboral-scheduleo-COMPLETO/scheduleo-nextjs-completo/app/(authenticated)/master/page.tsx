// app/(authenticated)/master/page.tsx
// Dashboard Analytics - Diseño Corporativo Profesional

import { Suspense } from 'react';
import Header from '@/components/master/Header';
import DashboardStats from '@/components/master/DashboardStats';

async function getDashboardData() {
  // En producción, esto vendría de tu API
  return {
    stats: {
      totalEmpleados: 68,
      empleadosActivos: 65,
      empleadosInactivos: 3,
      totalAdmins: 5,
      solicitudesPendientes: 7,
      bajasActivas: 3,
      tasaOcupacion: 94,
    },
    distribucionSedes: [
      { tipo: 'PESCADERIA' as const, nombre: 'Pescadería Central', cantidad: 45 },
      { tipo: 'RESTAURANTE' as const, nombre: 'Restaurante Norte', cantidad: 15 },
      { tipo: 'CATERING' as const, nombre: 'Catering Eventos', cantidad: 8 },
    ],
    distribucionGrupos: [
      { grupo: 'ENTRE_SEMANA_A', cantidad: 23 },
      { grupo: 'ENTRE_SEMANA_B', cantidad: 22 },
      { grupo: 'ENTRE_SEMANA_C', cantidad: 23 },
    ],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <Header 
        title="Dashboard Analytics" 
        subtitle="Vista ejecutiva de operaciones y recursos"
      />

      <main className="pt-16 p-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardStats data={data} />
        </Suspense>
      </main>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
