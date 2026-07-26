import { Document, Page, View, Text } from "@react-pdf/renderer"
import { estilosBase, colores, fechaHoy, formatearFecha } from "./estilos"

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
  return (
    <Document>
      <Page size="A4" style={estilosBase.pagina}>
        <View style={estilosBase.header}>
          <Text style={estilosBase.logoTexto}>Scheduleo</Text>
          <Text style={estilosBase.fechaGeneracion}>Generado el {fechaHoy()}</Text>
        </View>

        <Text style={estilosBase.tituloDocumento}>Ficha de empleado</Text>
        <Text style={estilosBase.subtitulo}>{empresa?.nombreComercial || empresa?.nombre || "Empresa"}</Text>

        <View style={estilosBase.seccion}>
          <Text style={estilosBase.tituloSeccion}>Datos personales</Text>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Nombre completo</Text><Text style={estilosBase.valor}>{empleado.nombre} {empleado.apellidos}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Numero de empleado</Text><Text style={estilosBase.valor}>{empleado.numeroEmpleado || "—"}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>DNI / NIE</Text><Text style={estilosBase.valor}>{empleado.dni || "—"}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Seguridad Social (NAF)</Text><Text style={estilosBase.valor}>{empleado.naf || "—"}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Fecha de nacimiento</Text><Text style={estilosBase.valor}>{formatearFecha(empleado.fechaNacimiento)}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Telefono</Text><Text style={estilosBase.valor}>{empleado.telefono || "—"}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Email</Text><Text style={estilosBase.valor}>{empleado.email || "—"}</Text></View>
        </View>

        <View style={estilosBase.seccion}>
          <Text style={estilosBase.tituloSeccion}>Datos laborales</Text>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Cargo</Text><Text style={estilosBase.valor}>{empleado.cargo || "—"}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Departamento</Text><Text style={estilosBase.valor}>{empleado.departamento || "—"}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Puesto de trabajo</Text><Text style={estilosBase.valor}>{empleado.puestoDeTrabajo?.nombre || "—"}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Grupo de trabajo</Text><Text style={estilosBase.valor}>{empleado.grupoTrabajo?.nombre || "—"}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Fecha de contratacion</Text><Text style={estilosBase.valor}>{formatearFecha(empleado.fechaContratacion)}</Text></View>
          <View style={estilosBase.fila}><Text style={estilosBase.etiqueta}>Salario bruto anual</Text><Text style={estilosBase.valor}>{empleado.salario ? `${empleado.salario} EUR` : "—"}</Text></View>
        </View>

        <Text style={estilosBase.footer}>Documento generado automaticamente por Scheduleo 2.0 · Confidencial</Text>
      </Page>
    </Document>
  )
}