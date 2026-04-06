// app/(authenticated)/master/layout.tsx
import Sidebar from '@/components/master/Sidebar';

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}