// app/dashboard/staff/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Briefcase,
  Calendar,
  Edit2,
  Trash2,
  Users,
  ChefHat,
  Truck,
  UserCheck,
  MapPin,
  AlertCircle,
  Clock,
  Send,
  MessageSquare,
  Building2,
  Heart
} from "lucide-react"

interface StaffMember {
  id: string
  name: string | null
  phone: string
  group: string
  created_at: string
  details?: {
    position: string | null
    department: string | null
    email: string | null
    address: string | null
    emergency_contact: string | null
    emergency_phone: string | null
    notes: string | null
  } | null
}

export default function StaffViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [staff, setStaff] = useState<StaffMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchStaffDetails()
  }, [id])

  const fetchStaffDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/staff/${id}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch staff details')
      }
      
      setStaff(result.data)
    } catch (error) {
      console.error('Error fetching staff:', error)
      setError(error instanceof Error ? error.message : 'Failed to load staff details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!staff) return
    if (!confirm(`Are you sure you want to delete ${staff.name || 'this staff member'}? This action cannot be undone.`)) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/staff?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete')
      }
      
      router.push('/dashboard/staff')
      router.refresh()
    } catch (error) {
      console.error('Error deleting staff:', error)
      alert('Failed to delete staff member. Please try again.')
      setDeleting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'kitchen': return <ChefHat className="size-5" />
      case 'driver': return <Truck className="size-5" />
      case 'service': return <Users className="size-5" />
      default: return <UserCheck className="size-5" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'kitchen': return 'Kitchen Team'
      case 'driver': return 'Delivery Driver'
      case 'service': return 'Service Team'
      default: return 'Staff'
    }
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'kitchen': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'driver': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'service': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default: return 'bg-zinc-700 text-zinc-300 border-zinc-600'
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-zinc-950 text-zinc-100">
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-zinc-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              Loading...
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !staff) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-zinc-950 text-zinc-100">
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <AlertCircle className="size-12 text-red-400" />
            <h2 className="text-xl font-semibold text-zinc-100">Staff Member Not Found</h2>
            <p className="text-zinc-400">{error || 'The staff member you are looking for does not exist.'}</p>
            <button
              onClick={() => router.push('/dashboard/staff')}
              className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
            >
              Back to Staff Management
            </button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-zinc-950 text-zinc-100">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800/80 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-zinc-400 hover:text-zinc-100" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-800" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="text-zinc-400 hover:text-zinc-200">
                    Urban Flame BBQ
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/staff" className="text-zinc-400 hover:text-zinc-200">
                    Staff Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-orange-500">
                    {staff.name || 'Staff Details'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            Back to Staff
          </button>

          {/* Staff Profile Header */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${getRoleColor(staff.group)}`}>
                  {getRoleIcon(staff.group)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-zinc-100">{staff.name || 'No Name'}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(staff.group)}`}>
                      {getRoleLabel(staff.group)}
                    </span>
                    {staff.details?.position && (
                      <>
                        <span className="text-xs text-zinc-500">•</span>
                        <span className="text-xs text-zinc-400">{staff.details.position}</span>
                      </>
                    )}
                    {staff.details?.department && (
                      <>
                        <span className="text-xs text-zinc-500">•</span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Building2 className="size-3" />
                          {staff.details.department}
                        </span>
                      </>
                    )}
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar className="size-3" />
                      Joined {new Date(staff.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => router.push(`/dashboard/staff/edit/${staff.id}`)}
                  className="flex-1 md:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-zinc-700"
                >
                  <Edit2 className="size-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-500/20 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Staff Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <User className="size-5 text-orange-500" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-500">Phone Number</p>
                  <p className="text-zinc-200 font-medium flex items-center gap-2 mt-1">
                    <Phone className="size-4 text-zinc-500" />
                    {staff.phone}
                  </p>
                </div>
                {staff.details?.email && (
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <p className="text-xs text-zinc-500">Email</p>
                    <p className="text-zinc-200 font-medium flex items-center gap-2 mt-1">
                      <Mail className="size-4 text-zinc-500" />
                      {staff.details.email}
                    </p>
                  </div>
                )}
                {staff.details?.address && (
                  <div className="bg-zinc-800/30 rounded-lg p-4 md:col-span-2">
                    <p className="text-xs text-zinc-500">Address</p>
                    <p className="text-zinc-200 font-medium flex items-center gap-2 mt-1">
                      <MapPin className="size-4 text-zinc-500" />
                      {staff.details.address}
                    </p>
                  </div>
                )}
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-500">Role</p>
                  <p className="text-zinc-200 font-medium flex items-center gap-2 mt-1">
                    <Briefcase className="size-4 text-zinc-500" />
                    {getRoleLabel(staff.group)}
                  </p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-500">Staff ID</p>
                  <p className="text-zinc-200 font-medium text-xs font-mono mt-1">
                    {staff.id.substring(0, 8)}...{staff.id.substring(staff.id.length - 4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <MessageSquare className="size-5 text-orange-500" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/dashboard?staff=${staff.id}`)}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Send className="size-4" />
                  Send SMS to {staff.name || 'Staff'}
                </button>
                <button
                  onClick={() => router.push(`/dashboard/staff/edit/${staff.id}`)}
                  className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Edit2 className="size-4" />
                  Edit Staff Details
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(staff.phone)
                    alert('Phone number copied to clipboard!')
                  }}
                  className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Phone className="size-4" />
                  Copy Phone Number
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {(staff.details?.emergency_contact || staff.details?.emergency_phone) && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Heart className="size-5 text-red-400" />
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.details?.emergency_contact && (
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <p className="text-xs text-zinc-500">Contact Name</p>
                    <p className="text-zinc-200 font-medium mt-1">
                      {staff.details.emergency_contact}
                    </p>
                  </div>
                )}
                {staff.details?.emergency_phone && (
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <p className="text-xs text-zinc-500">Emergency Phone</p>
                    <p className="text-zinc-200 font-medium flex items-center gap-2 mt-1">
                      <Phone className="size-4 text-zinc-500" />
                      {staff.details.emergency_phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {staff.details?.notes && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Clock className="size-5 text-orange-500" />
                Notes
              </h2>
              <p className="text-zinc-300 text-sm whitespace-pre-wrap">
                {staff.details.notes}
              </p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}