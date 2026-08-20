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
  CheckCircle2,
  Clock,
  TrendingUp,
  Utensils,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Loader2,
  Coins,
} from "lucide-react"

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

interface Stats {
  totalSent: number
  creditBalance: number
  smsCredits: number
  customerCount: number
  staffCount: number
  driverCount: number
}

export default function DashboardPage() {
  const [recipientGroup, setRecipientGroup] = useState("customers")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [recentLogs, setRecentLogs] = useState<SmsLog[]>([])
  const [stats, setStats] = useState<Stats>({
    totalSent: 0,
    creditBalance: 0,
    smsCredits: 0,
    customerCount: 0,
    staffCount: 0,
    driverCount: 0
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
        setContacts(contactList)
        
        // Calculate counts
        const customerCount = contactList.filter((c: Contact) => 
          c.group === 'customer' || c.group === 'vip'
        ).length
        
        const staffCount = contactList.filter((c: Contact) => 
          c.group === 'staff' || c.group === 'kitchen' || c.group === 'service'
        ).length
        
        const driverCount = contactList.filter((c: Contact) => 
          c.group === 'driver'
        ).length
        
        setStats(prev => ({
          ...prev,
          customerCount,
          staffCount,
          driverCount
        }))
      }

      // Fetch SMS credits from database (not MNotify)
      const balanceRes = await fetch('/api/sms/balance')
      const balanceResult = await balanceRes.json()
      
      if (balanceResult.success) {
        setStats(prev => ({
          ...prev,
          smsCredits: balanceResult.data.balance || 0,
          creditBalance: balanceResult.data.balance || 0
        }))
      }

      // Fetch SMS logs
      const logsRes = await fetch('/api/sms/logs?limit=5')
      const logsResult = await logsRes.json()
      
      if (logsResult.success) {
        setRecentLogs(logsResult.data || [])
        setStats(prev => ({
          ...prev,
          totalSent: logsResult.total || 0
        }))
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (templateText: string) => {
    setMessage(templateText)
  }

  const handleDispatch = async () => {
    if (!message.trim()) {
      alert("Please enter a message before dispatching.")
      return
    }

    // Get recipients based on selected group
    let recipients: string[] = []
    let groupName = ""

    switch(recipientGroup) {
      case "customers":
        recipients = contacts.filter(c => c.group === 'customer' || c.group === 'vip').map(c => c.phone)
        groupName = "Customers"
        break
      case "staff":
        recipients = contacts.filter(c => c.group === 'staff' || c.group === 'kitchen' || c.group === 'service').map(c => c.phone)
        groupName = "Staff"
        break
      case "drivers":
        recipients = contacts.filter(c => c.group === 'driver').map(c => c.phone)
        groupName = "Drivers"
        break
      default:
        recipients = contacts.map(c => c.phone)
        groupName = "All"
    }

    if (recipients.length === 0) {
      alert(`No ${groupName} found in your contacts. Please add contacts first.`)
      return
    }

    // Check if user has enough SMS credits
    if (stats.smsCredits < recipients.length) {
      alert(`Insufficient SMS credits. You have ${stats.smsCredits} credits but need ${recipients.length}. Please purchase more credits.`)
      return
    }

    if (!confirm(`Send "${message}" to ${recipients.length} ${groupName}? This will use ${recipients.length} SMS credit(s).`)) {
      return
    }

    setSending(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: recipients,
          message: message,
          group: recipientGroup
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send SMS')
      }

      // Refresh data to update credit balance
      await fetchDashboardData()

      setSuccessMessage(`SMS sent successfully!\nTotal: ${result.stats.total}\nCredit Used: ${result.stats.credit_used}\nCredit Left: ${result.stats.credit_left}`)
      
      setMessage("")

      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)

    } catch (error) {
      console.error('Error sending SMS:', error)
      setError(error instanceof Error ? error.message : 'Failed to send SMS')
    } finally {
      setSending(false)
    }
  }

  // Get counts for display
  const getGroupCount = (group: string) => {
    switch(group) {
      case 'customers': return stats.customerCount
      case 'staff': return stats.staffCount
      case 'drivers': return stats.driverCount
      default: return 0
    }
  }

  const getGroupLabel = (group: string) => {
    switch(group) {
      case 'customers': return 'Customers'
      case 'staff': return 'Staff'
      case 'drivers': return 'Drivers'
      default: return 'All'
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'sent':
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="mr-1 size-2.5" /> Delivered
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="mr-1 size-2.5" /> Pending
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="mr-1 size-2.5" /> Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-700 text-zinc-300 border border-zinc-600">
            {status}
          </span>
        )
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
                    SMS Broadcast Portal
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          
          {/* Error & Success Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="size-4" />
                Error: {error}
              </p>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg whitespace-pre-line">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {/* Refresh Button */}
          <div className="flex justify-end">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-zinc-700"
            >
              <RefreshCw className="size-4" />
              Refresh Data
            </button>
          </div>

          {/* Section 1: KPI Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            
            {/* Stat 1: Total Sent */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Total SMS Sent</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <Send className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-2xl font-bold tracking-tight">{stats.totalSent.toLocaleString()}</p>
                <span className="flex items-center text-xs text-emerald-400 font-medium">
                  <TrendingUp className="mr-1 size-3" /> All time
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">Total across all groups</p>
            </div>

            {/* Stat 2: SMS Credit Balance - From Database */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">SMS Credits</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Coins className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-2xl font-bold tracking-tight">{stats.smsCredits.toLocaleString()}</p>
                <span className="text-xs text-zinc-400">Available</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">Sender ID: <span className="font-medium text-zinc-300">UF BBQ</span></p>
            </div>

            {/* Stat 3: Total Customers */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Customer Audience</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-2xl font-bold tracking-tight">{stats.customerCount}</p>
                <span className="text-xs text-emerald-400">Active</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">VIP Diners & Regulars</p>
            </div>

            {/* Stat 4: Restaurant Staff */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Staff & Personnel</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <UserCheck className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-2xl font-bold tracking-tight">{stats.staffCount + stats.driverCount}</p>
                <span className="text-xs text-zinc-400">Members</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">Kitchen, Service & Drivers</p>
            </div>
          </div>

          {/* Section 2: Main Workspace */}
          <div className="grid gap-6 lg:grid-cols-7">
            
            {/* Quick SMS Dispatcher */}
            <div className="lg:col-span-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 flex flex-col">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                      <MessageSquare className="size-5 text-orange-500" />
                      Quick Broadcast Dispatch
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-zinc-400">Compose and blast instant messages to target personnel or customers.</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${stats.smsCredits > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <Coins className="inline size-3 mr-1" />
                        {stats.smsCredits} credits available
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Target Group Selector */}
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-2">Select Target Audience</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRecipientGroup("customers")}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          recipientGroup === "customers"
                            ? "bg-orange-500/10 border-orange-500 text-orange-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        <Users className="inline size-3 mr-1" />
                        Customers ({stats.customerCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecipientGroup("staff")}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          recipientGroup === "staff"
                            ? "bg-orange-500/10 border-orange-500 text-orange-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        <UserCheck className="inline size-3 mr-1" />
                        Staff ({stats.staffCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecipientGroup("drivers")}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          recipientGroup === "drivers"
                            ? "bg-orange-500/10 border-orange-500 text-orange-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        <Utensils className="inline size-3 mr-1" />
                        Delivery ({stats.driverCount})
                      </button>
                    </div>
                  </div>

                  {/* Preset Quick Templates */}
                  <div>
                    <span className="text-[11px] font-medium text-zinc-400 block mb-1.5">Quick Templates:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate("Urban Flame BBQ Special: Get 15% OFF all grilled platters today! Use code BBQ15 at pickup.")}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:border-zinc-600 transition-all"
                      >
                        Weekend Discount Promo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate("Team Alert: Mandatory shift briefing at 4:30 PM before evening service. Please be punctual.")}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:border-zinc-600 transition-all"
                      >
                        Staff Shift Announcement
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate("VIP Reservation Reminder: Your table at Urban Flame BBQ is reserved for tonight at 7 PM. We look forward to serving you!")}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:border-zinc-600 transition-all"
                      >
                        VIP Reminder
                      </button>
                    </div>
                  </div>

                  {/* Message Input Area */}
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Message Content</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your SMS message here..."
                      className="w-full px-3 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-zinc-100 placeholder:text-zinc-600 resize-none"
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px] text-zinc-500">
                      <span>{message.length} characters</span>
                      <span>{Math.ceil(message.length / 160) || 1} SMS Page(s)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-zinc-800/80 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">Sender ID: <strong className="text-zinc-300">UF BBQ</strong></span>
                  <span className={`text-xs ${stats.smsCredits > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stats.smsCredits} credits left
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDispatch}
                  disabled={sending || stats.smsCredits === 0}
                  className={`px-5 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg ${
                    stats.smsCredits === 0
                      ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20 hover:shadow-orange-600/30'
                  }`}
                >
                  {sending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      {stats.smsCredits === 0 ? 'No Credits' : 'Dispatch Broadcast'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recent SMS Activity Feed */}
            <div className="lg:col-span-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Clock className="size-4 text-orange-500" />
                    Recent Broadcasts
                  </h2>
                  <a href="/dashboard/logs" className="text-xs text-orange-400 hover:text-orange-300 hover:underline transition-colors">
                    View All
                  </a>
                </div>

                <div className="mt-4 space-y-3">
                  {recentLogs.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                      <MessageSquare className="size-8 mx-auto text-zinc-600 mb-2" />
                      <p className="text-sm">No broadcasts yet</p>
                      <p className="text-xs mt-1">Send your first SMS to see it here</p>
                    </div>
                  ) : (
                    recentLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1.5 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-200">
                            {log.message.length > 30 ? log.message.substring(0, 30) + '...' : log.message}
                          </span>
                          {getStatusBadge(log.status)}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2">"{log.message}"</p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                          <span>Recipient: {log.recipient}</span>
                          <span>{formatDate(log.sent_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 mt-4 text-center">
                <p className="text-[11px] text-zinc-500">Connected Gateway: <span className="text-zinc-300">Destech API v2</span></p>
              </div>
            </div>

          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}