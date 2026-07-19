"use client"
import { createContext, useContext, useEffect, useState } from "react"

type AparienciaState = {
  nombre?: string
  logo?: string
  colorSidebar?: string
  colorAccent?: string
}

const AparienciaContext = createContext<{
  apariencia: AparienciaState
  setPreview: (updates: Partial<AparienciaState>) => void
  recargar: () => void
}>({
  apariencia: {},
  setPreview: () => {},
  recargar: () => {},
})

export function AparienciaProvider({ children }: { children: React.ReactNode }) {
  const [apariencia, setApariencia] = useState<AparienciaState>({})

  const cargar = () => {
    fetch("/api/empresa").then(r => r.json()).then(d => {
      setApariencia({
        nombre: d?.nombreComercial || d?.nombre,
        logo: d?.logo,
        colorSidebar: d?.colorSidebar,
        colorAccent: d?.colorAccent,
      })
    }).catch(() => {})
  }

  useEffect(() => { cargar() }, [])

  const setPreview = (updates: Partial<AparienciaState>) => {
    setApariencia(prev => ({ ...prev, ...updates }))
  }

  return (
    <AparienciaContext.Provider value={{ apariencia, setPreview, recargar: cargar }}>
      {children}
    </AparienciaContext.Provider>
  )
}

export const useApariencia = () => useContext(AparienciaContext)