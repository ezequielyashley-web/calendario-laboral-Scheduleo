import { createElement as h } from "react"
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
  return h(Document, null,
    h(Page, { size: "A4", style: estilosBase.pagina },
      h(View, { style: estilosBase.header },
        h(Text, { style: estilosBase.logoTexto }, "Scheduleo"),
        h(Text, { style: estilosBase.fechaGeneracion }, `Generado el ${fechaHoy()}`)
      ),
      h(Text, { style: estilosBase.tituloDocumento }, titulo),
      h(Text, { style: estilosBase.subtitulo }, subtitulo),
      h(View, { style: estilosBase.seccion },
        h(Text, { style: estilosBase.tituloSeccion }, `Registro de fichajes (${fichajes.length})`),
        h(View, { style: estilosBase.tabla },
          h(View, { style: estilosBase.filaTablaHeader },
            mostrarEmpleado ? h(Text, { style: { ...estilosBase.celda, flex: 2 } }, "Empleado") : null,
            h(Text, { style: estilosBase.celda }, "Fecha"),
            h(Text, { style: estilosBase.celda }, "Entrada"),
            h(Text, { style: estilosBase.celda }, "Salida")
          ),
          fichajes.length === 0
            ? h(View, { style: estilosBase.filaTabla }, h(Text, { style: estilosBase.celda }, "No hay registros"))
            : null,
          ...fichajes.map((f, i) =>
            h(View, { key: i, style: estilosBase.filaTabla },
              mostrarEmpleado ? h(Text, { style: { ...estilosBase.celda, flex: 2 } }, f.empleadoNombre || "—") : null,
              h(Text, { style: estilosBase.celda }, formatearFecha(f.fecha)),
              h(Text, { style: estilosBase.celda }, formatearHora(f.horaEntrada)),
              h(Text, { style: estilosBase.celda }, formatearHora(f.horaSalida))
            )
          )
        )
      ),
      h(Text, { style: estilosBase.footer }, "Documento generado automaticamente por Scheduleo 2.0 \u00b7 Confidencial")
    )
  )
}