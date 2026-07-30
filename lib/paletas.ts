export type PaletaKey = "azul" | "violeta" | "verde" | "ambar" | "rosa" | "gris"

export interface Paleta {
  label: string
  acento: string
  gradInicio: string
  gradFin: string
  fondo: string
  texto: string
}

export const PALETAS: Record<PaletaKey, Paleta> = {
  azul:    { label: "Azul",    acento: "#2F63F4", gradInicio: "#3b82f6", gradFin: "#1e40af", fondo: "#EFF4FF", texto: "#0F172A" },
  violeta: { label: "Violeta", acento: "#6366f1", gradInicio: "#6366f1", gradFin: "#8b5cf6", fondo: "#ede9fe", texto: "#1e1b4b" },
  verde:   { label: "Verde",   acento: "#059669", gradInicio: "#10b981", gradFin: "#047857", fondo: "#d1fae5", texto: "#064e3b" },
  ambar:   { label: "Ambar",   acento: "#d97706", gradInicio: "#f59e0b", gradFin: "#b45309", fondo: "#fef3c7", texto: "#78350f" },
  rosa:    { label: "Rosa",    acento: "#db2777", gradInicio: "#ec4899", gradFin: "#be185d", fondo: "#fce7f3", texto: "#831843" },
  gris:    { label: "Gris",    acento: "#475569", gradInicio: "#64748b", gradFin: "#334155", fondo: "#f1f5f9", texto: "#0f172a" },
}

export function getPaleta(key?: string | null): Paleta {
  return PALETAS[(key as PaletaKey) || "azul"] || PALETAS.azul
}