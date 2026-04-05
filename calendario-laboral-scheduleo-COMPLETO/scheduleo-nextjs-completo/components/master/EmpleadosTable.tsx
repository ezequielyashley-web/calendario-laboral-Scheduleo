'use client';

// components/master/EmpleadosTable.tsx
// Tabla profesional de empleados con nueva estructura

import { useState } from 'react';
import { Eye, Edit, MoreHorizontal, User } from 'lucide-react';

interface Empleado {
  id: string;
  nombre: string;
  email: string;
  puesto: string;
  sede: {
    id: string;
    nombre: string;
    tipo: 'PESCADERIA' | 'RESTAURANTE' | 'CATERING';
  };
  grupoSemana: 'ENTRE_SEMANA_A' | 'ENTRE_SEMANA_B' | 'ENTRE_SEMANA_C';
  grupoLunes: 'LUNES_A' | 'LUNES_B' | 'LUNES_C';
  rol: 'SUPER_ADMIN' | 'ADMIN_SEDE' | 'EMPLEADO';
  activo: boolean;
}

interface EmpleadosTableProps {
  empleados: Empleado[];
}

const TIPO_SEDE_LABELS = {
  PESCADERIA: 'Pescadería',
  RESTAURANTE: 'Restaurante',
  CATERING: 'Catering',
};

const GRUPO_SEMANA_LABELS = {
  ENTRE_SEMANA_A: 'Entre semana A',
  ENTRE_SEMANA_B: 'Entre semana B',
  ENTRE_SEMANA_C: 'Entre semana C',
};

const GRUPO_LUNES_LABELS = {
  LUNES_A: 'Lunes A',
  LUNES_B: 'Lunes B',
  LUNES_C: 'Lunes C',
};

const ROL_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_SEDE: 'Admin Sede',
  EMPLEADO: 'Empleado',
};

export default function EmpleadosTable({ empleados }: EmpleadosTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const itemsPerPage = 20;
  const totalPages = Math.ceil(empleados.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmpleados = empleados.slice(startIndex, endIndex);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Puesto
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sede
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Grupo Semana
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Lunes
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentEmpleados.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                {/* Empleado */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-700 rounded-md flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {emp.nombre}
                      </div>
                      <div className="text-xs text-slate-500">
                        ID: {emp.id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3 text-sm text-slate-600">
                  {emp.email}
                </td>

                {/* Puesto */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                    {emp.puesto}
                  </span>
                </td>

                {/* Sede (con tipo) */}
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {emp.sede.nombre}
                    </div>
                    <div className="text-xs text-slate-500">
                      {TIPO_SEDE_LABELS[emp.sede.tipo]}
                    </div>
                  </div>
                </td>

                {/* Grupo Semana */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {GRUPO_SEMANA_LABELS[emp.grupoSemana]}
                  </span>
                </td>

                {/* Lunes */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                    {GRUPO_LUNES_LABELS[emp.grupoLunes]}
                  </span>
                </td>

                {/* Rol */}
                <td className="px-4 py-3 text-sm text-slate-700 font-medium">
                  {ROL_LABELS[emp.rol]}
                </td>

                {/* Estado */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                    emp.activo 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {emp.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="Ver perfil"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="Más opciones"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="text-sm text-slate-600">
          Mostrando <span className="font-semibold">{startIndex + 1}</span> a{' '}
          <span className="font-semibold">{Math.min(endIndex, empleados.length)}</span> de{' '}
          <span className="font-semibold">{empleados.length}</span> empleados
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
