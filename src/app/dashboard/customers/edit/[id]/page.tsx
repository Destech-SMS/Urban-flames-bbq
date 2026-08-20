// app/dashboard/customers/edit/[id]/page.tsx
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
  Star,
  Save,
  X,
  AlertCircle,
  Users
} from "lucide-react"

interface CustomerFormData {
  name: string
  phone: string
  group: string
}

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    phone: "",
    group: "customer"
  })

  const supabase = createClient()

  useEffect(() => {
    fetchCustomerDetails()
  }, [id])

  const fetchCustomerDetails = async () => {
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
        setError('Customer not found')
        setLoading(false)
        return
      }

      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        group: data.group || "customer"
      })
    } catch (error) {
      console.error('Error fetching customer:', error)
      setError(error instanceof Error ? error.message : 'Failed to load customer details')
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
          group: formData.group
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      router.push(`/dashboard/customers/${id}`)
      router.refresh()
      
    } catch (error) {
      console.error('Error updating customer:', error)
      setError(error instanceof Error ? error.message : 'Failed to update customer')
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
            <h2 className="text-xl font-semibold text-zinc-100">Customer Not Found</h2>
            <p className="text-zinc-400">{error}</p>
            <button
              onClick={() => router.push('/dashboard/customers')}
              className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
            >
              Back to Customers
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
                  <BreadcrumbLink href="/dashboard/customers" className="text-zinc-400 hover:text-zinc-200">
                    Customer Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/dashboard/customers/${id}`} className="text-zinc-400 hover:text-zinc-200">
                    {formData.name || 'Customer Details'}
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
            Back to Customer
          </button>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <User className="size-6 text-orange-500" />
              Edit Customer
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Update customer information</p>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
                <p className="text-sm font-medium">Error: {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
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
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1">Customer Group</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, group: "customer" })}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                      formData.group === "customer"
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    <Users className="size-4" />
                    Regular Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, group: "vip" })}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                      formData.group === "vip"
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    <Star className="size-4" />
                    VIP Diner
                  </button>
                </div>
              </div>

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
                  onClick={() => router.push(`/dashboard/customers/${id}`)}
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