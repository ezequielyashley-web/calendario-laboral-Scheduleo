import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// ✅ Prisma singleton (evita múltiples conexiones en dev)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// ✅ Configuración NextAuth
const authConfig = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // 🔍 Validación básica
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email y contraseña requeridos")
          }

          const email = credentials.email.toLowerCase()
          const password = credentials.password

          console.log("🔐 LOGIN ATTEMPT:", email)

          // 🔎 Buscar usuario
          const user = await prisma.user.findUnique({
            where: { email },
          })

          console.log("👤 USER FOUND:", user?.email)

          if (!user || !user.password) {
            throw new Error("Usuario no encontrado")
          }

          // 🔑 Comparar contraseña
          const isValid = await bcrypt.compare(password, user.password)

          if (!isValid) {
            throw new Error("Contraseña incorrecta")
          }

          // ✅ Login OK
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("🔥 ERROR EN AUTHORIZE:", error)
          throw new Error("Error de autenticación")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

// ✅ EXPORTS CORRECTOS (CLAVE PARA QUE FUNCIONE)
export const { handlers, auth, signIn, signOut } = authConfig
export const { GET, POST } = handlers
