// app/dashboard/staff/add/page.tsx
"use client"

import { useState } from "react"
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
  ArrowLeft, 
  UserPlus, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  ChefHat,
  Users,
  Truck,
  Briefcase,
  Save,
  X
} from "lucide-react"

interface StaffFormData {
  name: string
  phone: string
  email: string
  role: string
  department: string
  position: string
  address: string
  emergency_contact: string
  emergency_phone: string
  notes: string
}

export default function AddStaffPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    phone: "",
    email: "",
    role: "staff",
    department: "service",
    position: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    notes: ""
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please login first')
        setLoading(false)
        return
      }

      if (!formData.name) {
        setError('Name is required')
        setLoading(false)
        return
      }

      if (!formData.phone) {
        setError('Phone number is required')
        setLoading(false)
        return
      }

      // Insert staff member into contacts table
      const { error: insertError } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          name: formData.name,
          phone: formData.phone,
          group: formData.role, // staff, kitchen, service, driver
          // Additional fields would need a separate staff table
          // For now, we'll use the contacts table with group
        })

      if (insertError) throw insertError

      // Redirect to staff management page
      router.push('/dashboard/staff')
      router.refresh()
      
    } catch (error) {
      console.error('Error adding staff:', error)
      setError(error instanceof Error ? error.message : 'Failed to add staff member')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      default: return <User className="size-4" />
    }
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
                  <BreadcrumbPage className="font-semibold text-orange-500">
                    Add Staff
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <UserPlus className="size-6 text-orange-500" />
                Add Staff Member
              </h1>
              <p className="text-sm text-zinc-400">Add a new staff member to your restaurant team</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
              <p className="text-sm font-medium">Error: {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* Basic Information */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <User className="size-5 text-orange-500" />
                Basic Information
              </h2>
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
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-1">
                    Email Address <span className="text-zinc-500">(optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="staff@urbanflame.com"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-1">
                    Position <span className="text-zinc-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g. Head Chef, Manager"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Role & Department */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Briefcase className="size-5 text-orange-500" />
                Role & Department
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-1">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="staff">Staff</option>
                    <option value="kitchen">Kitchen Team</option>
                    <option value="service">Service Team</option>
                    <option value="driver">Delivery Driver</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-1">
                    Department <span className="text-zinc-500">(optional)</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="service">Service</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="delivery">Delivery</option>
                    <option value="management">Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Phone className="size-5 text-orange-500" />
                Emergency Contact <span className="text-zinc-500 text-sm font-normal">(optional)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleInputChange}
                    placeholder="Emergency contact name"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    name="emergency_phone"
                    value={formData.emergency_phone}
                    onChange={handleInputChange}
                    placeholder="0244123456"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <MapPin className="size-5 text-orange-500" />
                Additional Information <span className="text-zinc-500 text-sm font-normal">(optional)</span>
              </h2>
              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional notes about this staff member..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Add Staff Member
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="size-4" />
                Cancel
              </button>
            </div>
          </form>

          {/* Quick Info */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-4">
            <p className="text-xs text-zinc-500">
              💡 Staff members will be added to your contact list and can receive SMS broadcasts.
              They will be grouped based on their role.
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}