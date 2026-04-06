// app/(authenticated)/master/layout.tsx
// Layout base para panel master con Sidebar + Header

import Sidebar from '@/components/master/Sidebar';

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
