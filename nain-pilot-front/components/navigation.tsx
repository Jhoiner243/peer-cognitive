"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Home, MessageSquare, Settings, User, Workflow } from "lucide-react"

const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Flow Management",
    url: "/flow",
    icon: Workflow,
  },
  {
    title: "Chat Interface",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

export function Navigation() {
  return (
    <>
      {/* Logo/Brand Section */}
      <div className="p-4 border-b bg-sidebar-header/50">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-semibold text-sm text-sidebar-foreground">Peer Cognitive</h2>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                className="hover:bg-sidebar-accent transition-colors duration-200 rounded-lg group"
              >
                <a href={item.url} className="group/item">
                  <item.icon className="w-4 h-4 text-sidebar-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sidebar-foreground group-hover:text-primary transition-colors">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </>
  )
}