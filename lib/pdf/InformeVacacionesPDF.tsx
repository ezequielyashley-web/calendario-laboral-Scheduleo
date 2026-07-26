import { Document, Page, View, Text } from "@react-pdf/renderer"
import { estilosBase, fechaHoy, formatearFecha } from "./estilos"

type Vacacion = {
  fechaInicio: string | Date
  fechaFin: string | Date
  estado: string
  motivo?: string | null
}

type Props = {
  empleado: { nombre: string; apellidos: string; numeroEmpleado?: string }
  empresa?: { nombre?: string; nombreComercial?: string }
  vacaciones: Vacacion[]
}

const ESTADOS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
}

export function InformeVacacionesPDF({ empleado, empresa, vacaciones }: Props) {
  const aprobadas = vacaciones.filter(v => v.estado === "APROBADA").length
  const pendientes = vacaciones.filter(v => v.estado === "PENDIENTE").length
  const rechazadas = vacaciones.filter(v => v.estado === "RECHAZADA").length

  return (
    <Document>
      <Page size="A4" style={estilosBase.pagina}>
        <View style={estilosBase.header}>
          <Text style={estilosBase.logoTexto}>Scheduleo</Text>
          <Text style={estilosBase.fechaGeneracion}>Generado el {fechaHoy()}</Text>
        </View>

        <Text style={estilosBase.tituloDocumento}>Informe de vacaciones y ausencias</Text>
        <Text style={estilosBase.subtitulo}>{empleado.nombre} {empleado.apellidos} {empleado.numeroEmpleado ? `· ${empleado.numeroEmpleado}` : ""} — {empresa?.nombreComercial || empresa?.nombre || "Empresa"}</Text>

        <View style={estilosBase.seccion}>
          <Text style={estilosBase.tituloSeccion}>Resumen</Text>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Total de solicitudes</Text><Text style={estilosBase.valor}>{vacaciones.length}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Aprobadas</Text><Text style={estilosBase.valor}>{aprobadas}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Pendientes</Text><Text style={estilosBase.valor}>{pendientes}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Rechazadas</Text><Text style={estilosBase.valor}>{rechazadas}</Text></View>
        </View>

        <View style={estilosBase.seccion}>
          <Text style={estilosBase.tituloSeccion}>Detalle de solicitudes</Text>
          <View style={estilosBase.tabla}>
            <View style={estilosBase.filaTablaHeader}>
              <Text style={estilosBase.celda}>Fecha inicio</Text>
              <Text style={estilosBase.celda}>Fecha fin</Text>
              <Text style={estilosBase.celda}>Estado</Text>
              <Text style={{ ...estilosBase.celda, flex: 2 }}>Motivo</Text>
            </View>
            {vacaciones.length === 0 && (
              <View style={estilosBase.filaTabla}><Text style={estilosBase.celda}>No hay registros</Text></View>
            )}
            {vacaciones.map((v, i) => (
              <View key={i} style={estilosBase.filaTabla}>
                <Text style={estilosBase.celda}>{formatearFecha(v.fechaInicio)}</Text>
                <Text style={estilosBase.celda}>{formatearFecha(v.fechaFin)}</Text>
                <Text style={estilosBase.celda}>{ESTADOS_LABEL[v.estado] || v.estado}</Text>
                <Text style={{ ...estilosBase.celda, flex: 2 }}>{v.motivo || "—"}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={estilosBase.footer}>Documento generado automaticamente por Scheduleo 2.0 · Confidencial</Text>
      </Page>
    </Document>
  )
}