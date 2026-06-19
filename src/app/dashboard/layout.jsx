import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession } from "@/lib/session/usersession";



export default async function  DashboardLayout({ children }) {

    const user = await getSession();

  return (
    <div >
        <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar user={user}/>

          <div className="flex flex-1 flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
              <SidebarTrigger />
              <div className="flex-1" />
            </header>

            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
    </div>
  )
}