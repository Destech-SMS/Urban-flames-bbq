"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDown, Plus } from "lucide-react"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ReactNode
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (teams.length > 0 && !activeTeam) {
      setActiveTeam(teams[0])
    }
  }, [teams, activeTeam])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          {/* Use SidebarMenuButton as the trigger directly */}
          <SidebarMenuButton
            size="lg"
            onClick={() => setIsOpen(!isOpen)}
            className="data-[state=open]:bg-zinc-800 data-[state=open]:text-zinc-100 hover:bg-zinc-800/80 text-zinc-200"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-amber-600 text-zinc-950 font-bold">
              {activeTeam.logo}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-zinc-100">
                {activeTeam.name}
              </span>
              <span className="truncate text-xs text-zinc-400">
                {activeTeam.plan}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-zinc-400" />
          </SidebarMenuButton>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-zinc-900 border-zinc-800 text-zinc-200"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider">
                Branches & Hubs
              </DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => {
                    setActiveTeam(team)
                    setIsOpen(false)
                  }}
                  className="gap-2 p-2 focus:bg-zinc-800 cursor-pointer text-zinc-200"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-amber-500">
                    {team.logo}
                  </div>
                  <span className="font-medium text-sm">{team.name}</span>
                  <DropdownMenuShortcut className="text-zinc-500">
                    ⌘{index + 1}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="gap-2 p-2 focus:bg-zinc-800 cursor-pointer text-zinc-400 focus:text-zinc-200"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-dashed border-zinc-700 bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-xs">
                  Add new branch
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}