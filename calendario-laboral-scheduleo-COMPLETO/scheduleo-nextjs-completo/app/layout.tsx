import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scheduleo Desktop - Sistema de Gestión de Personal',
  description: 'Sistema profesional de gestión de personal para empresas españolas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
