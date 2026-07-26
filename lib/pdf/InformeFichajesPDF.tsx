import { Document, Page, View, Text } from "@react-pdf/renderer"
import { estilosBase, fechaHoy, formatearFecha } from "./estilos"

type Fichaje = {
  fecha: string | Date
  horaEntrada?: string | Date | null
  horaSalida?: string | Date | null
  empleadoNombre?: string
}

type Props = {
  titulo: string
  subtitulo: string
  fichajes: Fichaje[]
  mostrarEmpleado: boolean
}

function formatearHora(valor: string | Date | null | undefined): string {
  if (!valor) return "—"
  const d = new Date(valor)
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

export function InformeFichajesPDF({ titulo, subtitulo, fichajes, mostrarEmpleado }: Props) {
  return (
    <Document>
      <Page size="A4" style={estilosBase.pagina}>
        <View style={estilosBase.header}>
          <Text style={estilosBase.logoTexto}>Scheduleo</Text>
          <Text style={estilosBase.fechaGeneracion}>Generado el {fechaHoy()}</Text>
        </View>

        <Text style={estilosBase.tituloDocumento}>{titulo}</Text>
        <Text style={estilosBase.subtitulo}>{subtitulo}</Text>

        <View style={estilosBase.seccion}>
          <Text style={estilosBase.tituloSeccion}>Registro de fichajes ({fichajes.length})</Text>
          <View style={estilosBase.tabla}>
            <View style={estilosBase.filaTablaHeader}>
              {mostrarEmpleado && <Text style={{ ...estilosBase.celda, flex: 2 }}>Empleado</Text>}
              <Text style={estilosBase.celda}>Fecha</Text>
              <Text style={estilosBase.celda}>Entrada</Text>
              <Text style={estilosBase.celda}>Salida</Text>
            </View>
            {fichajes.length === 0 && (
              <View style={estilosBase.filaTabla}><Text style={estilosBase.celda}>No hay registros</Text></View>
            )}
            {fichajes.map((f, i) => (
              <View key={i} style={estilosBase.filaTabla}>
                {mostrarEmpleado && <Text style={{ ...estilosBase.celda, flex: 2 }}>{f.empleadoNombre || "—"}</Text>}
                <Text style={estilosBase.celda}>{formatearFecha(f.fecha)}</Text>
                <Text style={estilosBase.celda}>{formatearHora(f.horaEntrada)}</Text>
                <Text style={estilosBase.celda}>{formatearHora(f.horaSalida)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={estilosBase.footer}>Documento generado automaticamente por Scheduleo 2.0 · Confidencial</Text>
      </Page>
    </Document>
  )
}