// app/dashboard/customers/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
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
  Mail, 
  Star,
  Calendar,
  Edit2,
  Trash2,
  Users,
  Send,
  MessageSquare,
  AlertCircle,
  Clock
} from "lucide-react"

interface Customer {
  id: string
  name: string | null
  phone: string
  group: string
  created_at: string
}

export default function CustomerViewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

      setCustomer(data)
    } catch (error) {
      console.error('Error fetching customer:', error)
      setError(error instanceof Error ? error.message : 'Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!customer) return
    if (!confirm(`Are you sure you want to delete ${customer.name || 'this customer'}? This action cannot be undone.`)) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      router.push('/dashboard/customers')
      router.refresh()
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Failed to delete customer. Please try again.')
      setDeleting(false)
    }
  }

  const getGroupBadge = (group: string) => {
    if (group === 'vip') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <Star className="size-3" />
          VIP Diner
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-700 text-zinc-300 border border-zinc-600">
        Regular Customer
      </span>
    )
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

  if (error || !customer) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-zinc-950 text-zinc-100">
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <AlertCircle className="size-12 text-red-400" />
            <h2 className="text-xl font-semibold text-zinc-100">Customer Not Found</h2>
            <p className="text-zinc-400">{error || 'The customer you are looking for does not exist.'}</p>
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
                  <BreadcrumbPage className="font-semibold text-orange-500">
                    {customer.name || 'Customer Details'}
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
            Back to Customers
          </button>

          {/* Customer Profile Header */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${customer.group === 'vip' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                  {customer.group === 'vip' ? (
                    <Star className="size-6 text-amber-400" />
                  ) : (
                    <User className="size-6 text-blue-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-zinc-100">{customer.name || 'No Name'}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    {getGroupBadge(customer.group)}
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar className="size-3" />
                      Joined {new Date(customer.created_at).toLocaleDateString('en-US', {
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
                  onClick={() => router.push(`/dashboard/customers/edit/${customer.id}`)}
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

          {/* Customer Details Grid */}
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
                    {customer.phone}
                  </p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-500">Customer Type</p>
                  <p className="text-zinc-200 font-medium flex items-center gap-2 mt-1">
                    {customer.group === 'vip' ? (
                      <>
                        <Star className="size-4 text-amber-400" />
                        VIP Diner
                      </>
                    ) : (
                      <>
                        <Users className="size-4 text-zinc-500" />
                        Regular Customer
                      </>
                    )}
                  </p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-500">Customer Since</p>
                  <p className="text-zinc-200 font-medium flex items-center gap-2 mt-1">
                    <Calendar className="size-4 text-zinc-500" />
                    {new Date(customer.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-500">Customer ID</p>
                  <p className="text-zinc-200 font-medium text-xs font-mono mt-1">
                    {customer.id.substring(0, 8)}...{customer.id.substring(customer.id.length - 4)}
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
                  onClick={() => router.push(`/dashboard?customer=${customer.id}`)}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Send className="size-4" />
                  Send SMS to {customer.name || 'Customer'}
                </button>
                <button
                  onClick={() => router.push(`/dashboard/customers/edit/${customer.id}`)}
                  className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Edit2 className="size-4" />
                  Edit Customer Details
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(customer.phone)
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

          {/* Recent Activity */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Clock className="size-5 text-orange-500" />
              Recent Activity
            </h2>
            <div className="text-center py-8 text-zinc-500">
              <p className="text-sm">No recent activity recorded</p>
              <p className="text-xs mt-1">Customer activity will appear here once they receive messages</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}