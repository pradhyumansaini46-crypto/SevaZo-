import { cookies } from 'next/headers';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-[#E3FDF5] via-[#F5EFF8] to-[#FFE6FA] text-slate-900">
        <AppSidebar />
        <SidebarInset className="bg-transparent flex flex-col flex-1 overflow-x-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
