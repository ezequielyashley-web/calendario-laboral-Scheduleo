// components/master/PanelAjustes.tsx
'use client';

import { useState } from 'react';
import {
  Sede,
  TipoSede,
  TIPO_SEDE_LABELS,
  TIPO_SEDE_ICONS,
  TIPO_SEDE_COLORS,
  ConfiguracionSeguridad,
  ConfiguracionInspeccion,
  ConfiguracionNotificaciones,
  ConfiguracionHorarios,
  FestivoPersonalizado,
} from '@/types/types-ajustes';

interface PanelAjustesProps {
  sedes: Sede[];
  configSeguridad: ConfiguracionSeguridad;
  configInspeccion: ConfiguracionInspeccion;
  configNotificaciones: ConfiguracionNotificaciones;
  configHorarios: ConfiguracionHorarios;
  festivosPersonalizados: FestivoPersonalizado[];
}

export default function PanelAjustes({
  sedes,
  configSeguridad,
  configInspeccion,
  configNotificaciones,
  configHorarios,
  festivosPersonalizados,
}: PanelAjustesProps) {
  const [tabActivo, setTabActivo] = useState<'seguridad' | 'sedes' | 'inspeccion' | 'general'>('seguridad');
  const [modalSede, setModalSede] = useState<{ show: boolean; sede?: Sede }>({ show: false });

  const handleGuardarSede = (sede: Partial<Sede>) => {
    console.log('Guardar sede:', sede);
    setModalSede({ show: false });
  };

  return (
    <div>
      {/* Tabs Container */}
      <div className="bg-white rounded-lg border border-slate-200">
        {/* Tabs Header */}
        <div className="border-b border-slate-200">
          <nav className="flex">
            <button
              onClick={() => setTabActivo('seguridad')}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold ${
                tabActivo === 'seguridad'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Seguridad</span>
            </button>

            <button
              onClick={() => setTabActivo('sedes')}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold ${
                tabActivo === 'sedes'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Sedes ({sedes.length})</span>
            </button>

            <button
              onClick={() => setTabActivo('inspeccion')}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold ${
                tabActivo === 'inspeccion'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Inspección AEAT</span>
            </button>

            <button
              onClick={() => setTabActivo('general')}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold ${
                tabActivo === 'general'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>General</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          
          {/* TAB 1: SEGURIDAD */}
          {tabActivo === 'seguridad' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Configuración de Seguridad</h3>
                
                {/* Autenticación */}
                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                  <h4 className="text-md font-semibold text-slate-800 mb-4">Autenticación</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked={configSeguridad.requierePin} className="w-5 h-5" />
                        <div>
                          <div className="font-semibold text-slate-900">Requerir PIN</div>
                          <div className="text-sm text-slate-600">Los usuarios deben tener PIN de acceso</div>
                        </div>
                      </label>
                      {configSeguridad.requierePin && (
                        <div className="mt-3 ml-8">
                          <label className="text-sm font-medium text-slate-700">Longitud PIN:</label>
                          <select className="ml-2 px-3 py-1 border border-slate-300 rounded" defaultValue={configSeguridad.longitudPin}>
                            <option value="4">4 dígitos</option>
                            <option value="6">6 dígitos</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked={configSeguridad.requierePassword} className="w-5 h-5" />
                        <div>
                          <div className="font-semibold text-slate-900">Requerir Contraseña</div>
                          <div className="text-sm text-slate-600">Contraseña adicional para desktop</div>
                        </div>
                      </label>
                      {configSeguridad.requierePassword && (
                        <div className="mt-3 ml-8 space-y-2">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Longitud mínima:</label>
                            <input type="number" className="ml-2 w-20 px-3 py-1 border border-slate-300 rounded" defaultValue={configSeguridad.longitudMinPassword} min="8" max="20" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Expiración (días):</label>
                            <input type="number" className="ml-2 w-20 px-3 py-1 border border-slate-300 rounded" defaultValue={configSeguridad.expiracionPassword} min="30" max="365" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seguridad Adicional */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-slate-800 mb-4">Seguridad Adicional</h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Intentos máximos</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded" defaultValue={configSeguridad.intentosMaximos} min="3" max="10" />
                      <p className="text-xs text-slate-500 mt-1">Antes de bloquear la cuenta</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Tiempo bloqueo (min)</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded" defaultValue={configSeguridad.tiempoBloqueo} min="5" max="60" />
                      <p className="text-xs text-slate-500 mt-1">Duración del bloqueo</p>
                    </div>
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer mt-7">
                        <input type="checkbox" defaultChecked={configSeguridad.autenticacionDosFactor} className="w-5 h-5" />
                        <div>
                          <div className="font-semibold text-slate-900">2FA</div>
                          <div className="text-xs text-slate-600">Autenticación de dos factores</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SEDES */}
          {tabActivo === 'sedes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Gestión de Sedes</h3>
                <button onClick={() => setModalSede({ show: true })} className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Sede
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {sedes.map((sede) => {
                  const colors = TIPO_SEDE_COLORS[sede.tipo];
                  const icon = TIPO_SEDE_ICONS[sede.tipo];
                  return (
                    <div key={sede.id} className={`${colors.bg} border-2 ${colors.border} rounded-lg p-5`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">{icon}</div>
                            <div>
                              <h4 className={`text-lg font-bold ${colors.text}`}>{sede.nombre}</h4>
                              <p className="text-sm text-slate-600">{TIPO_SEDE_LABELS[sede.tipo]}</p>
                            </div>
                            {sede.activa ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Activa</span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">Inactiva</span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="font-semibold text-slate-700">Dirección</div>
                              <div className="text-slate-600">{sede.direccion}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-700">Horario</div>
                              <div className="text-slate-600">{sede.horarioApertura} - {sede.horarioCierre}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-700">Capacidad</div>
                              <div className="text-slate-600">{sede.capacidadEmpleados} empleados</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => setModalSede({ show: true, sede })} className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: INSPECCIÓN */}
          {tabActivo === 'inspeccion' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Acceso Inspector AEAT</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-amber-900">
                      <div className="font-semibold mb-1">Cumplimiento Real Decreto-ley 8/2019</div>
                      <div>El acceso de inspección permite a la autoridad laboral consultar registros de fichajes con permisos de solo lectura.</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-6">
                  <label className="flex items-center gap-3 cursor-pointer mb-6">
                    <input type="checkbox" defaultChecked={configInspeccion.accesoInspectorActivo} className="w-5 h-5" />
                    <div>
                      <div className="font-semibold text-slate-900">Habilitar Acceso de Inspección</div>
                      <div className="text-sm text-slate-600">Permite acceso de solo lectura a registros de fichajes</div>
                    </div>
                  </label>

                  {configInspeccion.accesoInspectorActivo && (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">Código Inspector</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded" defaultValue={configInspeccion.codigoInspector} placeholder="Código proporcionado por AEAT" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">Nivel de Acceso</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded" defaultValue={configInspeccion.nivelAcceso}>
                          <option value="SOLO_LECTURA">Solo Lectura (web)</option>
                          <option value="LECTURA_DESCARGA">Lectura + Descarga PDF</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">Inspector Asignado</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded" defaultValue={configInspeccion.inspectorNombre} placeholder="Nombre del inspector" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">Entidad</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded" defaultValue={configInspeccion.inspectorEntidad} placeholder="AEAT, Inspección Trabajo, etc." />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
                  Guardar Configuración
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: GENERAL */}
          {tabActivo === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Configuración General</h3>

                {/* Notificaciones */}
                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                  <h4 className="text-md font-semibold text-slate-800 mb-4">Notificaciones</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked={configNotificaciones.emailNotificaciones} className="w-5 h-5" />
                      <div>
                        <div className="font-semibold text-slate-900">Email</div>
                        <div className="text-sm text-slate-600">Enviar notificaciones por correo electrónico</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked={configNotificaciones.pushNotificaciones} className="w-5 h-5" />
                      <div>
                        <div className="font-semibold text-slate-900">Push</div>
                        <div className="text-sm text-slate-600">Notificaciones push en móvil</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Horarios */}
                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                  <h4 className="text-md font-semibold text-slate-800 mb-4">Horarios Laborales</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Inicio Jornada</label>
                      <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded" defaultValue={configHorarios.horaInicioJornada} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Fin Jornada</label>
                      <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded" defaultValue={configHorarios.horaFinJornada} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Tolerancia Entrada (min)</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded" defaultValue={configHorarios.minutosToleranciaEntrada} min="0" max="30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Descanso Mínimo (min)</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded" defaultValue={configHorarios.descansoMinimo} min="15" max="60" />
                    </div>
                  </div>
                </div>

                {/* Festivos Personalizados */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-slate-800">Festivos Personalizados</h4>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md font-semibold hover:bg-blue-700">
                      + Añadir Festivo
                    </button>
                  </div>
                  <div className="space-y-2">
                    {festivosPersonalizados.map((festivo) => (
                      <div key={festivo.id} className="flex items-center justify-between bg-white rounded p-3 border border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="font-semibold text-slate-900">{new Date(festivo.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</div>
                          <div className="text-sm text-slate-600">{festivo.nombre}</div>
                          {festivo.recurrente && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">Anual</span>
                          )}
                        </div>
                        <button className="text-red-600 hover:text-red-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
                  Guardar Configuración
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
