// app/dashboard/customers/add/page.tsx
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
import { 
  ArrowLeft, 
  UserPlus, 
  User, 
  Phone, 
  Mail, 
  Star,
  Users,
  Save,
  X
} from "lucide-react"

export default function AddCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    group: "customer",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate
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

      console.log('📤 Sending customer data:', {
        name: formData.name,
        phone: formData.phone,
        group: formData.group,
      })

      // Make API call to our customers endpoint
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          group: formData.group,
        }),
      })

      const result = await response.json()
      console.log('📥 Response:', { status: response.status, result })

      if (!response.ok) {
        throw new Error(result.error || `Failed to add customer (Status: ${response.status})`)
      }

      // Show success message
      setSuccess(`Customer "${formData.name}" added successfully!`)

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        group: "customer",
        notes: ""
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/customers')
        router.refresh()
      }, 1500)
      
    } catch (error) {
      console.error('Error adding customer:', error)
      setError(error instanceof Error ? error.message : 'Failed to add customer')
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
                  <BreadcrumbLink href="/dashboard/customers" className="text-zinc-400 hover:text-zinc-200">
                    Customer Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-orange-500">
                    Add Customer
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Page Content - Full Width */}
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
                Add Customer
              </h1>
              <p className="text-sm text-zinc-400">Add a new customer to your contact list</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
              <p className="text-sm font-medium">Error: {error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg">
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 space-y-6">
              {/* Basic Information */}
              <div>
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
                      placeholder="Enter customer name"
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
                      Email <span className="text-zinc-500">(optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="customer@email.com"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-1">
                      Customer Group
                    </label>
                    <select
                      name="group"
                      value={formData.group}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="customer">Regular Customer</option>
                      <option value="vip">VIP Diner</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                  <Users className="size-5 text-orange-500" />
                  Additional Information
                </h2>
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-1">
                    Notes <span className="text-zinc-500">(optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Any additional notes about this customer..."
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
                      Add Customer
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
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}