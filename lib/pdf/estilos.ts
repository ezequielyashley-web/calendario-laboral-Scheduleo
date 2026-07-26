import { StyleSheet } from "@react-pdf/renderer"

export const colores = {
  violeta: "#673DE6",
  violetaClaro: "#F5F3FF",
  texto: "#111827",
  textoSecundario: "#6B7280",
  borde: "#E5E7EB",
  fondo: "#FAFAFA",
}

export const estilosBase = StyleSheet.create({
  pagina: {
    padding: 32,
    fontSize: 10,
    color: colores.texto,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: `2px solid ${colores.violeta}`,
  },
  logoTexto: {
    fontSize: 16,
    fontWeight: 700,
    color: colores.violeta,
  },
  fechaGeneracion: {
    fontSize: 8,
    color: colores.textoSecundario,
  },
  tituloDocumento: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
    color: colores.texto,
  },
  subtitulo: {
    fontSize: 10,
    color: colores.textoSecundario,
    marginBottom: 16,
  },
  seccion: {
    marginBottom: 16,
  },
  tituloSeccion: {
    fontSize: 11,
    fontWeight: 700,
    color: colores.violeta,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `1px solid ${colores.borde}`,
  },
  fila: {
    flexDirection: "row",
    marginBottom: 6,
  },
  etiqueta: {
    width: 140,
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
    bottom: 24,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 7,
    color: colores.textoSecundario,
    borderTop: `1px solid ${colores.borde}`,
    paddingTop: 8,
  },
  tabla: {
    width: "100%",
  },
  filaTabla: {
    flexDirection: "row",
    borderBottom: `1px solid ${colores.borde}`,
    paddingVertical: 6,
  },
  filaTablaHeader: {
    flexDirection: "row",
    backgroundColor: colores.violetaClaro,
    paddingVertical: 6,
    fontWeight: 700,
  },
  celda: {
    flex: 1,
    fontSize: 9,
    paddingHorizontal: 4,
  },
})

export function fechaHoy(): string {
  return new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function formatearFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return "—"
  return new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
}