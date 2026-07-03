import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/encryption"

export async function GET() {
  try {
    const configs = await prisma.$queryRaw`
      SELECT id, proveedor, modelo, activo, CASE WHEN "apiKeyEnc" IS NOT NULL AND "apiKeyEnc" != '' THEN true ELSE false END as "tieneKey"
      FROM "ConfiguracionAI" WHERE id = 'ai-config-001' LIMIT 1
    ` as any[]
    return NextResponse.json(configs[0] || { proveedor: "anthropic", modelo: "claude-sonnet-4-6", activo: false, tieneKey: false })
  } catch {
    return NextResponse.json({ proveedor: "anthropic", modelo: "claude-sonnet-4-6", activo: false, tieneKey: false })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { proveedor, modelo, activo, apiKey } = await req.json()
    const apiKeyEnc = apiKey ? encrypt(apiKey) : undefined

    if (apiKeyEnc) {
      await prisma.$executeRaw`
        UPDATE "ConfiguracionAI" SET proveedor=${proveedor}, modelo=${modelo}, activo=${activo}, "apiKeyEnc"=${apiKeyEnc}, "updatedAt"=NOW()
        WHERE id='ai-config-001'
      `
    } else {
      await prisma.$executeRaw`
        UPDATE "ConfiguracionAI" SET proveedor=${proveedor}, modelo=${modelo}, activo=${activo}, "updatedAt"=NOW()
        WHERE id='ai-config-001'
      `
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}