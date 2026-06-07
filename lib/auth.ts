import 'dotenv/config'
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

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
      },
      async authorize(credentials, request) {
        console.log("🔐 AUTHORIZE llamado con:", credentials?.email)
        if (!credentials?.email || !credentials?.password) return null
        const email = String(credentials.email).toLowerCase()
        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.password) return null
          const isValid = await bcrypt.compare(String(credentials.password), user.password)
          if (!isValid) return null
          return { id: user.id, email: user.email, name: user.name, role: (user as any).role } as any
        } catch (error) {
          console.error("❌ ERROR:", error)
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
