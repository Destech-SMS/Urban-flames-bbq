// app/dashboard/customers/vip/page.tsx
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
  Star, 
  Users, 
  Phone, 
  User,
  ArrowLeft
} from "lucide-react"

interface Customer {
  id: string
  name: string | null
  phone: string
  group: string
  created_at: string
}

export default function VIPCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const supabase = createClient()

  const fetchVIPCustomers = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('group', 'vip')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching VIP customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVIPCustomers()
  }, [search])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-zinc-950 text-zinc-100">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800/80 px-4">
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
                  <BreadcrumbLink href="/dashboard/customers" className="text-zinc-400 hover:text-zinc-200">
                    Customer Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-orange-500 flex items-center gap-2">
                    <Star className="size-4" />
                    VIP Diners
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <Star className="size-6 text-amber-400" />
                VIP Diners
              </h1>
              <p className="text-sm text-zinc-400">Manage your VIP customers</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/customers')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-zinc-700"
            >
              <ArrowLeft className="size-4" />
              All Customers
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search VIP customers..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-zinc-800">
                  <tr className="text-left text-zinc-400 text-sm">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                          Loading...
                        </div>
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                        No VIP customers found
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-zinc-800/30 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                        <td className="px-4 py-3 text-zinc-200 font-medium flex items-center gap-2">
                          <Star className="size-4 text-amber-400" />
                          {customer.name || 'No name'}
                        </td>
                        <td className="px-4 py-3 text-zinc-300 flex items-center gap-2">
                          <Phone className="size-3.5 text-zinc-500" />
                          {customer.phone}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-sm">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[11px] text-zinc-500">
              {customers.length} VIP customers total
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}