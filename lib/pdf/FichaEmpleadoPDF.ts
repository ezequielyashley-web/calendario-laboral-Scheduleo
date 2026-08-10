import { createElement as h } from "react"
import { Document, Page, View, Text } from "@react-pdf/renderer"
import { estilosBase, fechaHoy, formatearFecha } from "./estilos"
type Props = {
  empleado: {
    nombre: string
    apellidos: string
    numeroEmpleado?: string
    dni?: string
    naf?: string
    telefono?: string
    email?: string
    cargo?: string
    departamento?: string
    fechaContratacion?: string | Date
    fechaNacimiento?: string | Date
    salario?: string | number
    puestoDeTrabajo?: { nombre?: string } | null
    grupoTrabajo?: { nombre?: string } | null
  }
  empresa?: { nombre?: string; nombreComercial?: string }
}
function fila(etiqueta: string, valor: string) {
  return h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, etiqueta), h(Text, { style: estilosBase.valor }, valor))
}
export function FichaEmpleadoPDF({ empleado, empresa }: Props) {
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
        h(Text, { style: estilosBase.tituloDocumento }, "Ficha de empleado"),
        h(Text, { style: estilosBase.subtitulo }, empresa?.nombreComercial || empresa?.nombre || "Empresa"),
        h(View, { style: estilosBase.seccion },
          h(Text, { style: estilosBase.tituloSeccion }, "Datos personales"),
          fila("Nombre completo", `${empleado.nombre} ${empleado.apellidos}`),
          fila("Numero de empleado", empleado.numeroEmpleado || "—"),
          fila("DNI / NIE", empleado.dni || "—"),
          fila("Seguridad Social (NAF)", empleado.naf || "—"),
          fila("Fecha de nacimiento", formatearFecha(empleado.fechaNacimiento)),
          fila("Telefono", empleado.telefono || "—"),
          fila("Email", empleado.email || "—")
        ),
        h(View, { style: estilosBase.seccion },
          h(Text, { style: estilosBase.tituloSeccion }, "Datos laborales"),
          fila("Cargo", empleado.cargo || "—"),
          fila("Departamento", empleado.departamento || "—"),
          fila("Puesto de trabajo", empleado.puestoDeTrabajo?.nombre || "—"),
          fila("Grupo de trabajo", empleado.grupoTrabajo?.nombre || "—"),
          fila("Fecha de contratacion", formatearFecha(empleado.fechaContratacion)),
          fila("Salario bruto anual", empleado.salario ? `${empleado.salario} EUR` : "—")
        )
      ),
      h(View, { style: estilosBase.footer, fixed: true },
        h(Text, { style: estilosBase.footerTexto }, "Documento generado automaticamente por Scheduleo 2.0"),
        h(Text, { style: estilosBase.footerTexto, render: ({ pageNumber, totalPages }: any) => `Pagina ${pageNumber} de ${totalPages}` })
      )
    )
  )
}