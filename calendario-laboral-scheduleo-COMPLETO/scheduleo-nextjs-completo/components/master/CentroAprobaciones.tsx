'use client';

// components/master/CentroAprobaciones.tsx
// Centro de Aprobaciones con tabs múltiples

import { useState } from 'react';
import { 
  Calendar, Users, FileText, CheckCircle, XCircle, 
  Clock, AlertCircle, Eye, Shield
} from 'lucide-react';

interface CentroAprobacionesProps {
  data: any;
}

export default function CentroAprobaciones({ data }: CentroAprobacionesProps) {
  const [activeTab, setActiveTab] = useState<'vacaciones' | 'cambios' | 'bajasIT'>('vacaciones');
  const [modalPIN, setModalPIN] = useState<{ show: boolean; accion: 'aprobar' | 'rechazar' | null; id: string | null }>({
    show: false,
    accion: null,
    id: null,
  });

  const handleAccion = (tipo: 'aprobar' | 'rechazar', id: string) => {
    setModalPIN({ show: true, accion: tipo, id });
  };

  const confirmarConPIN = (pin: string) => {
    // Aquí validarías el PIN y ejecutarías la acción
    console.log(`Acción ${modalPIN.accion} para ${modalPIN.id} con PIN ${pin}`);
    setModalPIN({ show: false, accion: null, id: null });
    // Refrescar datos
  };

  return (
    <div className="space-y-6">
      {/* Stats Superior */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          label="Total Pendientes" 
          value={data.stats.totalPendientes} 
          icon={AlertCircle}
          color="bg-amber-50 text-amber-600 border-amber-200"
        />
        <StatCard 
          label="Vacaciones" 
          value={data.stats.vacaciones} 
          icon={Calendar}
          color="bg-blue-50 text-blue-600 border-blue-200"
        />
        <StatCard 
          label="Cambios Turno" 
          value={data.stats.cambios} 
          icon={Users}
          color="bg-violet-50 text-violet-600 border-violet-200"
        />
        <StatCard 
          label="Bajas IT" 
          value={data.stats.bajasIT} 
          icon={FileText}
          color="bg-emerald-50 text-emerald-600 border-emerald-200"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex">
            <TabButton
              active={activeTab === 'vacaciones'}
              onClick={() => setActiveTab('vacaciones')}
              icon={Calendar}
              badge={data.stats.vacaciones}
            >
              Vacaciones
            </TabButton>
            <TabButton
              active={activeTab === 'cambios'}
              onClick={() => setActiveTab('cambios')}
              icon={Users}
              badge={data.stats.cambios}
            >
              Cambios de Turno
            </TabButton>
            <TabButton
              active={activeTab === 'bajasIT'}
              onClick={() => setActiveTab('bajasIT')}
              icon={FileText}
              badge={data.stats.bajasIT}
            >
              Bajas IT (OCR)
            </TabButton>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'vacaciones' && (
            <div className="space-y-4">
              {data.solicitudesVacaciones.map((sol: any) => (
                <SolicitudVacacionCard 
                  key={sol.id} 
                  solicitud={sol}
                  onAprobar={() => handleAccion('aprobar', sol.id)}
                  onRechazar={() => handleAccion('rechazar', sol.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'cambios' && (
            <div className="space-y-4">
              {data.cambiosTurno.map((cambio: any) => (
                <CambioTurnoCard 
                  key={cambio.id} 
                  cambio={cambio}
                  onAprobar={() => handleAccion('aprobar', cambio.id)}
                  onRechazar={() => handleAccion('rechazar', cambio.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'bajasIT' && (
            <div className="space-y-4">
              {data.bajasIT.map((baja: any) => (
                <BajaITCard 
                  key={baja.id} 
                  baja={baja}
                  onAprobar={() => handleAccion('aprobar', baja.id)}
                  onRechazar={() => handleAccion('rechazar', baja.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal PIN */}
      {modalPIN.show && (
        <ModalConfirmacionPIN
          accion={modalPIN.accion!}
          onConfirmar={confirmarConPIN}
          onCancelar={() => setModalPIN({ show: false, accion: null, id: null })}
        />
      )}
    </div>
  );
}

// Componentes auxiliares

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className={`${color} rounded-lg border p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, badge, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-6 py-4 text-sm font-semibold border-b-2 transition-colors
        ${active 
          ? 'border-blue-600 text-blue-600 bg-blue-50' 
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
      {badge > 0 && (
        <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function SolicitudVacacionCard({ solicitud, onAprobar, onRechazar }: any) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              {solicitud.empleado.nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
            </div>
            <div>
              <div className="text-lg font-bold text-blue-900">{solicitud.empleado.nombre}</div>
              <div className="text-sm text-blue-700">{solicitud.empleado.puesto} - {solicitud.empleado.sede}</div>
            </div>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase mb-1">Fechas</div>
              <div className="text-sm font-bold text-blue-900">
                {new Date(solicitud.fechaInicio).toLocaleDateString('es-ES')} - {new Date(solicitud.fechaFin).toLocaleDateString('es-ES')}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase mb-1">Duración</div>
              <div className="text-sm font-bold text-blue-900">{solicitud.dias} días</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase mb-1">Tipo</div>
              <div className="text-sm font-bold text-blue-900 capitalize">{solicitud.tipo}</div>
            </div>
          </div>

          {/* Comentarios */}
          {solicitud.comentarios && (
            <div className="bg-white/50 rounded p-3 mb-4">
              <div className="text-xs font-semibold text-blue-700 mb-1">Comentarios:</div>
              <div className="text-sm text-blue-900">{solicitud.comentarios}</div>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-blue-700">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Solicitado: {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 ml-6">
          <button 
            onClick={onAprobar}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Aprobar
          </button>
          <button 
            onClick={onRechazar}
            className="px-6 py-2.5 bg-white text-red-600 border-2 border-red-600 rounded-md font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Rechazar
          </button>
          <button className="px-6 py-2.5 bg-white text-blue-600 border border-blue-300 rounded-md font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
}

function CambioTurnoCard({ cambio, onAprobar, onRechazar }: any) {
  return (
    <div className="bg-violet-50 border border-violet-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="mb-4">
            <div className="text-lg font-bold text-violet-900 mb-1">
              {cambio.solicitante.nombre} ↔️ {cambio.destino.nombre}
            </div>
            <div className="text-sm text-violet-700">
              Fecha: {new Date(cambio.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Turnos */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/50 rounded p-3">
              <div className="text-xs font-semibold text-violet-600 uppercase mb-1">{cambio.solicitante.nombre}</div>
              <div className="text-sm font-bold text-violet-900">{cambio.turnoOrigen} → {cambio.turnoDestino}</div>
            </div>
            <div className="bg-white/50 rounded p-3">
              <div className="text-xs font-semibold text-violet-600 uppercase mb-1">{cambio.destino.nombre}</div>
              <div className="text-sm font-bold text-violet-900">{cambio.turnoDestino} → {cambio.turnoOrigen}</div>
            </div>
          </div>

          {/* Motivo */}
          <div className="bg-white/50 rounded p-3 mb-4">
            <div className="text-xs font-semibold text-violet-700 mb-1">Motivo:</div>
            <div className="text-sm text-violet-900">{cambio.motivo}</div>
          </div>

          {/* Estado aceptación */}
          {cambio.aceptadoPorDestino && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold">Aceptado por {cambio.destino.nombre}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 ml-6">
          <button 
            onClick={onAprobar}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Aprobar
          </button>
          <button 
            onClick={onRechazar}
            className="px-6 py-2.5 bg-white text-red-600 border-2 border-red-600 rounded-md font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}

function BajaITCard({ baja, onAprobar, onRechazar }: any) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              {baja.empleado.nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-900">{baja.empleado.nombre}</div>
              <div className="text-sm text-emerald-700">{baja.empleado.puesto} - {baja.empleado.sede}</div>
            </div>
          </div>

          {/* Datos OCR */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-emerald-300">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-900">Datos extraídos por OCR</span>
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                {baja.estadoOCR === 'completado' ? '✓ Completado' : 'Procesando...'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-emerald-600 font-semibold mb-1">Paciente</div>
                <div className="text-emerald-900">{baja.ocrDatos.nombrePaciente}</div>
              </div>
              <div>
                <div className="text-emerald-600 font-semibold mb-1">DNI</div>
                <div className="text-emerald-900">{baja.ocrDatos.dni}</div>
              </div>
              <div>
                <div className="text-emerald-600 font-semibold mb-1">Diagnóstico</div>
                <div className="text-emerald-900">{baja.ocrDatos.diagnostico}</div>
              </div>
              <div>
                <div className="text-emerald-600 font-semibold mb-1">Duración</div>
                <div className="text-emerald-900">{baja.ocrDatos.duracion}</div>
              </div>
            </div>
          </div>

          {/* Detalles baja */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-emerald-600 font-semibold mb-1">Inicio</div>
              <div className="text-emerald-900">{new Date(baja.fechaInicio).toLocaleDateString('es-ES')}</div>
            </div>
            <div>
              <div className="text-emerald-600 font-semibold mb-1">Duración</div>
              <div className="text-emerald-900">{baja.dias} días</div>
            </div>
            <div>
              <div className="text-emerald-600 font-semibold mb-1">Tipo</div>
              <div className="text-emerald-900 capitalize">{baja.tipo}</div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2 ml-6">
          <button 
            onClick={onAprobar}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Aprobar
          </button>
          <button 
            onClick={onRechazar}
            className="px-6 py-2.5 bg-white text-red-600 border-2 border-red-600 rounded-md font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Rechazar
          </button>
          <a 
            href={baja.documentoURL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-white text-emerald-600 border border-emerald-300 rounded-md font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 justify-center"
          >
            <FileText className="w-4 h-4" />
            Ver PDF
          </a>
        </div>
      </div>
    </div>
  );
}

function ModalConfirmacionPIN({ accion, onConfirmar, onCancelar }: any) {
  const [pin, setPIN] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            accion === 'aprobar' ? 'bg-emerald-100' : 'bg-red-100'
          }`}>
            {accion === 'aprobar' ? (
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Confirmar {accion === 'aprobar' ? 'Aprobación' : 'Rechazo'}
          </h3>
          <p className="text-sm text-slate-600">
            Ingresa tu PIN de 4 dígitos para confirmar esta acción
          </p>
        </div>

        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPIN(e.target.value.replace(/\D/g, ''))}
          className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-slate-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest"
          placeholder="••••"
          autoFocus
        />

        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => pin.length === 4 && onConfirmar(pin)}
            disabled={pin.length !== 4}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
              accion === 'aprobar'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300'
                : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
