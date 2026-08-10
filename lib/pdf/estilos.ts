import { StyleSheet } from "@react-pdf/renderer"
export const colores = {
  violeta: "#673DE6",
  violetaClaro: "#F5F3FF",
  texto: "#111827",
  textoSecundario: "#6B7280",
  borde: "#E5E7EB",
  fondo: "#FAFAFA",
  fondoZebra: "#FAFAFF",
  blanco: "#FFFFFF",
}
export const estilosBase = StyleSheet.create({
  pagina: {
    paddingBottom: 56,
    fontSize: 10,
    color: colores.texto,
    fontFamily: "Helvetica",
  },
  contenido: {
    paddingHorizontal: 36,
  },
  headerBanda: {
    backgroundColor: colores.violeta,
    paddingHorizontal: 36,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logoTexto: {
    fontSize: 18,
    fontWeight: 700,
    color: colores.blanco,
  },
  headerDerecha: {
    alignItems: "flex-end",
  },
  confidencialPill: {
    fontSize: 7,
    fontWeight: 700,
    color: colores.violeta,
    backgroundColor: colores.blanco,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  fechaGeneracion: {
    fontSize: 8,
    color: "#E0D9FF",
  },
  tituloDocumento: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
    color: colores.texto,
  },
  subtitulo: {
    fontSize: 10,
    color: colores.textoSecundario,
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: `1px solid ${colores.borde}`,
  },
  seccion: {
    marginBottom: 16,
    backgroundColor: colores.fondo,
    borderRadius: 6,
    padding: 14,
    border: `1px solid ${colores.borde}`,
  },
  tituloSeccion: {
    fontSize: 11,
    fontWeight: 700,
    color: colores.violeta,
    marginBottom: 10,
  },
  fila: {
    flexDirection: "row",
    marginBottom: 7,
  },
  etiqueta: {
    width: 150,
    fontSize: 9,
    color: colores.textoSecundario,
    fontWeight: 700,
  },
  valor: {
    flex: 1,
    fontSize: 9,
    color: colores.texto,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderTop: `1px solid ${colores.borde}`,
  },
  footerTexto: {
    fontSize: 7,
    color: colores.textoSecundario,
  },
  tabla: {
    width: "100%",
  },
  filaTabla: {
    flexDirection: "row",
    borderBottom: `1px solid ${colores.borde}`,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  filaTablaZebra: {
    flexDirection: "row",
    borderBottom: `1px solid ${colores.borde}`,
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: colores.fondoZebra,
  },
  filaTablaHeader: {
    flexDirection: "row",
    backgroundColor: colores.violeta,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  celda: {
    flex: 1,
    fontSize: 9,
    color: colores.texto,
  },
  celdaHeader: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    color: colores.blanco,
  },
})
export function fechaHoy(): string {
  return new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
}
export function formatearFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return "—"
  return new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
}