import 'dotenv/config'
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit"
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["error", "warn"] })
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        sessionGrant: { label: "Session Grant", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null
        // Rate limiting por email
        const identifier = String(credentials.email).toLowerCase()
        const rateLimit = checkRateLimit(identifier, 5, 15 * 60 * 1000)
        if (!rateLimit.success) {
          const minutosRestantes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000)
          throw new Error(`Demasiados intentos. Espera ${minutosRestantes} minutos.`)
        }
        const email = String(credentials.email).toLowerCase()
        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.password) return null
          const isValid = await bcrypt.compare(String(credentials.password), user.password)
          if (!isValid) return null

          // Exigir token de sesion valido, generado unicamente tras completar el 2FA real.
          // Sin esto, el 2FA seria solo una pantalla de interfaz sin proteccion real del servidor.
          const grant = String(credentials.sessionGrant || "")
          if (!grant) return null
          const grantRow = await prisma.sessionGrant.findUnique({ where: { token: grant } })
          if (!grantRow || grantRow.used || grantRow.userId !== user.id || grantRow.expiresAt < new Date()) {
            return null
          }
          await prisma.sessionGrant.update({ where: { id: grantRow.id }, data: { used: true } })

          resetRateLimit(identifier) // Reset al login exitoso
          return { id: user.id, email: user.email, name: user.name, role: (user as any).role } as any
        } catch (error) {
          console.error("Error en authorize:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = (user as any).id; token.role = (user as any).role }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})