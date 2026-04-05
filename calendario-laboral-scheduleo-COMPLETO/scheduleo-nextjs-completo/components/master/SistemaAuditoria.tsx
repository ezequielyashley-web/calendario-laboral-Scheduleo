// components/master/SistemaAuditoria.tsx
'use client';

import { useState } from 'react';
import {
  LogAuditoria,
  FiltrosAuditoria,
  EstadisticasAuditoria,
  TipoAccion,
  Plataforma,
  NivelSeveridad,
  TIPO_ACCION_LABELS,
  TIPO_ACCION_ICONS,
  PLATAFORMA_LABELS,
  PLATAFORMA_COLORS,
  SEVERIDAD_COLORS,
} from '@/types/auditoria';

interface SistemaAuditoriaProps {
  logs: LogAuditoria[];
  estadisticas: EstadisticasAuditoria;
}

export default function SistemaAuditoria({ logs, estadisticas }: SistemaAuditoriaProps) {
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [logSeleccionado, setLogSeleccionado] = useState<LogAuditoria | null>(null);

  const handleExportar = () => {
    console.log('Exportando logs con filtros:', filtros);
    // Aquí iría la lógica de exportación
    alert('Exportación iniciada. Se descargará un archivo CSV con los logs filtrados.');
  };

  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const logsFiltrados = logs.filter((log) => {
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      if (
        !log.descripcion.toLowerCase().includes(busqueda) &&
        !log.usuarioNombre.toLowerCase().includes(busqueda) &&
        !(log.entidadNombre?.toLowerCase() || '').includes(busqueda)
      ) {
        return false;
      }
    }
    if (filtros.acciones?.length && !filtros.acciones.includes(log.accion)) return false;
    if (filtros.plataformas?.length && !filtros.plataformas.includes(log.platform)) return false;
    if (filtros.severidades?.length && !filtros.severidades.includes(log.severidad)) return false;
    if (filtros.exito !== undefined && log.exito !== filtros.exito) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase">Total Acciones</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-blue-900">{estadisticas.totalAcciones}</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-600 uppercase">Exitosas</span>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-bold text-green-900">{estadisticas.accionesExitosas}</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-600 uppercase">Errores</span>
            <span className="text-2xl">❌</span>
          </div>
          <div className="text-3xl font-bold text-red-900">{estadisticas.erroresRecientes}</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-600 uppercase">Usuarios Activos</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-purple-900">{estadisticas.usuariosMasActivos.length}</div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar en logs (descripción, usuario, entidad)..."
              value={filtros.busqueda || ''}
              onChange={(e) => setFiltros((prev) => ({ ...prev, busqueda: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones */}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold hover:bg-slate-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros {mostrarFiltros ? '▲' : '▼'}
          </button>

          <button
            onClick={handleExportar}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar
          </button>
        </div>

        {/* Panel de Filtros Avanzados */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio || ''}
                onChange={(e) => setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Fecha Fin</label>
              <input
                type="date"
                value={filtros.fechaFin || ''}
                onChange={(e) => setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Estado</label>
              <select
                value={filtros.exito === undefined ? 'todos' : filtros.exito ? 'exitosas' : 'errores'}
                onChange={(e) => {
                  const valor = e.target.value === 'todos' ? undefined : e.target.value === 'exitosas';
                  setFiltros((prev) => ({ ...prev, exito: valor }));
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="todos">Todas</option>
                <option value="exitosas">Solo exitosas</option>
                <option value="errores">Solo errores</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Timeline de Logs */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Timeline de Auditoría ({logsFiltrados.length} registros)
            </h3>
            {filtros.busqueda && (
              <button
                onClick={() => setFiltros({})}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
          {logsFiltrados.map((log) => {
            const plataformaColor = PLATAFORMA_COLORS[log.platform];
            const severidadColor = SEVERIDAD_COLORS[log.severidad];
            const icon = TIPO_ACCION_ICONS[log.accion];

            return (
              <div
                key={log.id}
                onClick={() => setLogSeleccionado(log)}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon & Severidad */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-lg ${severidadColor.bg} flex items-center justify-center text-lg`}>
                      {icon}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">
                      {log.severidad}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-slate-900 mb-1">{log.descripcion}</div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span className="font-semibold">{log.usuarioNombre}</span>
                          <span>•</span>
                          <span>{TIPO_ACCION_LABELS[log.accion]}</span>
                          {log.entidadNombre && (
                            <>
                              <span>•</span>
                              <span className="font-semibold">{log.entidadNombre}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${plataformaColor.badge}`}>
                          {PLATAFORMA_LABELS[log.platform]}
                        </span>
                        {log.exito ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">✓</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">✗</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>⏰ {formatearFecha(log.timestamp)}</span>
                      {log.ipAddress && <span>🌐 {log.ipAddress}</span>}
                      {log.screenWidth && <span>📱 {log.screenWidth}px</span>}
                    </div>

                    {!log.exito && log.mensajeError && (
                      <div className="mt-2 text-sm text-red-700 bg-red-50 rounded p-2">
                        <span className="font-semibold">Error:</span> {log.mensajeError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {logsFiltrados.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-lg font-semibold mb-2">No se encontraron registros</div>
              <div className="text-sm">Intenta ajustar los filtros de búsqueda</div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detalle */}
      {logSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Detalle de Auditoría</h3>
              <button
                onClick={() => setLogSeleccionado(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info General */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Información General</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-600">Timestamp</div>
                    <div className="font-semibold text-slate-900">{formatearFecha(logSeleccionado.timestamp)}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Usuario</div>
                    <div className="font-semibold text-slate-900">{logSeleccionado.usuarioNombre} ({logSeleccionado.usuarioRol})</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Acción</div>
                    <div className="font-semibold text-slate-900">{TIPO_ACCION_LABELS[logSeleccionado.accion]}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Plataforma</div>
                    <div className="font-semibold text-slate-900">{PLATAFORMA_LABELS[logSeleccionado.platform]}</div>
                  </div>
                  {logSeleccionado.ipAddress && (
                    <div>
                      <div className="text-slate-600">IP Address</div>
                      <div className="font-semibold text-slate-900">{logSeleccionado.ipAddress}</div>
                    </div>
                  )}
                  {logSeleccionado.userAgent && (
                    <div className="col-span-2">
                      <div className="text-slate-600">User Agent</div>
                      <div className="font-mono text-xs text-slate-900">{logSeleccionado.userAgent}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Diff Antes/Después */}
              {(logSeleccionado.valorAnterior || logSeleccionado.valorNuevo) && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Cambios Realizados</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {logSeleccionado.valorAnterior && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="text-xs font-semibold text-red-700 mb-2">ANTES</div>
                        <pre className="text-xs text-red-900 overflow-x-auto">{JSON.stringify(logSeleccionado.valorAnterior, null, 2)}</pre>
                      </div>
                    )}
                    {logSeleccionado.valorNuevo && (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="text-xs font-semibold text-green-700 mb-2">DESPUÉS</div>
                        <pre className="text-xs text-green-900 overflow-x-auto">{JSON.stringify(logSeleccionado.valorNuevo, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detalles Adicionales */}
              {logSeleccionado.detalles && Object.keys(logSeleccionado.detalles).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Detalles Adicionales</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded p-4">
                    <pre className="text-xs text-slate-900 overflow-x-auto">{JSON.stringify(logSeleccionado.detalles, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
