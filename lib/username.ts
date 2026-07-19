import { prisma } from "@/lib/prisma"

const FORMATO_USERNAME = /^[a-zA-Z0-9_.]{3,20}$/

export function validarFormatoUsername(username: string): string | null {
  if (!username || !FORMATO_USERNAME.test(username)) {
    return "El nombre de usuario debe tener entre 3 y 20 caracteres (letras, numeros, puntos o guion bajo)"
  }
  return null
}

export async function usernameDisponible(username: string): Promise<boolean> {
  const existe = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } }
  })
  return !existe
}