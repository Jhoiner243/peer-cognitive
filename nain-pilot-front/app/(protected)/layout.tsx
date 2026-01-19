"use client"

import { ChatSidebar } from "@/components/ChatSidebar"
import { Navigation } from "@/components/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { MessagesProvider } from "../../contexts/MessagesContext"
import { ModelSelectorComponent } from "./components/ModelSelector"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MessagesProvider>
      <SidebarProvider>
        <Sidebar>
          <Navigation />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="flex items-center gap-2 px-8">
              <ModelSelectorComponent />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </main>
         </SidebarInset>
        <ChatSidebar collapsible="none" className="" />
      </SidebarProvider>
    </MessagesProvider>
  )
}