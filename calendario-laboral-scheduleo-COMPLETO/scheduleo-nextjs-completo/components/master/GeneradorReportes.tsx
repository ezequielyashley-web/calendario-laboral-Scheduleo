// components/master/GeneradorReportes.tsx
'use client';

import { useState } from 'react';
import {
  TipoReporte,
  FormatoExportacion,
  PeriodoReporte,
  ConfiguracionReporte,
  TIPO_REPORTE_LABELS,
  TIPO_REPORTE_ICONS,
  TIPO_REPORTE_COLORS,
} from '@/types/reportes';

export default function GeneradorReportes() {
  const [config, setConfig] = useState<ConfiguracionReporte>({
    tipo: 'ASISTENCIA',
    periodo: 'MENSUAL',
    incluirGraficos: true,
    incluirResumen: true,
    formato: 'EXCEL',
  });

  const [generando, setGenerando] = useState(false);

  const handleGenerar = async () => {
    setGenerando(true);
    
    // Simular generación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Generando reporte:', config);
    
    // Aquí iría la llamada a la API
    // const response = await fetch('/api/reportes/generar', {
    //   method: 'POST',
    //   body: JSON.stringify(config)
    // });
    
    setGenerando(false);
    
    // Simular descarga
    alert(`Reporte ${TIPO_REPORTE_LABELS[config.tipo]} generado exitosamente en formato ${config.formato}`);
  };

  const tiposReporte: TipoReporte[] = [
    'ASISTENCIA',
    'VACACIONES',
    'HORAS_EXTRAS',
    'DEUDAS_ADELANTOS',
    'COBERTURA',
    'BAJAS_MEDICAS',
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Selector de Tipo de Reporte */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Selecciona el tipo de reporte</h3>
        <div className="grid grid-cols-3 gap-4">
          {tiposReporte.map((tipo) => {
            const colors = TIPO_REPORTE_COLORS[tipo];
            const icon = TIPO_REPORTE_ICONS[tipo];
            const activo = config.tipo === tipo;

            return (
              <button
                key={tipo}
                onClick={() => setConfig((prev) => ({ ...prev, tipo }))}
                className={`${colors.bg} border-2 ${activo ? colors.border : 'border-transparent'} rounded-lg p-4 hover:shadow-md transition-all ${
                  activo ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
              >
                <div className="text-3xl mb-2">{icon}</div>
                <div className={`text-sm font-semibold ${colors.text}`}>{TIPO_REPORTE_LABELS[tipo]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuración del Reporte */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Configuración del Reporte</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Período */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Período</label>
            <select
              value={config.periodo}
              onChange={(e) => setConfig((prev) => ({ ...prev, periodo: e.target.value as PeriodoReporte }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="MENSUAL">Mensual</option>
              <option value="TRIMESTRAL">Trimestral</option>
              <option value="ANUAL">Anual</option>
              <option value="PERSONALIZADO">Personalizado</option>
            </select>
          </div>

          {/* Formato */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Formato de Exportación</label>
            <select
              value={config.formato}
              onChange={(e) => setConfig((prev) => ({ ...prev, formato: e.target.value as FormatoExportacion }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="EXCEL">Excel (.xlsx)</option>
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
              <option value="ZIP">ZIP (todos los formatos)</option>
            </select>
          </div>

          {/* Fechas Personalizadas */}
          {config.periodo === 'PERSONALIZADO' && (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  value={config.fechaInicio || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={config.fechaFin || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, fechaFin: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </>
          )}
        </div>

        {/* Opciones Adicionales */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-4">Opciones Adicionales</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.incluirGraficos}
                onChange={(e) => setConfig((prev) => ({ ...prev, incluirGraficos: e.target.checked }))}
                className="w-5 h-5"
              />
              <div>
                <div className="font-semibold text-slate-900">Incluir Gráficos</div>
                <div className="text-sm text-slate-600">Añade gráficos visuales al reporte</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.incluirResumen}
                onChange={(e) => setConfig((prev) => ({ ...prev, incluirResumen: e.target.checked }))}
                className="w-5 h-5"
              />
              <div>
                <div className="font-semibold text-slate-900">Incluir Resumen Ejecutivo</div>
                <div className="text-sm text-slate-600">Hoja inicial con KPIs y resumen</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Botón Generar */}
      <div className="flex items-center justify-between bg-slate-50 rounded-lg p-6 border border-slate-200">
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-1">Reporte seleccionado:</div>
          <div className="text-lg font-bold text-slate-900">{TIPO_REPORTE_LABELS[config.tipo]}</div>
          <div className="text-sm text-slate-600">
            Período: {config.periodo} • Formato: {config.formato}
          </div>
        </div>
        <button
          onClick={handleGenerar}
          disabled={generando}
          className="px-8 py-3 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-3"
        >
          {generando ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Generar y Descargar
            </>
          )}
        </button>
      </div>

      {/* Preview de lo que incluirá */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <div className="font-semibold mb-2">El reporte incluirá:</div>
            <ul className="list-disc list-inside space-y-1">
              {config.incluirResumen && <li>Hoja de Resumen Ejecutivo con KPIs principales</li>}
              <li>Datos detallados de {TIPO_REPORTE_LABELS[config.tipo].toLowerCase()}</li>
              {config.incluirGraficos && <li>Gráficos visuales (líneas, barras, donut)</li>}
              <li>Filtros aplicados y metadatos</li>
              {config.formato === 'ZIP' && <li>Archivos en Excel, PDF y CSV</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
