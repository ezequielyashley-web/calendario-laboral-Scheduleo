// app/(authenticated)/master/calendario/page.tsx
// Calendario Global Anual - Vista 12 meses simultáneos

import { Suspense } from 'react';
import Header from '@/components/master/Header';
import CalendarioAnual from '@/components/master/CalendarioAnual';
import { ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';

async function getCalendarioData() {
  const currentYear = 2026;
  
  // En producción vendría de tu API
  return {
    year: currentYear,
    empleados: 68,
    diasLaborables: 252,
    festivos: 14,
    eventos: [
      { fecha: '2026-01-01', tipo: 'festivo', nombre: 'Año Nuevo' },
      { fecha: '2026-01-06', tipo: 'festivo', nombre: 'Reyes Magos' },
      { fecha: '2026-04-03', tipo: 'festivo', nombre: 'Viernes Santo' },
      { fecha: '2026-04-06', tipo: 'festivo', nombre: 'Lunes de Pascua' },
      { fecha: '2026-05-01', tipo: 'festivo', nombre: 'Día del Trabajo' },
      { fecha: '2026-08-15', tipo: 'festivo', nombre: 'Asunción' },
      { fecha: '2026-10-12', tipo: 'festivo', nombre: 'Día de la Hispanidad' },
      { fecha: '2026-11-01', tipo: 'festivo', nombre: 'Todos los Santos' },
      { fecha: '2026-12-06', tipo: 'festivo', nombre: 'Constitución' },
      { fecha: '2026-12-08', tipo: 'festivo', nombre: 'Inmaculada' },
      { fecha: '2026-12-25', tipo: 'festivo', nombre: 'Navidad' },
    ],
    gruposActivos: {
      ENTRE_SEMANA_A: 23,
      ENTRE_SEMANA_B: 22,
      ENTRE_SEMANA_C: 23,
    }
  };
}

export default async function CalendarioPage() {
  const data = await getCalendarioData();

  return (
    <>
      <Header 
        title="Calendario Global" 
        subtitle={`Vista anual ${data.year} - ${data.empleados} empleados activos`}
      />

      <main className="pt-16 p-6">
        {/* Controles superiores */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            {/* Navegación año */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-md border border-slate-300 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 bg-slate-50 rounded-md border border-slate-200">
                <span className="text-lg font-bold text-slate-900">{data.year}</span>
              </div>
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-md border border-slate-300 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                Hoy
              </button>
            </div>

            {/* Filtros y acciones */}
            <div className="flex items-center gap-3">
              {/* Selector grupo */}
              <select className="px-3 py-2 text-sm font-medium border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todos los grupos</option>
                <option value="ENTRE_SEMANA_A">Entre semana A ({data.gruposActivos.ENTRE_SEMANA_A})</option>
                <option value="ENTRE_SEMANA_B">Entre semana B ({data.gruposActivos.ENTRE_SEMANA_B})</option>
                <option value="ENTRE_SEMANA_C">Entre semana C ({data.gruposActivos.ENTRE_SEMANA_C})</option>
              </select>

              {/* Botón filtros */}
              <button className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </button>

              {/* Exportar */}
              <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-6 mb-6 px-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded"></div>
            <span className="text-xs font-medium text-slate-600">Día laboral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-700 rounded"></div>
            <span className="text-xs font-medium text-slate-600">Domingo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-xs font-medium text-slate-600">Festivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
            <span className="text-xs font-medium text-slate-600">Vacaciones programadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
            <span className="text-xs font-medium text-slate-600">Baja médica</span>
          </div>
        </div>

        {/* Calendario 12 meses */}
        <Suspense fallback={<CalendarioSkeleton />}>
          <CalendarioAnual year={data.year} eventos={data.eventos} />
        </Suspense>
      </main>
    </>
  );
}

function CalendarioSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="h-80 bg-slate-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
