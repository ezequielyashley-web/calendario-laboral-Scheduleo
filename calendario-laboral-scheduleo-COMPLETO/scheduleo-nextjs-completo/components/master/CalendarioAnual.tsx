// components/master/CalendarioAnual.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  ComunidadAutonoma,
  COMUNIDADES_LABELS,
  FESTIVOS_NACIONALES_2026,
  FESTIVOS_AUTONOMICOS_2026,
  MESES_LABELS,
  DIAS_SEMANA_LABELS,
  ConfiguracionCalendario,
} from '@/types/calendario';

interface CalendarioAnualProps {
  comunidadInicial: ComunidadAutonoma;
}

export default function CalendarioAnual({ comunidadInicial }: CalendarioAnualProps) {
  const [config, setConfig] = useState<ConfiguracionCalendario>({
    comunidad: comunidadInicial,
    domingosLaborablesDiciembre: [20],
    modoTema: 'auto',
  });

  const [festivosActivos, setFestivosActivos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const comunidad = (localStorage.getItem('comunidadSeleccionada') as ComunidadAutonoma) || comunidadInicial;
      const tema = (localStorage.getItem('modoTema') as 'auto' | 'light' | 'dark') || 'auto';
      const domingos = JSON.parse(localStorage.getItem('domingosLaborables') || '[20]');

      setConfig({ comunidad, domingosLaborablesDiciembre: domingos, modoTema: tema });
      aplicarTema(tema);
    }
  }, [comunidadInicial]);

  useEffect(() => {
    const festivos = {
      ...FESTIVOS_NACIONALES_2026,
      ...(FESTIVOS_AUTONOMICOS_2026[config.comunidad] || {}),
    };
    setFestivosActivos(festivos);
  }, [config.comunidad]);

  const aplicarTema = (modo: 'auto' | 'light' | 'dark') => {
    if (typeof window === 'undefined') return;
    if (modo === 'auto') {
      const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.className = prefereDark ? 'dark-mode' : 'light-mode';
    } else {
      document.body.className = modo === 'dark' ? 'dark-mode' : 'light-mode';
    }
  };

  const handleComunidadChange = (comunidad: ComunidadAutonoma) => {
    setConfig((prev) => ({ ...prev, comunidad }));
    localStorage.setItem('comunidadSeleccionada', comunidad);
  };

  const handleTemaChange = (tema: 'auto' | 'light' | 'dark') => {
    setConfig((prev) => ({ ...prev, modoTema: tema }));
    localStorage.setItem('modoTema', tema);
    aplicarTema(tema);
  };

  const handleDomingoToggle = (dia: number) => {
    setConfig((prev) => {
      const domingos = prev.domingosLaborablesDiciembre.includes(dia)
        ? prev.domingosLaborablesDiciembre.filter((d) => d !== dia)
        : [...prev.domingosLaborablesDiciembre, dia];
      localStorage.setItem('domingosLaborables', JSON.stringify(domingos));
      return { ...prev, domingosLaborablesDiciembre: domingos };
    });
  };

  const generarMes = (mes: number) => {
    const year = 2026;
    const primerDia = new Date(year, mes, 1);
    const ultimoDia = new Date(year, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    let primerDiaSemana = primerDia.getDay();
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    const dias = [];
    for (let i = 0; i < primerDiaSemana; i++) dias.push(null);
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = `${year}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const esDomingo = new Date(year, mes, dia).getDay() === 0;
      const esFestivo = festivosActivos[fecha];
      const esDiciembre = mes === 11;
      const esDomingoLaborable = esDiciembre && config.domingosLaborablesDiciembre.includes(dia);

      dias.push({ dia, fecha, esDomingo, esFestivo: !!esFestivo, festivoNombre: esFestivo, esDomingoLaborable });
    }
    return dias;
  };

  const totalNacionales = Object.keys(FESTIVOS_NACIONALES_2026).length;
  const totalAutonomicos = Object.keys(FESTIVOS_AUTONOMICOS_2026[config.comunidad] || {}).length;

  return (
    <div>
      {/* Selector Comunidad */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex-1">
            <label className="text-sm font-semibold text-blue-900 mb-1 block">Comunidad Autónoma:</label>
            <select value={config.comunidad} onChange={(e) => handleComunidadChange(e.target.value as ComunidadAutonoma)} className="w-full px-3 py-2 text-sm font-medium border border-blue-300 rounded-md bg-white">
              {Object.entries(COMUNIDADES_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-blue-700">
            <div className="font-bold mb-1">Festivos 2026:</div>
            <div>{totalNacionales + totalAutonomicos} días ({totalNacionales} nacionales + {totalAutonomicos} autonómicos)</div>
          </div>
        </div>
      </div>

      {/* Domingos Diciembre */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <div className="flex-1">
            <div className="text-sm font-bold text-amber-900 mb-2">Domingos Laborables en Diciembre 2026</div>
            <div className="text-xs text-amber-700 mb-3">Marca los domingos que SÍ se trabajan:</div>
            <div className="grid grid-cols-4 gap-3">
              {[6, 13, 20, 27].map((dia) => (
                <label key={dia} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={config.domingosLaborablesDiciembre.includes(dia)} onChange={() => handleDomingoToggle(dia)} className="w-4 h-4 cursor-pointer" />
                  <span className="text-amber-900 font-medium">Dom {dia} dic</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selector Tema */}
      <div className="flex items-center justify-end gap-2 mb-6">
        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
        <select value={config.modoTema} onChange={(e) => handleTemaChange(e.target.value as 'auto' | 'light' | 'dark')} className="px-3 py-2 text-sm font-medium border border-slate-300 rounded-md bg-white">
          <option value="auto">Automático</option>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </select>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-4 mb-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-blue-300 rounded"></div>
          <span className="text-xs font-medium text-slate-700">Día laboral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded shadow-sm"></div>
          <span className="text-xs font-medium text-slate-700">Domingo no laboral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded shadow-sm"></div>
          <span className="text-xs font-medium text-slate-700">Domingo laboral (Dic)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-300 rounded shadow-sm"></div>
          <span className="text-xs font-medium text-slate-700">Festivo</span>
        </div>
      </div>

      {/* Grid 12 meses */}
      <div className="grid-bg rounded-xl p-6">
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, mes) => {
            const dias = generarMes(mes);
            return (
              <div key={mes} className="mes-card rounded-lg border shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 text-white">
                  <h3 className="text-sm font-bold uppercase tracking-wide">{MESES_LABELS[mes]}</h3>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-7 gap-1 mb-2 dia-header-bg rounded p-2">
                    {DIAS_SEMANA_LABELS.map((dia) => (
                      <div key={dia} className="text-center text-sm font-bold dia-header-text uppercase">{dia}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {dias.map((dia, idx) => {
                      if (!dia) return <div key={idx} className="aspect-square"></div>;
                      let bgColor = 'dia-laboral', borderColor = 'border-blue-200', textColor = '';
                      if (dia.esDomingo && dia.esDomingoLaborable) {
                        bgColor = 'bg-red-100'; borderColor = 'border-red-300'; textColor = 'text-red-800';
                      } else if (dia.esDomingo) {
                        bgColor = 'bg-red-400'; borderColor = 'border-red-500'; textColor = 'text-white';
                      } else if (dia.esFestivo) {
                        bgColor = 'bg-purple-300'; borderColor = 'border-purple-400'; textColor = 'text-purple-900';
                      }
                      return (
                        <div key={idx} className={`dia-cell aspect-square rounded border ${bgColor} ${borderColor} ${textColor} flex items-center justify-center text-xs font-semibold transition-all shadow-sm relative group`} title={dia.festivoNombre}>
                          {dia.dia}
                          {dia.festivoNombre && <div className="tooltip">{dia.festivoNombre}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .dia-cell .tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 8px; padding: 6px 10px; background: #0f172a; color: white; font-size: 10px; border-radius: 4px; white-space: nowrap; opacity: 0; visibility: hidden; transition: opacity 0.2s; z-index: 10; pointer-events: none; }
        .dia-cell:hover .tooltip { opacity: 1; visibility: visible; }
        body.light-mode { background: #f0f9ff; }
        body.light-mode .grid-bg { background: #e2e8f0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }
        body.light-mode .mes-card { background: #ffffff; border-color: #bbf7d0; }
        body.light-mode .dia-header-bg { background: #d6d3d1; }
        body.light-mode .dia-header-text { color: #57534e; }
        body.light-mode .dia-laboral { background: #ffffff; border-color: #cbd5e1; }
        body.light-mode .dia-laboral:hover { background: #eff6ff; }
        body.dark-mode { background: #0f172a; color: #e2e8f0; }
        body.dark-mode .grid-bg { background: #1e293b; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); }
        body.dark-mode .mes-card { background: #1e293b; border-color: #334155; }
        body.dark-mode .dia-header-bg { background: #334155; }
        body.dark-mode .dia-header-text { color: #cbd5e1; }
        body.dark-mode .dia-laboral { background: #1e293b; border-color: #475569; color: #e2e8f0; }
        body.dark-mode .dia-laboral:hover { background: #334155; }
      `}</style>
    </div>
  );
}
