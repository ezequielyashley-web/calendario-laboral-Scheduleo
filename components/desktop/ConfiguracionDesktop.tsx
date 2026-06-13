"use client"

import { useState } from "react"

export default function ConfiguracionDesktop() {
  const [activeTab, setActiveTab] = useState("empresa")

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b flex">
          {[
            { id: "empresa", label: "Empresa" },
            { id: "sedes", label: "Sedes" },
            { id: "grupos", label: "Grupos de Turno" },
            { id: "puestos", label: "Puestos de Trabajo" },
            { id: "sistema", label: "Sistema" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium ${
                activeTab === tab.id
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "empresa" && <ConfigEmpresa />}
          {activeTab === "sedes" && <ConfigSedes />}
          {activeTab === "grupos" && <ConfigGrupos />}
          {activeTab === "puestos" && <ConfigPuestos />}
          {activeTab === "sistema" && <ConfigSistema />}
        </div>
      </div>
    </div>
  )
}

function ConfigEmpresa() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Nombre de la Empresa</label>
        <input type="text" defaultValue="Mi Empresa S.L." className="w-full px-4 py-2 border rounded-lg" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">CIF</label>
        <input type="text" defaultValue="B12345678" className="w-full px-4 py-2 border rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email de contacto</label>
          <input type="email" defaultValue="contacto@empresa.com" className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Teléfono</label>
          <input type="tel" defaultValue="+34 900 123 456" className="w-full px-4 py-2 border rounded-lg" />
        </div>
      </div>

      <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Guardar Cambios
      </button>
    </div>
  )
}

function ConfigSedes() {
  return (
    <div className="space-y-4">
      {[
        { nombre: "Madrid Centro", direccion: "Calle Mayor 1, Madrid", empleados: 45 },
        { nombre: "Vallecas", direccion: "Av. Monte Igueldo 15, Madrid", empleados: 23 },
      ].map((sede, i) => (
        <div key={i} className="border rounded-lg p-4 flex justify-between items-center">
          <div>
            <h4 className="font-bold">{sede.nombre}</h4>
            <p className="text-sm text-gray-600">{sede.direccion}</p>
            <p className="text-sm text-gray-500 mt-1">{sede.empleados} empleados</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded hover:bg-gray-50">Editar</button>
            <button className="px-4 py-2 border rounded hover:bg-red-50 text-red-600">Eliminar</button>
          </div>
        </div>
      ))}
      
      <button className="w-full py-3 border-2 border-dashed rounded-lg hover:bg-gray-50">
        + Añadir Nueva Sede
      </button>
    </div>
  )
}

function ConfigGrupos() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { grupo: "G1A", color: "bg-blue-500", empleados: 12 },
          { grupo: "G1B", color: "bg-blue-400", empleados: 11 },
          { grupo: "G2A", color: "bg-red-500", empleados: 11 },
          { grupo: "G2B", color: "bg-red-400", empleados: 12 },
          { grupo: "G3A", color: "bg-green-500", empleados: 11 },
          { grupo: "G3B", color: "bg-green-400", empleados: 11 },
        ].map((g, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 ${g.color} rounded`}></div>
              <h4 className="font-bold">{g.grupo}</h4>
            </div>
            <p className="text-sm text-gray-600">{g.empleados} empleados</p>
            <button className="mt-2 text-sm text-indigo-600 hover:underline">Configurar</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfigPuestos() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Define los puestos de trabajo y la cobertura mínima requerida para cada uno.
        </p>
      </div>

      {[
        { puesto: "Cajero", coberturaMin: 2, actualActivos: 3 },
        { puesto: "Reponedor", coberturaMin: 4, actualActivos: 5 },
        { puesto: "Supervisor", coberturaMin: 1, actualActivos: 1 },
      ].map((p, i) => (
        <div key={i} className="border rounded-lg p-4 flex justify-between items-center">
          <div>
            <h4 className="font-bold">{p.puesto}</h4>
            <p className="text-sm text-gray-600">Cobertura mínima: {p.coberturaMin}</p>
            <p className="text-sm text-gray-500">Actualmente activos: {p.actualActivos}</p>
          </div>
          <button className="px-4 py-2 border rounded hover:bg-gray-50">Editar</button>
        </div>
      ))}

      <button className="w-full py-3 border-2 border-dashed rounded-lg hover:bg-gray-50">
        + Añadir Nuevo Puesto
      </button>
    </div>
  )
}

function ConfigSistema() {
  const [expiracion, setExpiracion] = useState('90')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  const guardarExpiracion = async (valor: string) => {
    setGuardando(true)
    setExpiracion(valor)
    try {
      await fetch('/api/configuracion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiracionContrasena: parseInt(valor) || null })
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2000)
    } catch {}
    setGuardando(false)
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between py-3 border-b">
      <div className="py-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium">Expiracion de Contrasena</h4>
            <p className="text-sm text-gray-600">El sistema pedira cambiar la contrasena cada X dias</p>
          </div>
          {guardado && <span style={{ fontSize:12, color:'#16a34a', fontWeight:600 }}>Guardado</span>}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[['0','Nunca'],['30','30 dias'],['60','60 dias'],['90','90 dias'],['180','180 dias']].map(([val,label]) => (
            <button key={val} onClick={() => guardarExpiracion(val)} disabled={guardando}
              style={{ padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
                background: expiracion===val ? '#6366f1' : '#f1f5f9',
                color: expiracion===val ? '#fff' : '#475569',
                border: expiracion===val ? '1px solid #6366f1' : '1px solid #e2e8f0' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
        <div>
          <h4 className="font-medium">Notificaciones por Email</h4>
          <p className="text-sm text-gray-600">Recibir alertas y resúmenes</p>
        </div>
        <input type="checkbox" defaultChecked className="w-5 h-5" />
      </div>

      <div className="flex items-center justify-between py-3 border-b">
        <div>
          <h4 className="font-medium">Modo Oscuro</h4>
          <p className="text-sm text-gray-600">Interfaz con tema oscuro</p>
        </div>
        <input type="checkbox" className="w-5 h-5" />
      </div>

      <div className="flex items-center justify-between py-3 border-b">
        <div>
          <h4 className="font-medium">Exportar Datos</h4>
          <p className="text-sm text-gray-600">Descargar todos los datos de la empresa</p>
        </div>
        <button className="px-4 py-2 border rounded hover:bg-gray-50">Exportar</button>
      </div>
    </div>
  )
}

