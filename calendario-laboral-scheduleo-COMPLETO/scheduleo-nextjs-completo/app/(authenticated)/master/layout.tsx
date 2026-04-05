// app/(authenticated)/master/layout.tsx
// Layout base para panel master con Sidebar + Header

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Sidebar from '@/components/master/Sidebar';

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Verificar autenticación
  if (!session) {
    redirect('/auth/signin');
  }

  // Verificar rol de master
  if (!['SUPER_ADMIN', 'ADMIN_SEDE'].includes(session.user.rol)) {
    redirect('/empleado');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      {/* Área principal con margen para sidebar */}
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}
