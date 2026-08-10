import { NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { Document, Page, Text } from "@react-pdf/renderer"
import { createElement as h } from "react"
export const dynamic = "force-dynamic"
export async function GET() {
  try {
    const buffer = await renderToBuffer(
      h(Document, null, h(Page, { size: "A4" }, h(Text, null, "Prueba minima")))
    )
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": "application/pdf" }
    })
  } catch (error: any) {
    console.error("PDF-TEST ERROR:", error)
    return NextResponse.json({ error: String(error?.message || error), stack: error?.stack }, { status: 500 })
  }
}