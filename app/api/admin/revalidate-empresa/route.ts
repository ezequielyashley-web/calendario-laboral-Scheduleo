import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
export async function GET() {
  revalidateTag("empresa", { expire: 0 })
  return NextResponse.json({ ok: true })
}