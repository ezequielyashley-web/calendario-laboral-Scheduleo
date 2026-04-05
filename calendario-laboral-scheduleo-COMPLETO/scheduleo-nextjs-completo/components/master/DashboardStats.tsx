'use client';

// components/master/DashboardStats.tsx
// KPIs y gráficos - VERSIÓN COLORIDA

import { TrendingUp, TrendingDown, Users, UserCheck, Shield, Activity } from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardStatsProps {
  data: {
    stats: {
      totalEmpleados: number;
      empleadosActivos: number;
      empleadosInactivos: number;
      totalAdmins: number;
      solicitudesPendientes: number;
      bajasActivas: number;
      tasaOcupacion: number;
    };
    distribucionSedes: Array<{
      tipo: 'PESCADERIA' | 'RESTAURANTE' | 'CATERING';
      nombre: string;
      cantidad: number;
    }>;
    distribucionGrupos: Array<{
      grupo: string;
      cantidad: number;
    }>;
  };
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const { stats } = data;

  return (
    <div className="space-y-6">
      {/* KPIs Grid - COLORIDOS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Personal"
          value={stats.totalEmpleados}
          icon={Users}
          gradient="from-blue-500 to-blue-600"
          iconColor="text-blue-500"
          bgColor="bg-blue-50"
          trend={{ value: 3, direction: 'up', label: 'vs mes anterior' }}
        />
        <StatCard
          label="Empleados Activos"
          value={stats.empleadosActivos}
          icon={UserCheck}
          gradient="from-emerald-500 to-emerald-600"
          iconColor="text-emerald-500"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Solicitudes Pendientes"
          value={stats.solicitudesPendientes}
          icon={Shield}
          gradient="from-amber-500 to-amber-600"
          iconColor="text-amber-500"
          bgColor="bg-amber-50"
          trend={{ value: 2, direction: 'up', label: 'requieren atención' }}
        />
        <StatCard
          label="Tasa Ocupación"
          value={`${stats.tasaOcupacion}%`}
          icon={Activity}
          gradient="from-violet-500 to-violet-600"
          iconColor="text-violet-500"
          bgColor="bg-violet-50"
        />
      </div>

      {/* Gráficos - Grid 2 columnas */}
      <div className="grid grid-cols-2 gap-6">
        {/* Distribución por Sedes - MULTICOLOR */}
        <ChartCard title="Distribución por Tipo de Sede">
          <Bar
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 },
                  grid: { color: '#e2e8f0' },
                },
                x: {
                  grid: { display: false },
                },
              },
            }}
            data={{
              labels: data.distribucionSedes.map(s => {
                const labels = {
                  PESCADERIA: 'Pescadería',
                  RESTAURANTE: 'Restaurante',
                  CATERING: 'Catering'
                };
                return labels[s.tipo];
              }),
              datasets: [{
                data: data.distribucionSedes.map(s => s.cantidad),
                backgroundColor: [
                  '#3b82f6', // Azul
                  '#10b981', // Verde
                  '#f59e0b', // Naranja
                ],
                borderRadius: 8,
              }]
            }}
          />
        </ChartCard>

        {/* Distribución por Grupos - MULTICOLOR */}
        <ChartCard title="Distribución por Grupos de Trabajo">
          <Bar
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 },
                  grid: { color: '#e2e8f0' },
                },
                x: {
                  grid: { display: false },
                },
              },
            }}
            data={{
              labels: ['Entre semana A', 'Entre semana B', 'Entre semana C'],
              datasets: [{
                data: data.distribucionGrupos.map(g => g.cantidad),
                backgroundColor: [
                  '#8b5cf6', // Violeta
                  '#ec4899', // Rosa
                  '#06b6d4', // Cyan
                ],
                borderRadius: 8,
              }]
            }}
          />
        </ChartCard>

        {/* Tendencia Bajas - LÍNEA CON GRADIENTE */}
        <ChartCard title="Tendencia de Bajas Médicas">
          <Line
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 8,
                  ticks: { precision: 0 },
                  grid: { color: '#e2e8f0' },
                },
                x: {
                  grid: { display: false },
                },
              },
            }}
            data={{
              labels: ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
              datasets: [{
                label: 'Bajas Activas',
                data: [2, 4, 5, 3, 4, 3],
                borderColor: '#f59e0b', // Naranja
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
              }]
            }}
          />
        </ChartCard>

        {/* Cobertura por Puesto - DONUT MULTICOLOR */}
        <ChartCard title="Cobertura por Puesto">
          <Doughnut
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    padding: 12,
                    usePointStyle: true,
                    font: { size: 12, weight: '600' },
                  }
                },
              },
              cutout: '65%',
            }}
            data={{
              labels: ['Cajero', 'Reponedor', 'Encargado', 'Limpieza'],
              datasets: [{
                data: [98, 102, 95, 100],
                backgroundColor: [
                  '#3b82f6', // Azul
                  '#10b981', // Verde
                  '#f59e0b', // Naranja
                  '#8b5cf6', // Violeta
                ],
                borderWidth: 0,
              }]
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}

// Componente StatCard COLORIDO con gradientes
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  gradient,
  iconColor,
  bgColor,
  trend 
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  bgColor: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
}) {
  return (
    <div className={`${bgColor} rounded-lg border border-white p-5 hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}
        </div>
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      
      <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}>
        {value}
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-xs">
          {trend.direction === 'up' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
          {trend.direction === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
          <span className={
            trend.direction === 'up' ? 'text-emerald-600 font-semibold' :
            trend.direction === 'down' ? 'text-red-600 font-semibold' :
            'text-slate-500'
          }>
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{trend.value}
          </span>
          <span className="text-slate-500 ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// Componente ChartCard (mantener blanco)
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
}
