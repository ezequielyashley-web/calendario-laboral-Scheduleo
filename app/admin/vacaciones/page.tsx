import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import TablaVacaciones from "@/components/vacaciones/TablaVacaciones"
import NuevaVacacionAdmin from "@/components/vacaciones/NuevaVacacionAdmin"

export const metadata = { title: "Vacaciones | Scheduleo" }

export default async function VacacionesPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const role = (session.user as any)?.role
  if (!["SUPER_ADMIN", "ADMIN_SEDE"].includes(role)) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🏖️ Gestión de Vacaciones</h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra las solicitudes de vacaciones de tus empleados
            </p>
          </div>
          <NuevaVacacionAdmin onCreada={() => {}} />
        </div>

        {/* Tabla principal */}
        <TablaVacaciones />

      </div>
    </div>
  )
}
