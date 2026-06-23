import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { getSession } from "@/lib/session/usersession";



export default async function  DashboardLayout({ children }) {

    const user = await getSession();
    await authClient.getSession({ refresh: true });
    console.log(user)

  return (
    <div className="mt-20">
        <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen  w-full">
          <AppSidebar user={user}/>

          <div className="flex flex-1 dark:bg-zinc-950 flex-col ">
            <header className="flex h-10 dark:bg-muted/40 items-center gap-4 border-b bg-background px-4">
              <SidebarTrigger />
              <div className="flex-1 dark:bg-zinc-950" />
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