// app/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
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
  Send,
  Users,
  MessageSquare,
  Flame,
  TrendingUp,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Loader2,
  BarChart3,
  PieChart,
  Clock,
  ChevronRight,
  Wallet,
  CreditCard,
  Coins,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface Contact {
  id: string
  name: string | null
  phone: string
  group: string
  created_at: string
}

interface SmsLog {
  id: string
  recipient: string
  message: string
  status: string
  sent_at: string
  campaign_id: string
}

interface DashboardStats {
  totalSent: number
  creditBalance: number
  walletBalance: number
  smsCredits: number
  customerCount: number
  vipCount: number
  staffCount: number
  kitchenCount: number
  serviceCount: number
  driverCount: number
  totalContacts: number
  weeklyData: { day: string; sent: number }[]
  groupDistribution: { name: string; value: number; color: string }[]
  recentActivity: { time: string; action: string; details: string }[]
}

const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#f59e0b']

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalSent: 0,
    creditBalance: 0,
    walletBalance: 0,
    smsCredits: 0,
    customerCount: 0,
    vipCount: 0,
    staffCount: 0,
    kitchenCount: 0,
    serviceCount: 0,
    driverCount: 0,
    totalContacts: 0,
    weeklyData: [],
    groupDistribution: [],
    recentActivity: []
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch all data on load
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch contacts
      const contactsRes = await fetch('/api/contacts')
      const contactsResult = await contactsRes.json()
      
      if (contactsResult.success) {
        const contactList = contactsResult.data || []
        
        // Calculate counts by group
        const customerCount = contactList.filter((c: Contact) => c.group === 'customer').length
        const vipCount = contactList.filter((c: Contact) => c.group === 'vip').length
        const staffCount = contactList.filter((c: Contact) => c.group === 'staff').length
        const kitchenCount = contactList.filter((c: Contact) => c.group === 'kitchen').length
        const serviceCount = contactList.filter((c: Contact) => c.group === 'service').length
        const driverCount = contactList.filter((c: Contact) => c.group === 'driver').length
        
        // Group distribution for pie chart
        const groupDistribution = [
          { name: 'Customers', value: customerCount, color: '#3b82f6' },
          { name: 'VIP', value: vipCount, color: '#f59e0b' },
          { name: 'Staff', value: staffCount, color: '#8b5cf6' },
          { name: 'Kitchen', value: kitchenCount, color: '#f97316' },
          { name: 'Service', value: serviceCount, color: '#22c55e' },
          { name: 'Drivers', value: driverCount, color: '#ef4444' },
        ].filter(g => g.value > 0)

        setStats(prev => ({
          ...prev,
          customerCount,
          vipCount,
          staffCount,
          kitchenCount,
          serviceCount,
          driverCount,
          totalContacts: contactList.length,
          groupDistribution
        }))
      }

      // Fetch wallet balance and SMS credits from database
      const walletRes = await fetch('/api/wallet/balance')
      const walletResult = await walletRes.json()
      
      console.log('Wallet API Response:', walletResult)
      
      if (walletResult.success) {
        setStats(prev => ({
          ...prev,
          walletBalance: walletResult.data.balance || 0,
          smsCredits: walletResult.data.sms_credits || 0
        }))
      }

      // Fetch SMS balance from MNotify
      const balanceRes = await fetch('/api/sms/balance')
      const balanceResult = await balanceRes.json()
      
      if (balanceResult.success) {
        setStats(prev => ({
          ...prev,
          creditBalance: balanceResult.data.balance || 0
        }))
      }

      // Fetch SMS logs for analytics
      const logsRes = await fetch('/api/sms/logs?limit=100')
      const logsResult = await logsRes.json()
      
      if (logsResult.success) {
        const logs = logsResult.data || []
        setStats(prev => ({
          ...prev,
          totalSent: logsResult.total || 0
        }))

        // Generate weekly data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const weeklyData = days.map(day => ({ day, sent: 0 }))
        
        logs.forEach((log: SmsLog) => {
          const date = new Date(log.sent_at)
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
          if (dayIndex >= 0 && dayIndex < 7) {
            weeklyData[dayIndex].sent += 1
          }
        })
        
        setStats(prev => ({
          ...prev,
          weeklyData
        }))

        // Generate recent activity
        const recentActivity = logs.slice(0, 5).map((log: SmsLog) => ({
          time: new Date(log.sent_at).toLocaleString(),
          action: 'SMS Sent',
          details: `To: ${log.recipient} - ${log.message.substring(0, 30)}${log.message.length > 30 ? '...' : ''}`
        }))

        setStats(prev => ({
          ...prev,
          recentActivity
        }))
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-zinc-950 text-zinc-100">
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-zinc-400">
              <Loader2 className="size-6 animate-spin text-orange-500" />
              Loading dashboard...
            </div>
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
                  <BreadcrumbPage className="font-semibold text-orange-500">
                    Dashboard Overview
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          
          {/* Error Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="size-4" />
                Error: {error}
              </p>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Dashboard Overview</h1>
              <p className="text-sm text-zinc-400">Welcome back! Here's what's happening with your SMS campaigns.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-zinc-700"
              >
                <RefreshCw className="size-4" />
                Refresh
              </button>
              <a
                href="/dashboard/message"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="size-4" />
                Send Message
              </a>
              <a
                // href="/dashboard/credits"
                href="/dashboard/credit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <CreditCard className="size-4" />
                Buy Credits
              </a>
            </div>
          </div>

          {/* KPI Cards - Now with 5 cards including Wallet */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {/* Total SMS Sent */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-zinc-400">Total SMS Sent</span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <Send className="size-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold tracking-tight">{stats.totalSent.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-zinc-500">All time</p>
            </div>

            {/* Wallet Balance */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-zinc-400">Wallet Balance</span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Wallet className="size-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-xl font-bold tracking-tight">GHS {stats.walletBalance.toFixed(2)}</p>
                <a href="/dashboard/credits" className="text-[10px] text-orange-400 hover:text-orange-300 font-medium">
                  + Add
                </a>
              </div>
              <p className="text-[10px] text-zinc-500">Available balance</p>
            </div>

            {/* SMS Credits */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-zinc-400">SMS Credits</span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Coins className="size-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold tracking-tight">{stats.smsCredits.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-zinc-500">Available credits</p>
            </div>

            {/* Total Contacts */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-zinc-400">Total Contacts</span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Users className="size-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold tracking-tight">{stats.totalContacts}</p>
              </div>
              <p className="text-[10px] text-zinc-500">Customers & Staff</p>
            </div>

            {/* Groups */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-zinc-400">Groups</span>
                <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <PieChart className="size-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold tracking-tight">{stats.groupDistribution.length}</p>
              </div>
              <p className="text-[10px] text-zinc-500">Contact groups</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly SMS Activity Chart */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <BarChart3 className="size-4 text-orange-500" />
                  Weekly SMS Activity
                </h2>
                <span className="text-[10px] text-zinc-500">Last 7 days</span>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="day" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        borderColor: '#3f3f46',
                        color: '#e4e4e7',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="sent" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Group Distribution Pie Chart */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <PieChart className="size-4 text-orange-500" />
                  Contact Distribution
                </h2>
                <span className="text-[10px] text-zinc-500">By group</span>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={stats.groupDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stats.groupDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        borderColor: '#3f3f46',
                        color: '#e4e4e7',
                        fontSize: '12px'
                      }}
                    />
                    <Legend 
                      formatter={(value) => <span style={{ color: '#e4e4e7', fontSize: '10px' }}>{value}</span>}
                      iconType="circle"
                      iconSize={8}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Clock className="size-4 text-orange-500" />
                Recent Activity
              </h2>
              <a href="/dashboard/logs" className="text-[10px] text-orange-400 hover:text-orange-300 hover:underline transition-colors flex items-center gap-1">
                View All <ChevronRight className="size-3" />
              </a>
            </div>
            <div className="space-y-2">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-4 text-zinc-500">
                  <MessageSquare className="size-6 mx-auto text-zinc-600 mb-1" />
                  <p className="text-xs">No activity yet</p>
                  <p className="text-[10px] mt-1">Send your first SMS to see activity here</p>
                </div>
              ) : (
                stats.recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded bg-orange-500/10 text-orange-500">
                        <Send className="size-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-200 font-medium">{activity.action}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{activity.details}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap ml-2">
                      {formatDate(activity.time)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-2.5">
              <p className="text-[10px] text-zinc-500">Customers</p>
              <p className="text-base font-bold text-zinc-100">{stats.customerCount}</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-2.5">
              <p className="text-[10px] text-zinc-500">VIP</p>
              <p className="text-base font-bold text-zinc-100">{stats.vipCount}</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-2.5">
              <p className="text-[10px] text-zinc-500">Staff</p>
              <p className="text-base font-bold text-zinc-100">{stats.staffCount}</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-2.5">
              <p className="text-[10px] text-zinc-500">Kitchen</p>
              <p className="text-base font-bold text-zinc-100">{stats.kitchenCount}</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-2.5">
              <p className="text-[10px] text-zinc-500">Service</p>
              <p className="text-base font-bold text-zinc-100">{stats.serviceCount}</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-2.5">
              <p className="text-[10px] text-zinc-500">Drivers</p>
              <p className="text-base font-bold text-zinc-100">{stats.driverCount}</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}