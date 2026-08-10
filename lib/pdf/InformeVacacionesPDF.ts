import { createElement as h } from "react"
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
function filaResumen(etiqueta: string, valor: string | number) {
  return h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, etiqueta), h(Text, { style: estilosBase.valor }, String(valor)))
}
export function InformeVacacionesPDF({ empleado, empresa, vacaciones }: Props) {
  const aprobadas = vacaciones.filter(v => v.estado === "APROBADA").length
  const pendientes = vacaciones.filter(v => v.estado === "PENDIENTE").length
  const rechazadas = vacaciones.filter(v => v.estado === "RECHAZADA").length
  return h(Document, null,
    h(Page, { size: "A4", style: estilosBase.pagina },
      h(View, { style: estilosBase.headerBanda },
        h(Text, { style: estilosBase.logoTexto }, "Scheduleo"),
        h(View, { style: estilosBase.headerDerecha },
          h(Text, { style: estilosBase.confidencialPill }, "CONFIDENCIAL"),
          h(Text, { style: estilosBase.fechaGeneracion }, `Generado el ${fechaHoy()}`)
        )
      ),
      h(View, { style: estilosBase.contenido },
        h(Text, { style: estilosBase.tituloDocumento }, "Informe de vacaciones y ausencias"),
        h(Text, { style: estilosBase.subtitulo }, `${empleado.nombre} ${empleado.apellidos}${empleado.numeroEmpleado ? ` · ${empleado.numeroEmpleado}` : ""} — ${empresa?.nombreComercial || empresa?.nombre || "Empresa"}`),
        h(View, { style: estilosBase.seccion },
          h(Text, { style: estilosBase.tituloSeccion }, "Resumen"),
          filaResumen("Total de solicitudes", vacaciones.length),
          filaResumen("Aprobadas", aprobadas),
          filaResumen("Pendientes", pendientes),
          filaResumen("Rechazadas", rechazadas)
        ),
        h(View, { style: estilosBase.seccion },
          h(Text, { style: estilosBase.tituloSeccion }, "Detalle de solicitudes"),
          h(View, { style: estilosBase.tabla },
            h(View, { style: estilosBase.filaTablaHeader },
              h(Text, { style: estilosBase.celdaHeader }, "Fecha inicio"),
              h(Text, { style: estilosBase.celdaHeader }, "Fecha fin"),
              h(Text, { style: estilosBase.celdaHeader }, "Estado"),
              h(Text, { style: { ...estilosBase.celdaHeader, flex: 2 } }, "Motivo")
            ),
            vacaciones.length === 0
              ? h(View, { style: estilosBase.filaTabla }, h(Text, { style: estilosBase.celda }, "No hay registros"))
              : null,
            ...vacaciones.map((v, i) =>
              h(View, { key: i, style: i % 2 === 1 ? estilosBase.filaTablaZebra : estilosBase.filaTabla },
                h(Text, { style: estilosBase.celda }, formatearFecha(v.fechaInicio)),
                h(Text, { style: estilosBase.celda }, formatearFecha(v.fechaFin)),
                h(Text, { style: estilosBase.celda }, ESTADOS_LABEL[v.estado] || v.estado),
                h(Text, { style: { ...estilosBase.celda, flex: 2 } }, v.motivo || "—")
              )
            )
          )
        )
      ),
      h(View, { style: estilosBase.footer, fixed: true },
        h(Text, { style: estilosBase.footerTexto }, "Documento generado automaticamente por Scheduleo 2.0"),
        h(Text, { style: estilosBase.footerTexto, render: ({ pageNumber, totalPages }: any) => `Pagina ${pageNumber} de ${totalPages}` })
      )
    )
  )
}