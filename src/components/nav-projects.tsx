"use client"

import { useState } from "react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { MoreHorizontal, Folder, Forward, Trash2 } from "lucide-react"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  const { isMobile } = useSidebar()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-zinc-400 font-semibold uppercase text-[11px] tracking-wider">
        Contact Groups
      </SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isOpen = openDropdown === item.name
          
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild
                className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 data-[active=true]:bg-zinc-800/80 data-[active=true]:text-zinc-100"
              >
                <Link href={item.url} className="flex items-center gap-2 w-full">
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu 
                open={isOpen} 
                onOpenChange={(open) => {
                  setOpenDropdown(open ? item.name : null)
                }}
              >
                <SidebarMenuAction
                  showOnHover
                  onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                  className="aria-expanded:bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
                <DropdownMenuContent
                  className="w-48 bg-zinc-900 border-zinc-800 text-zinc-200"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem 
                    className="focus:bg-zinc-800 cursor-pointer"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <Link href={item.url} className="flex items-center gap-2 w-full">
                      <Folder className="size-4 text-zinc-400" />
                      <span>View Group</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="focus:bg-zinc-800 cursor-pointer"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <Link href="/dashboard" className="flex items-center gap-2 w-full">
                      <Forward className="size-4 text-zinc-400" />
                      <span>Send Group SMS</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem 
                    className="focus:bg-red-950/50 text-red-400 focus:text-red-300 cursor-pointer"
                    onClick={() => {
                      setOpenDropdown(null)
                      // Handle archive action here
                      console.log(`Archive group: ${item.name}`)
                    }}
                  >
                    <Trash2 className="size-4 mr-2" />
                    <span>Archive Group</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          >
            <Link href="/dashboard/contacts" className="flex items-center gap-2 w-full">
              <MoreHorizontal className="size-4" />
              <span>View All Groups</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}