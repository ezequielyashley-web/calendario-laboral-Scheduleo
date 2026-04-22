// SCHEDULEO - PÁGINA PRINCIPAL

import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function HomePage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  // Redirigir según rol
  if (session.user.rol === 'EMPLEADO') {
    redirect('/empleado/dashboard')
  }
  
  redirect('/master/dashboard')
}
