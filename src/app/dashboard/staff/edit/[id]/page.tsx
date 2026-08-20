// app/dashboard/staff/edit/[id]/page.tsx
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
import { createClient } from "@/lib/supabase/client"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Briefcase,
  Save,
  X,
  AlertCircle,
  Users,
  ChefHat,
  Truck,
  UserCheck
} from "lucide-react"

interface StaffFormData {
  name: string
  phone: string
  role: string
}

export default function EditStaffPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    phone: "",
    role: "staff"
  })

  const supabase = createClient()

  useEffect(() => {
    fetchStaffDetails()
  }, [id])

  const fetchStaffDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please login first')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      if (!data) {
        setError('Staff member not found')
        setLoading(false)
        return
      }

      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        role: data.group || "staff"
      })
    } catch (error) {
      console.error('Error fetching staff:', error)
      setError(error instanceof Error ? error.message : 'Failed to load staff details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please login first')
        setSaving(false)
        return
      }

      if (!formData.name) {
        setError('Name is required')
        setSaving(false)
        return
      }

      if (!formData.phone) {
        setError('Phone number is required')
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('contacts')
        .update({
          name: formData.name,
          phone: formData.phone,
          group: formData.role
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      router.push(`/dashboard/staff/${id}`)
      router.refresh()
      
    } catch (error) {
      console.error('Error updating staff:', error)
      setError(error instanceof Error ? error.message : 'Failed to update staff member')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
      case 'kitchen': return 'Kitchen Team'
      case 'driver': return 'Delivery Driver'
      case 'service': return 'Service Team'
      default: return 'Staff'
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

  if (error && !formData.name) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-zinc-950 text-zinc-100">
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <AlertCircle className="size-12 text-red-400" />
            <h2 className="text-xl font-semibold text-zinc-100">Staff Member Not Found</h2>
            <p className="text-zinc-400">{error}</p>
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
        {/* Top Header & Breadcrumb */}
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
                  <BreadcrumbLink href="/dashboard/staff" className="text-zinc-400 hover:text-zinc-200">
                    Staff Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/dashboard/staff/${id}`} className="text-zinc-400 hover:text-zinc-200">
                    {formData.name || 'Staff Details'}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-orange-500">
                    Edit
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors w-fit"
          >
            <ArrowLeft className="size-4" />
            Back to Staff
          </button>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <User className="size-6 text-orange-500" />
              Edit Staff Member
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Update staff member information</p>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
                <p className="text-sm font-medium">Error: {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-1">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0244123456"
                    required
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Format: 0244123456 or 233244123456</p>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1">
                  Role <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['staff', 'kitchen', 'service', 'driver'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                        formData.role === role
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                      }`}
                    >
                      {getRoleIcon(role)}
                      {getRoleLabel(role)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/staff/${id}`)}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="size-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}