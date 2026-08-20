// app/dashboard/message/page.tsx
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
import {
  Send,
  Users,
  MessageSquare,
  UserCheck,
  ChefHat,
  Truck,
  User,
  Star,
  Search,
  X,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Coins,
} from "lucide-react"

interface Contact {
  id: string
  name: string | null
  phone: string
  group: string
  created_at: string
}

interface Category {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  count?: number
}

export default function MessagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showContactList, setShowContactList] = useState(false)
  const [smsCredits, setSmsCredits] = useState(0)

  const categories: Category[] = [
    {
      id: "customers",
      label: "Customers",
      icon: <Users className="size-5" />,
      description: "All your restaurant customers"
    },
    {
      id: "vip",
      label: "VIP Diners",
      icon: <Star className="size-5" />,
      description: "Premium VIP customers"
    },
    {
      id: "staff",
      label: "Staff",
      icon: <UserCheck className="size-5" />,
      description: "All restaurant staff"
    },
    {
      id: "kitchen",
      label: "Kitchen Team",
      icon: <ChefHat className="size-5" />,
      description: "Kitchen and culinary team"
    },
    {
      id: "service",
      label: "Service Team",
      icon: <Users className="size-5" />,
      description: "Front of house service team"
    },
    {
      id: "drivers",
      label: "Delivery Drivers",
      icon: <Truck className="size-5" />,
      description: "Delivery and logistics team"
    },
    {
      id: "individual",
      label: "Individual Contacts",
      icon: <User className="size-5" />,
      description: "Select specific contacts"
    }
  ]

  // Fetch contacts and credit balance on load
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch contacts
      const contactsResponse = await fetch('/api/contacts')
      const contactsResult = await contactsResponse.json()
      
      console.log('Contacts fetched:', contactsResult.data?.length || 0)
      
      if (contactsResult.success) {
        setContacts(contactsResult.data || [])
      }

      // Fetch SMS credit balance from database
      const balanceResponse = await fetch('/api/sms/balance')
      const balanceResult = await balanceResponse.json()
      
      if (balanceResult.success) {
        setSmsCredits(balanceResult.data.balance || 0)
        console.log('SMS Credits available:', balanceResult.data.balance)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Get filtered contacts based on category
  const getCategoryContacts = () => {
    if (!selectedCategory || selectedCategory === "individual") {
      return contacts
    }
    return contacts.filter(c => c.group === selectedCategory)
  }

  const getFilteredContacts = () => {
    const categoryContacts = getCategoryContacts()
    if (!searchQuery) return categoryContacts
    return categoryContacts.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    )
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedContacts([])
    setShowContactList(categoryId === "individual")
    setSearchQuery("")
  }

  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev => {
      const exists = prev.some(c => c.id === contact.id)
      if (exists) {
        return prev.filter(c => c.id !== contact.id)
      } else {
        return [...prev, contact]
      }
    })
  }

  const selectAllInCategory = () => {
    const available = getFilteredContacts()
    const allSelected = available.every(c => selectedContacts.some(sc => sc.id === c.id))
    
    if (allSelected) {
      setSelectedContacts(prev => prev.filter(c => !available.some(ac => ac.id === c.id)))
    } else {
      const newContacts = available.filter(c => !selectedContacts.some(sc => sc.id === c.id))
      setSelectedContacts(prev => [...prev, ...newContacts])
    }
  }

  const clearSelectedContacts = () => {
    setSelectedContacts([])
  }

  const getRecipients = (): string[] => {
    if (selectedContacts.length > 0) {
      return selectedContacts.map(c => c.phone)
    }
    if (selectedCategory && selectedCategory !== "individual") {
      return getCategoryContacts().map(c => c.phone)
    }
    return []
  }

  const handleSend = async () => {
    if (!message.trim()) {
      alert("Please enter a message before sending.")
      return
    }

    const recipients = getRecipients()
    if (recipients.length === 0) {
      alert("No recipients selected. Please select contacts to send to.")
      return
    }

    // Check if user has enough SMS credits
    if (smsCredits < recipients.length) {
      alert(`Insufficient SMS credits. You have ${smsCredits} credits but need ${recipients.length}. Please purchase more credits.`)
      return
    }

    const categoryName = selectedCategory ? categories.find(c => c.id === selectedCategory)?.label || selectedCategory : "Selected"
    const count = recipients.length

    if (!confirm(`Send "${message}" to ${count} ${categoryName}? This will use ${count} SMS credit(s).`)) {
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
          group: selectedCategory || "individual"
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send SMS')
      }

      // Refresh credit balance after sending
      const balanceResponse = await fetch('/api/sms/balance')
      const balanceResult = await balanceResponse.json()
      if (balanceResult.success) {
        setSmsCredits(balanceResult.data.balance || 0)
      }

      setSuccessMessage(`SMS sent successfully!\nTotal: ${result.stats.total}\nCredit Used: ${result.stats.credit_used}\nCredit Left: ${result.stats.credit_left}`)
      
      setMessage("")
      setSelectedContacts([])
      
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

  // Get count for a category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "individual") return 0
    return contacts.filter(c => c.group === categoryId).length
  }

  // Get recipient count for display
  const recipientCount = getRecipients().length

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-zinc-950 text-zinc-100">
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-zinc-400">
              <Loader2 className="size-6 animate-spin text-orange-500" />
              Loading...
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
                    Send Message
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-200"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                  <MessageSquare className="size-6 text-orange-500" />
                  Send Message
                </h1>
                <p className="text-sm text-zinc-400">Compose and send messages to your contacts</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2">
              <Coins className="size-4 text-amber-400" />
              <span className="text-sm text-zinc-300">{smsCredits} credits</span>
              <a
                href="/dashboard/credits"
                className="text-xs text-orange-400 hover:text-orange-300 font-medium"
              >
                Buy More
              </a>
            </div>
          </div>

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

          {/* Step 1: Select Category */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Users className="size-5 text-orange-500" />
              Step 1: Select Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((category) => {
                const count = getCategoryCount(category.id)
                const isSelected = selectedCategory === category.id
                const isIndividual = category.id === "individual"
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? "bg-orange-500/20 text-orange-400" : "bg-zinc-700/50 text-zinc-400"
                      }`}>
                        {category.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          isSelected ? "text-orange-400" : "text-zinc-200"
                        }`}>
                          {category.label}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {isIndividual ? "Select specific contacts" : `${count} contacts`}
                        </p>
                      </div>
                    </div>
                    {isSelected && isIndividual && (
                      <div className="mt-2 text-xs text-orange-400">
                        {selectedContacts.length} selected
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Select Contacts */}
          {selectedCategory && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <User className="size-5 text-orange-500" />
                  Step 2: Select Contacts
                  <span className="text-sm font-normal text-zinc-500">
                    ({selectedCategory === "individual" 
                      ? selectedContacts.length 
                      : getCategoryContacts().length} selected)
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  {selectedCategory === "individual" && (
                    <>
                      <button
                        onClick={selectAllInCategory}
                        className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                      >
                        {getFilteredContacts().length > 0 && 
                         getFilteredContacts().every(c => selectedContacts.some(sc => sc.id === c.id)) 
                          ? "Deselect All" 
                          : "Select All"}
                      </button>
                      {selectedContacts.length > 0 && (
                        <button
                          onClick={clearSelectedContacts}
                          className="text-xs px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors flex items-center gap-1"
                        >
                          <X className="size-3" />
                          Clear
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${selectedCategory === "individual" ? "contacts" : categories.find(c => c.id === selectedCategory)?.label || "contacts"}...`}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Contact List */}
              <div className="max-h-60 overflow-y-auto space-y-1">
                {getFilteredContacts().length === 0 ? (
                  <p className="text-center text-zinc-500 py-4 text-sm">
                    No contacts found in this category
                  </p>
                ) : (
                  getFilteredContacts().map(contact => {
                    const isSelected = selectedContacts.some(c => c.id === contact.id)
                    const isSelectable = selectedCategory === "individual"
                    
                    return (
                      <div
                        key={contact.id}
                        onClick={() => isSelectable && toggleContactSelection(contact)}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          isSelectable 
                            ? `cursor-pointer hover:bg-zinc-800/50 ${isSelected ? 'bg-orange-500/10 border border-orange-500/20' : ''}`
                            : 'cursor-default'
                        }`}
                      >
                        {isSelectable && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleContactSelection(contact)}
                            className="accent-orange-500"
                          />
                        )}
                        <div className={`p-1.5 rounded ${isSelected ? 'bg-orange-500/20' : 'bg-zinc-800'}`}>
                          <User className="size-3.5 text-zinc-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-zinc-200">{contact.name || 'No name'}</p>
                          <p className="text-xs text-zinc-500">{contact.phone}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          contact.group === 'vip' ? 'bg-amber-500/20 text-amber-400' :
                          contact.group === 'kitchen' ? 'bg-orange-500/20 text-orange-400' :
                          contact.group === 'driver' ? 'bg-blue-500/20 text-blue-400' :
                          contact.group === 'service' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-zinc-700 text-zinc-300'
                        }`}>
                          {contact.group}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Selected Count Summary */}
              <div className="mt-4 p-3 bg-zinc-800/30 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">
                    {selectedCategory === "individual" 
                      ? `${selectedContacts.length} contact(s) selected`
                      : `${getCategoryContacts().length} contacts in ${categories.find(c => c.id === selectedCategory)?.label || selectedCategory}`
                    }
                  </span>
                  <span className="text-zinc-400">
                    Recipients: <span className="text-zinc-200 font-medium">{recipientCount}</span>
                  </span>
                  <span className="text-zinc-400">
                    Credits needed: <span className={`font-medium ${recipientCount > smsCredits ? 'text-red-400' : 'text-emerald-400'}`}>
                      {recipientCount}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Compose Message */}
          {selectedCategory && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <MessageSquare className="size-5 text-orange-500" />
                Step 3: Compose Message
              </h2>

              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1">
                  Message Content
                </label>
                <textarea
                  rows={5}
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

              {/* Quick Templates */}
              <div className="mt-4">
                <span className="text-[11px] font-medium text-zinc-400 block mb-1.5">Quick Templates:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setMessage("Urban Flame BBQ Special: Get 15% OFF all grilled platters today! Use code BBQ15 at pickup.")}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:border-zinc-600 transition-all"
                  >
                    Weekend Discount Promo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessage("Team Alert: Mandatory shift briefing at 4:30 PM before evening service. Please be punctual.")}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:border-zinc-600 transition-all"
                  >
                    Staff Shift Announcement
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessage("VIP Reservation Reminder: Your table at Urban Flame BBQ is reserved for tonight at 7 PM. We look forward to serving you!")}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:border-zinc-600 transition-all"
                  >
                    VIP Reminder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Send Button */}
          {selectedCategory && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-500">
                  Sender ID: <strong className="text-zinc-300">DestTech</strong>
                </span>
                {recipientCount > 0 && (
                  <span className={`text-xs ${recipientCount > smsCredits ? 'text-red-400' : 'text-emerald-400'}`}>
                    {recipientCount} credits needed
                  </span>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={sending || recipientCount === 0 || recipientCount > smsCredits}
                className="px-6 py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Send to {recipientCount} {selectedCategory === "individual" ? "Contacts" : categories.find(c => c.id === selectedCategory)?.label || "Recipients"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}