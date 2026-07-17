import DesktopLayout from "@/components/desktop/DesktopLayout"
import BienvenidaPopup from "@/components/BienvenidaPopup"
import TourBienvenida from "@/components/TourBienvenida"
import { auth } from "@/lib/auth"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let email: string | undefined
  try {
    const session = await auth()
    email = session?.user?.email ?? undefined
  } catch {}

  return (
    <DesktopLayout>
      {children}
      <BienvenidaPopup email={email} />
      <TourBienvenida />
    </DesktopLayout>
  )
}