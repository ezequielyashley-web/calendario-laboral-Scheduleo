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
export function FichaEmpleadoPDF({ empleado, empresa }: Props) {
  return h(Document, null,
    h(Page, { size: "A4", style: estilosBase.pagina },
      h(View, { style: estilosBase.header },
        h(Text, { style: estilosBase.logoTexto }, "Scheduleo"),
        h(Text, { style: estilosBase.fechaGeneracion }, `Generado el ${fechaHoy()}`)
      ),
      h(Text, { style: estilosBase.tituloDocumento }, "Ficha de empleado"),
      h(Text, { style: estilosBase.subtitulo }, empresa?.nombreComercial || empresa?.nombre || "Empresa"),
      h(View, { style: estilosBase.seccion },
        h(Text, { style: estilosBase.tituloSeccion }, "Datos personales"),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Nombre completo"), h(Text, { style: estilosBase.valor }, `${empleado.nombre} ${empleado.apellidos}`)),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Numero de empleado"), h(Text, { style: estilosBase.valor }, empleado.numeroEmpleado || "—")),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "DNI / NIE"), h(Text, { style: estilosBase.valor }, empleado.dni || "—")),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Seguridad Social (NAF)"), h(Text, { style: estilosBase.valor }, empleado.naf || "—")),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Fecha de nacimiento"), h(Text, { style: estilosBase.valor }, formatearFecha(empleado.fechaNacimiento))),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Telefono"), h(Text, { style: estilosBase.valor }, empleado.telefono || "—")),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Email"), h(Text, { style: estilosBase.valor }, empleado.email || "—"))
      ),
      h(View, { style: estilosBase.seccion },
        h(Text, { style: estilosBase.tituloSeccion }, "Datos laborales"),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Cargo"), h(Text, { style: estilosBase.valor }, empleado.cargo || "—")),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Departamento"), h(Text, { style: estilosBase.valor }, empleado.departamento || "—")),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Puesto de trabajo"), h(Text, { style: estilosBase.valor }, empleado.puestoDeTrabajo?.nombre || "—")),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Grupo de trabajo"), h(Text, { style: estilosBase.valor }, empleado.grupoTrabajo?.nombre || "—")),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Fecha de contratacion"), h(Text, { style: estilosBase.valor }, formatearFecha(empleado.fechaContratacion))),
        h(View, { style: estilosBase.fila }, h(Text, { style: estilosBase.etiqueta }, "Salario bruto anual"), h(Text, { style: estilosBase.valor }, empleado.salario ? `${empleado.salario} EUR` : "—"))
      ),
      h(Text, { style: estilosBase.footer }, "Documento generado automaticamente por Scheduleo 2.0 \u00b7 Confidencial")
    )
  )
}