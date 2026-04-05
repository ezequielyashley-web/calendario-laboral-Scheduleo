'use client';

// components/master/PerfilEmpleado.tsx
// Perfil completo del empleado - Diseño equilibrado

import { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, 
  FileText, Award, Clock, TrendingUp, Download,
  Edit, MoreVertical, CheckCircle, XCircle, Clock as ClockIcon
} from 'lucide-react';
import { Line } from 'react-chartjs-2';

interface PerfilEmpleadoProps {
  data: any; // En producción, usar tipos apropiados
}

export default function PerfilEmpleado({ data }: PerfilEmpleadoProps) {
  const { empleado, estadisticas, historial, timeline } = data;
  const [activeTab, setActiveTab] = useState<'resumen' | 'historial' | 'documentos'>('resumen');

  return (
    <div className="space-y-6">
      {/* Card Superior: Datos Personales */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-12 h-12 text-blue-600" />
            </div>

            {/* Info Principal */}
            <div>
              <h2 className="text-2xl font-bold mb-2">{empleado.nombre}</h2>
              <div className="flex items-center gap-4 text-blue-100 mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm font-medium">{empleado.puesto}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{empleado.sede.nombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Desde {new Date(empleado.fechaIngreso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>

              {/* Contacto */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{empleado.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{empleado.telefono}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white text-blue-600 rounded-md font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button className="p-2 bg-blue-700 rounded-md hover:bg-blue-800 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatMiniCard 
          label="Días Trabajados"
          value={estadisticas.diasTrabajados}
          icon={Clock}
          color="blue"
        />
        <StatMiniCard 
          label="Asistencia"
          value={`${estadisticas.tasaAsistencia}%`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatMiniCard 
          label="Vacaciones Restantes"
          value={estadisticas.vacacionesRestantes}
          icon={Calendar}
          color="violet"
        />
        <StatMiniCard 
          label="Horas Extras"
          value={estadisticas.horasExtras}
          icon={ClockIcon}
          color="amber"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          <TabButton 
            active={activeTab === 'resumen'} 
            onClick={() => setActiveTab('resumen')}
          >
            Resumen
          </TabButton>
          <TabButton 
            active={activeTab === 'historial'} 
            onClick={() => setActiveTab('historial')}
          >
            Historial
          </TabButton>
          <TabButton 
            active={activeTab === 'documentos'} 
            onClick={() => setActiveTab('documentos')}
          >
            Documentos
          </TabButton>
        </nav>
      </div>

      {/* Contenido Tabs */}
      {activeTab === 'resumen' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Timeline de Actividades
            </h3>
            <div className="space-y-4">
              {timeline.map((evento: any) => (
                <TimelineItem key={evento.id} evento={evento} />
              ))}
            </div>
          </div>

          {/* Datos Adicionales */}
          <div className="space-y-6">
            {/* Info Personal */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Información Personal</h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="DNI" value={empleado.dni} />
                <InfoRow label="Fecha Nacimiento" value={new Date(empleado.fechaNacimiento).toLocaleDateString('es-ES')} />
                <InfoRow label="Dirección" value={empleado.direccion} />
                <InfoRow label="Grupo Semana" value="Entre semana A" />
                <InfoRow label="Grupo Lunes" value="Lunes A" />
              </div>
            </div>

            {/* Contacto Emergencia */}
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
              <h3 className="text-sm font-bold text-amber-900 mb-4 uppercase tracking-wide">Contacto de Emergencia</h3>
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-amber-900">{empleado.contactoEmergencia.nombre}</div>
                <div className="text-amber-700">{empleado.contactoEmergencia.relacion}</div>
                <div className="text-amber-700 flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {empleado.contactoEmergencia.telefono}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Vacaciones */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Historial de Vacaciones</h3>
            <div className="space-y-3">
              {historial.vacaciones.map((vac: any) => (
                <div key={vac.id} className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-emerald-900">
                      {new Date(vac.fechaInicio).toLocaleDateString('es-ES')} - {new Date(vac.fechaFin).toLocaleDateString('es-ES')}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      {vac.dias} días
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    Aprobada
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bajas */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Historial de Bajas</h3>
            <div className="space-y-3">
              {historial.bajas.map((baja: any) => (
                <div key={baja.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-red-900">
                      {new Date(baja.fechaInicio).toLocaleDateString('es-ES')} - {new Date(baja.fechaFin).toLocaleDateString('es-ES')}
                    </span>
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded">
                      {baja.dias} días
                    </span>
                  </div>
                  <div className="text-sm text-red-700 capitalize">{baja.tipo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documentos' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Documentos</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Subir Documento
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <DocumentoCard nombre="Contrato de Trabajo" fecha="2020-01-15" tipo="PDF" />
            <DocumentoCard nombre="DNI - Copia" fecha="2020-01-10" tipo="PDF" />
            <DocumentoCard nombre="Certificado Bancario" fecha="2020-01-12" tipo="PDF" />
            <DocumentoCard nombre="Título Formación" fecha="2022-03-15" tipo="PDF" />
          </div>
        </div>
      )}
    </div>
  );
}

// Componentes auxiliares

function StatMiniCard({ label, value, icon: Icon, color }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    violet: 'bg-violet-50 text-violet-600 border-violet-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <div className={`${colors[color]} rounded-lg border p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</span>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-3 text-sm font-semibold border-b-2 transition-colors
        ${active 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-slate-600 hover:text-slate-900'
        }
      `}
    >
      {children}
    </button>
  );
}

function TimelineItem({ evento }: any) {
  const icons = {
    ingreso: '🚀',
    promocion: '⬆️',
    formacion: '📚',
    reconocimiento: '🏆',
    vacaciones: '🏖️',
  };

  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
        {icons[evento.tipo as keyof typeof icons] || '📌'}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900">{evento.descripcion}</div>
        <div className="text-xs text-slate-500 mt-1">
          {new Date(evento.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function DocumentoCard({ nombre, fecha, tipo }: any) {
  return (
    <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <FileText className="w-8 h-8 text-red-500" />
        <span className="text-xs font-bold text-slate-500">{tipo}</span>
      </div>
      <div className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
        {nombre}
      </div>
      <div className="text-xs text-slate-500">{new Date(fecha).toLocaleDateString('es-ES')}</div>
    </div>
  );
}
