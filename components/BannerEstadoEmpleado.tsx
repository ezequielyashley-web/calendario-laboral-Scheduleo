"use client"

interface Props {
  empleado: any
}

export default function BannerEstadoEmpleado({ empleado }: Props) {
  const hoy = new Date()
  const hoyStr = hoy.toISOString().split("T")[0]

  // Verificar baja activa
  const bajaActiva = empleado.bajas?.find((b: any) =>
    b.estado === "ACTIVA" && new Date(b.fechaInicio) <= hoy && (!b.fechaFin || new Date(b.fechaFin) >= hoy)
  )

  // Verificar vacación aprobada hoy
  const vacacionHoy = empleado.vacaciones?.find((v: any) =>
    v.estado === "APROBADA" &&
    v.tipo !== "ASUNTOS_PROPIOS" &&
    new Date(v.fechaInicio).toISOString().split("T")[0] <= hoyStr &&
    new Date(v.fechaFin).toISOString().split("T")[0] >= hoyStr
  )

  // Verificar asunto propio hoy
  const asuntoHoy = empleado.vacaciones?.find((v: any) =>
    v.estado === "APROBADA" &&
    v.tipo === "ASUNTOS_PROPIOS" &&
    new Date(v.fechaInicio).toISOString().split("T")[0] <= hoyStr &&
    new Date(v.fechaFin).toISOString().split("T")[0] >= hoyStr
  )

  // Verificar cambio de turno hoy
  const cambioHoy = empleado.cambiosTurno?.find((c: any) => {
    const fechaOrigen = c.fechaOrigen ? new Date(c.fechaOrigen).toISOString().split("T")[0] : null
    const fechaDestino = c.fechaDestino ? new Date(c.fechaDestino).toISOString().split("T")[0] : null
    return fechaOrigen === hoyStr || fechaDestino === hoyStr
  })

  // Verificar si es domingo o festivo (simplificado)
  const esDomingo = hoy.getDay() === 0

  // Determinar estado
  let estado = {
    emoji: "🟢",
    label: "Trabajando hoy",
    desc: `Turno normal · ${hoy.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}`,
    bg: "#dcfce7",
    border: "#86efac",
    color: "#15803d",
  }

  if (bajaActiva) {
    const dias = Math.floor((hoy.getTime() - new Date(bajaActiva.fechaInicio).getTime()) / 86400000)
    estado = {
      emoji: "🏥",
      label: "De baja médica",
      desc: `${bajaActiva.tipo?.replace("_", " ")} · Día ${dias} · Desde ${new Date(bajaActiva.fechaInicio).toLocaleDateString("es-ES")}`,
      bg: "#fee2e2",
      border: "#fca5a5",
      color: "#b91c1c",
    }
  } else if (vacacionHoy) {
    const diasRestantes = Math.ceil((new Date(vacacionHoy.fechaFin).getTime() - hoy.getTime()) / 86400000)
    estado = {
      emoji: "🏖️",
      label: "De vacaciones",
      desc: `Hasta ${new Date(vacacionHoy.fechaFin).toLocaleDateString("es-ES")} · ${diasRestantes} día${diasRestantes !== 1 ? "s" : ""} restante${diasRestantes !== 1 ? "s" : ""}`,
      bg: "#fed7aa",
      border: "#fb923c",
      color: "#c2410c",
    }
  } else if (asuntoHoy) {
    estado = {
      emoji: "📋",
      label: "Asunto propio",
      desc: `Art. 37.3 ET · ${new Date(asuntoHoy.fechaInicio).toLocaleDateString("es-ES")}`,
      bg: "#fce7f3",
      border: "#f9a8d4",
      color: "#9d174d",
    }
  } else if (cambioHoy) {
    const esOrigen = cambioHoy.empleadoOrigenId === empleado.id
    const otroEmpleado = esOrigen ? cambioHoy.empleadoDestino : cambioHoy.empleadoOrigen
    estado = {
      emoji: "🔄",
      label: "Cambio de turno",
      desc: `Con ${otroEmpleado?.nombre} ${otroEmpleado?.apellidos} · Aprobado`,
      bg: "#e0e7ff",
      border: "#a5b4fc",
      color: "#3730a3",
    }
  } else if (esDomingo) {
    estado = {
      emoji: "⚪",
      label: "Día libre",
      desc: "Domingo — día de descanso semanal",
      bg: "#f3f4f6",
      border: "#d1d5db",
      color: "#6b7280",
    }
  }

  return (
    <div style={{ background: estado.bg, border: `1px solid ${estado.border}`, borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
      <div style={{ fontSize: 28 }}>{estado.emoji}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: estado.color, margin: 0 }}>{estado.label}</p>
        <p style={{ fontSize: 12, color: estado.color, opacity: 0.8, margin: "2px 0 0" }}>{estado.desc}</p>
      </div>
      <div style={{ fontSize: 12, color: estado.color, opacity: 0.6, whiteSpace: "nowrap" }}>
        {hoy.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
      </div>
    </div>
  )
}
