"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
  Flame,
  Send,
  Users,
  FileText,
  BarChart3,
  Settings,
  UserCheck,
  Truck,
  Building2,
  Utensils,
  Star,
  Shield,
  Database,
  LayoutDashboard,
  MessageSquare,
  Clock,
  Calendar,
  Plus,
  List,
  UserPlus,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [role, setRole] = useState<string | null>(null)
  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "",
    avatar: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true)
      
      const supabase = createClient()
      
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          setIsLoading(false)
          return
        }

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              const detectedRole = user.user_metadata?.role || 'admin'
              const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "User"
              
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  email: user.email,
                  role: detectedRole,
                  sender_id: 'DestTech',
                })
                .select()
                .single()

              if (insertError) {
                setRole(detectedRole)
                setUserData({
                  name: displayName,
                  email: user.email || "",
                  avatar: user.user_metadata?.avatar_url || "",
                })
              } else if (newProfile) {
                const roleFromProfile = newProfile.role || detectedRole
                setRole(roleFromProfile)
                setUserData({
                  name: displayName,
                  email: user.email || "",
                  avatar: newProfile.avatar_url || user.user_metadata?.avatar_url || "",
                })
              }
            } else {
              const detectedRole = user.user_metadata?.role || 'admin'
              const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "User"
              setRole(detectedRole)
              setUserData({
                name: displayName,
                email: user.email || "",
                avatar: user.user_metadata?.avatar_url || "",
              })
            }
          } else if (profile) {
            const detectedRole = profile.role || "admin"

            const displayName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "User"

            const avatarUrl =
              profile?.avatar_url || user.user_metadata?.avatar_url || ""

            setRole(detectedRole)
            setUserData({
              name: displayName,
              email: user.email || "",
              avatar: avatarUrl,
            })
          }
        }
      } catch (error) {
        // Silent fail
      }
      
      setIsLoading(false)
    }

    fetchUserData()
  }, [])

  const isSuperAdmin = role === "superadmin"

  const teamsData = [
    {
      name: "Urban Flame BBQ - Main",
      logo: <Flame className="h-4 w-4" />,
      plan: isSuperAdmin ? "Superadmin Access" : "Main Branch",
    },
    {
      name: "Urban Flame Express",
      logo: <Building2 className="h-4 w-4" />,
      plan: "Delivery & Takeaway Hub",
    },
    {
      name: "Urban Flame Catering",
      logo: <Utensils className="h-4 w-4" />,
      plan: "Events & Catering",
    },
  ]

  // ============================================
  // ADMIN NAVIGATION (RESTRICTED)
  // ============================================
  const adminNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "SMS Broadcast",
      url: "/dashboard/quick-dispatch",
      icon: <Send className="h-4 w-4" />,
      items: [
        {
          title: "Quick Dispatch",
          url: "/dashboard/quick-dispatch",
        },
        {
      title: "Send Message",  // <-- New item
      url: "/dashboard/message",
    },
        {
          title: "Scheduled Messages",
          url: "/dashboard/scheduled",
        },
        {
          title: "Message Templates",
          url: "/dashboard/templates",
        },
      ],
    },
    {
      title: "Customer Management",
      url: "/dashboard/customers",
      icon: <Users className="h-4 w-4" />,
      items: [
        {
          title: "All Customers",
          url: "/dashboard/customers",
        },
        {
          title: "Add Customer",
          url: "/dashboard/customers/add",
        },
      ],
    },
    {
      title: "Staff Management",
      url: "/dashboard/staff",
      icon: <UserCheck className="h-4 w-4" />,
      items: [
        {
          title: "All Staff",
          url: "/dashboard/staff",
        },
        {
          title: "Add Staff Member",
          url: "/dashboard/staff/add",
        },
      ],
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: <BarChart3 className="h-4 w-4" />,
      items: [
        {
          title: "SMS Reports",
          url: "/dashboard/reports/sms",
        },
      ],
    },
  ]

  // ============================================
  // SUPERADMIN NAVIGATION (FULL ACCESS)
  // ============================================
  const superAdminNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "SMS Broadcast",
      url: "/dashboard",
      icon: <Send className="h-4 w-4" />,
      items: [
        {
          title: "Quick Dispatch",
          url: "/dashboard",
        },
        {
          title: "Scheduled Messages",
          url: "/dashboard/scheduled",
        },
        {
          title: "Message Templates",
          url: "/dashboard/templates",
        },
      ],
    },
    {
      title: "Customer Management",
      url: "/dashboard/customers",
      icon: <Users className="h-4 w-4" />,
      items: [
        {
          title: "All Customers",
          url: "/dashboard/customers",
        },
        {
          title: "VIP Diners",
          url: "/dashboard/customers/vip",
        },
        {
          title: "Regular Customers",
          url: "/dashboard/customers/regular",
        },
        {
          title: "Add Customer",
          url: "/dashboard/customers/add",
        },
      ],
    },
    {
      title: "Staff Management",
      url: "/dashboard/staff",
      icon: <UserCheck className="h-4 w-4" />,
      items: [
        {
          title: "All Staff",
          url: "/dashboard/staff",
        },
        {
          title: "Kitchen Team",
          url: "/dashboard/staff/kitchen",
        },
        {
          title: "Service Team",
          url: "/dashboard/staff/service",
        },
        {
          title: "Delivery Drivers",
          url: "/dashboard/staff/drivers",
        },
        {
          title: "Add Staff Member",
          url: "/dashboard/staff/add",
        },
      ],
    },
    {
      title: "Delivery Hub",
      url: "/dashboard/delivery",
      icon: <Truck className="h-4 w-4" />,
      items: [
        {
          title: "Active Deliveries",
          url: "/dashboard/delivery/active",
        },
        {
          title: "Delivery History",
          url: "/dashboard/delivery/history",
        },
        {
          title: "Driver Dispatch",
          url: "/dashboard/delivery/dispatch",
        },
      ],
    },
    {
      title: "Reports & Analytics",
      url: "/dashboard/reports",
      icon: <BarChart3 className="h-4 w-4" />,
      items: [
        {
          title: "SMS Reports",
          url: "/dashboard/reports/sms",
        },
        {
          title: "Customer Analytics",
          url: "/dashboard/reports/customers",
        },
        {
          title: "Delivery Reports",
          url: "/dashboard/reports/delivery",
        },
      ],
    },
    {
      title: "System Settings",
      url: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
      items: [
        {
          title: "SMS Gateway Config",
          url: "/dashboard/settings/gateway",
        },
        {
          title: "Sender ID Management",
          url: "/dashboard/settings/sender-id",
        },
        {
          title: "SMS Credit Balance",
          url: "/dashboard/settings/credits",
        },
      ],
    },
    {
      title: "Admin Management",
      url: "/dashboard/admins",
      icon: <Shield className="h-4 w-4" />,
      items: [
        {
          title: "All Admins",
          url: "/dashboard/admins",
        },
        {
          title: "Add Admin",
          url: "/dashboard/admins/add",
        },
        {
          title: "Permissions",
          url: "/dashboard/admins/permissions",
        },
      ],
    },
    {
      title: "Database & Logs",
      url: "/dashboard/logs",
      icon: <Database className="h-4 w-4" />,
      items: [
        {
          title: "SMS Logs",
          url: "/dashboard/logs/sms",
        },
        {
          title: "Activity Logs",
          url: "/dashboard/logs/activity",
        },
        {
          title: "System Health",
          url: "/dashboard/logs/health",
        },
      ],
    },
  ]

  // ============================================
  // QUICK ACCESS PROJECTS
  // ============================================
  const adminProjects = [
    // {
    //   name: "Quick Dispatch",
    //   url: "/dashboard",
    //   icon: <Send className="h-4 w-4" />,
    // },
    {
      name: "SMS Templates",
      url: "/dashboard/templates",
      icon: <FileText className="h-4 w-4" />,
    },
  ]

  const superAdminProjects = [
    {
      name: "VIP Diners",
      url: "/dashboard/customers/vip",
      icon: <Star className="h-4 w-4" />,
    },
    {
      name: "Kitchen Team",
      url: "/dashboard/staff/kitchen",
      icon: <Utensils className="h-4 w-4" />,
    },
    {
      name: "Delivery Fleet",
      url: "/dashboard/staff/drivers",
      icon: <Truck className="h-4 w-4" />,
    },
    {
      name: "Quick Dispatch",
      url: "/dashboard",
      icon: <Send className="h-4 w-4" />,
    },
    {
      name: "SMS Templates",
      url: "/dashboard/templates",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      name: "Analytics Dashboard",
      url: "/dashboard/reports",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      name: "System Settings",
      url: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      name: "Admin Users",
      url: "/dashboard/admins",
      icon: <Shield className="h-4 w-4" />,
    },
  ]

  const navMainData = isSuperAdmin ? superAdminNavItems : adminNavItems
  const projectsData = isSuperAdmin ? superAdminProjects : adminProjects

  if (isLoading) {
    return (
      <Sidebar
        collapsible="icon"
        className="border-r border-zinc-800/80 bg-zinc-950 text-zinc-100"
        {...props}
      >
        <SidebarHeader className="border-b border-zinc-800/60">
          <div className="flex items-center gap-2 p-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
              <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-4 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                <div className="space-y-1">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-8 w-full bg-zinc-800/50 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t border-zinc-800/60">
          <div className="flex items-center gap-2 p-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
              <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    )
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-zinc-800/80 bg-zinc-950 text-zinc-100"
      {...props}
    >
      <SidebarHeader className="border-b border-zinc-800/60">
        <TeamSwitcher teams={teamsData} />
        {isSuperAdmin && (
          <div className="px-3 py-1 mt-1">
            <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Super Admin
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainData} />
        <NavProjects projects={projectsData} />
        
        {isSuperAdmin && (
          <div className="mt-auto px-3 py-2 border-t border-zinc-800/60">
            <div className="text-[10px] text-zinc-500 space-y-1">
              <div className="flex justify-between">
                <span>SMS Balance:</span>
                <span className="text-amber-400 font-medium">3,450 credits</span>
              </div>
              <div className="flex justify-between">
                <span>Active Staff:</span>
                <span className="text-zinc-300 font-medium">34</span>
              </div>
              <div className="flex justify-between">
                <span>Total Customers:</span>
                <span className="text-zinc-300 font-medium">1,240</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-800/60">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}