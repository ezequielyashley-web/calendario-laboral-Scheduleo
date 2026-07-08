import { NextRequest, NextResponse } from "next/server"
import { requireAuth, isUnauthorized } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit"

export async function GET() {
  try {
    const empresa = await prisma.$queryRaw`
      SELECT * FROM "Empresa" WHERE id = 'empresa-001' LIMIT 1
    ` as any[]
    return NextResponse.json(empresa[0] || {})
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener empresa" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json()
    const { masterPassword, ...datos } = body

    if (!masterPassword) return NextResponse.json({ error: "Contraseña master requerida" }, { status: 401 })

    const rateLimitId = `masterpass_${auth.userId}`
    const rateLimit = checkRateLimit(rateLimitId, 5, 15 * 60 * 1000)
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Demasiados intentos fallidos. Intenta de nuevo en unos minutos." }, { status: 429 })
    }
    const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!admin) return NextResponse.json({ error: "No se encontró admin" }, { status: 401 })

    const ok = await bcrypt.compare(masterPassword, admin.password)
    if (!ok) return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    resetRateLimit(rateLimitId)

    await prisma.$executeRaw`
      UPDATE "Empresa" SET
        nombre = COALESCE(${datos.nombre}, nombre),
        "razonSocial" = COALESCE(${datos.razonSocial}, "razonSocial"),
        "nombreComercial" = COALESCE(${datos.nombreComercial}, "nombreComercial"),
        cif = COALESCE(${datos.cif}, cif),
        direccion = COALESCE(${datos.direccion}, direccion),
        "codigoPostal" = COALESCE(${datos.codigoPostal}, "codigoPostal"),
        ciudad = COALESCE(${datos.ciudad}, ciudad),
        provincia = COALESCE(${datos.provincia}, provincia),
        pais = COALESCE(${datos.pais}, pais),
        telefono = COALESCE(${datos.telefono}, telefono),
        email = COALESCE(${datos.email}, email),
        "emailFacturacion" = COALESCE(${datos.emailFacturacion}, "emailFacturacion"),
        web = COALESCE(${datos.web}, web),
        "cuentaBancaria" = COALESCE(${datos.cuentaBancaria}, "cuentaBancaria"),
        "convenioColectivo" = COALESCE(${datos.convenioColectivo}, "convenioColectivo"),
        "actividadEconomica" = COALESCE(${datos.actividadEconomica}, "actividadEconomica"),
        cnae = COALESCE(${datos.cnae}, cnae),
        "seguridadSocial" = COALESCE(${datos.seguridadSocial}, "seguridadSocial"),
        mutua = COALESCE(${datos.mutua}, mutua),
        logo = COALESCE(${datos.logo}, logo),
        "colorSidebar" = COALESCE(${datos.colorSidebar}, "colorSidebar"),
        "colorAccent" = COALESCE(${datos.colorAccent}, "colorAccent"),
        "updatedAt" = NOW()
      WHERE id = 'empresa-001'
    `

    const updated = await prisma.$queryRaw`SELECT * FROM "Empresa" WHERE id = 'empresa-001' LIMIT 1` as any[]
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar empresa" }, { status: 500 })
  }
}


export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isUnauthorized(auth)) return auth
    const body = await req.json()
    const { masterPassword } = body
    if (!masterPassword) return NextResponse.json({ error: "Contrasena master requerida" }, { status: 401 })
    const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    if (!admin) return NextResponse.json({ error: "No se encontro admin" }, { status: 401 })
    const ok = await bcrypt.compare(masterPassword, admin.password)
    if (!ok) return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 401 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al verificar" }, { status: 500 })
  }
}