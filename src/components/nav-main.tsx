"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRight } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  // Track which items are open
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-zinc-400 font-semibold uppercase text-[11px] tracking-wider">
        Portal Management
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0
          const isOpen = openItems[item.title] ?? item.isActive ?? false

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild
                  className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 data-[active=true]:bg-zinc-800/80 data-[active=true]:text-zinc-100"
                >
                  <Link href={item.url} className="flex items-center gap-2 w-full">
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              open={isOpen}
              onOpenChange={(open) => {
                setOpenItems(prev => ({ ...prev, [item.title]: open }))
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 data-[active=true]:bg-zinc-800/80 data-[active=true]:text-zinc-100"
                  onClick={() => setOpenItems(prev => ({ ...prev, [item.title]: !prev[item.title] }))}
                >
                  {item.icon}
                  <span>{item.title}</span>
                  <ChevronRight className={`ml-auto size-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                </SidebarMenuButton>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton 
                          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                          href={subItem.url}
                        >
                          {subItem.title}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}