// app/dashboard/staff/page.tsx - Updated with debug console
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { 
  Search, 
  Plus, 
  Users, 
  ChefHat, 
  Truck, 
  UserCheck,
  Trash2, 
  Edit2, 
  Phone,
  RefreshCw,
  Eye
} from "lucide-react"

interface StaffMember {
  id: string
  name: string | null
  phone: string
  group: string
  created_at: string
}

export default function StaffPage() {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    kitchen: 0,
    service: 0,
    driver: 0,
    staff: 0
  })
  const [currentTime, setCurrentTime] = useState<string>("")
  const [authDebug, setAuthDebug] = useState<any>(null)

  const supabase = createClient()

  // Check authentication status
  const checkAuth = async () => {
    try {
      console.log("🔍 Checking authentication status...")
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log("📊 Session:", session ? "Active" : "None")
      if (sessionError) console.error("❌ Session error:", sessionError)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log("👤 User:", user ? user.email : "None")
      if (userError) console.error("❌ User error:", userError)
      
      setAuthDebug({
        hasSession: !!session,
        sessionUser: session?.user?.email || null,
        hasUser: !!user,
        userEmail: user?.email || null,
        userId: user?.id || null,
        sessionError: sessionError?.message || null,
        userError: userError?.message || null
      })
      
      return { session, user }
    } catch (error) {
      console.error("💥 Auth check error:", error)
      return { session: null, user: null }
    }
  }

  const fetchStaff = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // First check auth
      const { session, user } = await checkAuth()
      
      if (!session || !user) {
        console.error("❌ No active session or user")
        setError("Please login to view staff")
        setLoading(false)
        return
      }

      console.log("✅ Authenticated as:", user.email)
      console.log("🆔 User ID:", user.id)

      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterRole !== 'all') params.append('role', filterRole)
      
      console.log("📤 Fetching staff with params:", params.toString())
      
      const response = await fetch(`/api/staff?${params.toString()}`)
      const result = await response.json()
      
      console.log("📥 Staff API response status:", response.status)
      console.log("📥 Staff API response:", result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch staff')
      }
      
      setStaff(result.data || [])
      setStats(result.stats || { total: 0, kitchen: 0, service: 0, driver: 0, staff: 0 })
    } catch (error) {
      console.error('Error fetching staff:', error)
      setError(error instanceof Error ? error.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString())
    fetchStaff()
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [search, filterRole])

  const handleDelete = async (id: string, name: string | null) => {
    if (!confirm(`Are you sure you want to delete ${name || 'this staff member'}?`)) return

    try {
      const response = await fetch(`/api/staff?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete')
      }
      
      fetchStaff()
    } catch (error) {
      console.error('Error deleting staff:', error)
      alert('Failed to delete staff member. Please try again.')
    }
  }

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'kitchen': return <ChefHat className="size-4" />
      case 'driver': return <Truck className="size-4" />
      case 'service': return <Users className="size-4" />
      default: return <UserCheck className="size-4" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'kitchen': return 'Kitchen'
      case 'driver': return 'Driver'
      case 'service': return 'Service'
      default: return 'Staff'
    }
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'kitchen': return 'bg-orange-500/20 text-orange-400 border-orange-500/20'
      case 'driver': return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'service': return 'bg-purple-500/20 text-purple-400 border-purple-500/20'
      default: return 'bg-zinc-700 text-zinc-300 border-zinc-600'
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-zinc-950 text-zinc-100">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800/80 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-zinc-400 hover:text-zinc-100" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-zinc-800"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="text-zinc-400 hover:text-zinc-200">
                    Urban Flame BBQ
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-orange-500">
                    Staff Management
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Debug Info */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">🔧 Auth Debug</h3>
            <div className="text-xs text-zinc-500 space-y-1">
              <div>Has Session: <span className={authDebug?.hasSession ? 'text-emerald-400' : 'text-red-400'}>
                {authDebug?.hasSession ? '✅ Yes' : '❌ No'}
              </span></div>
              <div>User Email: <span className="text-zinc-300">{authDebug?.userEmail || 'Not logged in'}</span></div>
              <div>User ID: <span className="text-zinc-300">{authDebug?.userId || 'N/A'}</span></div>
              {authDebug?.sessionError && <div className="text-red-400">Session Error: {authDebug.sessionError}</div>}
              {authDebug?.userError && <div className="text-red-400">User Error: {authDebug.userError}</div>}
            </div>
            <button 
              onClick={fetchStaff}
              className="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white text-xs rounded transition-colors"
            >
              <RefreshCw className="size-3 inline mr-1" />
              Refresh Auth
            </button>
          </div>

          {/* Header with Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <Users className="size-6 text-orange-500" />
                Staff Management
              </h1>
              <p className="text-sm text-zinc-400">Manage your restaurant staff</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStaff}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-zinc-700"
                title="Refresh"
              >
                <RefreshCw className="size-4" />
                Refresh
              </button>
              <button
                onClick={() => router.push('/dashboard/staff/add')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="size-4" />
                Add Staff
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Roles</option>
              <option value="staff">Staff</option>
              <option value="kitchen">Kitchen</option>
              <option value="service">Service</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Total Staff</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Users className="size-4" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight mt-2">{stats.total}</p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Kitchen</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                  <ChefHat className="size-4" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight mt-2">{stats.kitchen}</p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Service</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <Users className="size-4" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight mt-2">{stats.service}</p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Drivers</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Truck className="size-4" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight mt-2">{stats.driver}</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
              <p className="text-sm font-medium">Error: {error}</p>
            </div>
          )}

          {/* Staff Table */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-zinc-800">
                  <tr className="text-left text-zinc-400 text-sm">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Added</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                          Loading...
                        </div>
                      </td>
                    </tr>
                  ) : staff.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="size-8 text-zinc-600" />
                          <p>No staff found</p>
                          <button
                            onClick={() => router.push('/dashboard/staff/add')}
                            className="mt-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Plus className="size-4" />
                            Add Your First Staff Member
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    staff.map((member) => (
                      <tr key={member.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${getRoleColor(member.group)}`}>
                              {getRoleIcon(member.group)}
                            </div>
                            <span className="text-zinc-200 font-medium">
                              {member.name || 'No name'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Phone className="size-3.5 text-zinc-500" />
                            {member.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.group)}`}>
                            {getRoleIcon(member.group)}
                            <span className="ml-1.5">{getRoleLabel(member.group)}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-sm">
                          {new Date(member.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(`/dashboard/staff/${member.id}`)}
                              className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-zinc-200"
                              title="View Details"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/staff/edit/${member.id}`)}
                              className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-zinc-200"
                              title="Edit"
                            >
                              <Edit2 className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(member.id, member.name)}
                              className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-zinc-400 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>{staff.length} staff members total</span>
            <span>Last updated: {currentTime || 'Loading...'}</span>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}