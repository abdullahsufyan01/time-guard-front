import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">Attendance Management System</h2>
          </header>
          <main className="flex-1 bg-muted/30 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
