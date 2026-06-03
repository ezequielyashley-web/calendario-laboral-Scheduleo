import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["error", "warn"] })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email y contraseña requeridos")
          }
          const email = credentials.email.toLowerCase()
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.password) throw new Error("Usuario no encontrado")
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) throw new Error("Contraseña incorrecta")
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch (error) {
          console.error("ERROR EN AUTHORIZE:", error)
          throw new Error("Error de autenticación")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role }
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

export { handler as GET, handler as POST }
