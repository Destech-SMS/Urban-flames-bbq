"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  ChevronsUpDown,
  Sparkles,
  BadgeCheck,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const userInitials =
    user.name && user.name !== "Loading..."
      ? user.name
          .trim()
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "UF"

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <SidebarMenuButton
            size="lg"
            onClick={() => setIsOpen(!isOpen)}
            className="data-[state=open]:bg-zinc-800 data-[state=open]:text-zinc-100 hover:bg-zinc-800/80 text-zinc-200"
          >
            <Avatar className="h-8 w-8 rounded-lg bg-zinc-800">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-zinc-800 text-zinc-200 text-xs font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-zinc-100">{user.name}</span>
              <span className="truncate text-xs text-zinc-400">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-zinc-400" />
          </SidebarMenuButton>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-zinc-900 border-zinc-800 text-zinc-200"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* Wrapped in DropdownMenuGroup to provide Base UI's MenuGroupContext */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg bg-zinc-800">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-zinc-800 text-zinc-200 text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-zinc-100">{user.name}</span>
                    <span className="truncate text-xs text-zinc-400">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="focus:bg-zinc-800 cursor-pointer text-amber-400 focus:text-amber-300"
                onClick={() => setIsOpen(false)}
              >
                <Sparkles className="size-4 mr-2" />
                <span>SMS Credit Balance</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="focus:bg-zinc-800 cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <BadgeCheck className="size-4 mr-2 text-zinc-400" />
                <span>Account Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="focus:bg-zinc-800 cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <CreditCard className="size-4 mr-2 text-zinc-400" />
                <span>Billing & Credits</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="focus:bg-zinc-800 cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <Bell className="size-4 mr-2 text-zinc-400" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="focus:bg-red-950/50 text-red-400 focus:text-red-300 cursor-pointer"
            >
              <LogOut className="size-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}