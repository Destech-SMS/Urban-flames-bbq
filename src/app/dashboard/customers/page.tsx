// app/dashboard/customers/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
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
  Plus, 
  Users, 
  Star, 
  User, 
  Trash2, 
  Edit2, 
  Phone,
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

interface Contact {
  id: string
  name: string | null
  phone: string
  group: string
  created_at: string
}

interface ImportResult {
  success: boolean
  message: string
  imported?: number
  failed?: number
  errors?: string[]
}

export default function CustomersPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    group: "customer"
  })
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      let query = supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .in('group', ['customer', 'vip'])
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [search])

  // Add or Update customer
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please login first')
        return
      }

      if (!formData.phone) {
        alert('Phone number is required')
        return
      }

      if (editingContact) {
        const { error } = await supabase
          .from('contacts')
          .update({
            name: formData.name || null,
            phone: formData.phone,
            group: formData.group
          })
          .eq('id', editingContact.id)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert({
            user_id: user.id,
            name: formData.name || null,
            phone: formData.phone,
            group: formData.group
          })

        if (error) throw error
      }

      setFormData({ name: "", phone: "", group: "customer" })
      setShowAddModal(false)
      setEditingContact(null)
      fetchCustomers()
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Failed to save customer. Please try again.')
    }
  }

  // Delete customer
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Failed to delete customer. Please try again.')
    }
  }

  // Edit customer
  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name || "",
      phone: contact.phone,
      group: contact.group || "customer"
    })
    setShowAddModal(true)
  }

  // ============================================
  // IMPORT FUNCTIONALITY
  // ============================================

  // Download CSV Template
  const downloadTemplate = () => {
    const headers = ['Name', 'Phone', 'Group']
    const sampleData = [
      ['John Doe', '0244123456', 'customer'],
      ['Jane Smith', '0244987654', 'vip'],
      ['Mike Johnson', '0244567890', 'customer']
    ]
    
    let csvContent = headers.join(',') + '\n'
    sampleData.forEach(row => {
      csvContent += row.join(',') + '\n'
    })

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customer_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        alert('Please upload a CSV or Excel file')
        return
      }
      setImportFile(file)
      setImportResult(null)
    }
  }

  // Parse CSV
  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim())
    return lines.map(line => {
      const values: string[] = []
      let currentValue = ''
      let insideQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          insideQuotes = !insideQuotes
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.trim())
      return values
    })
  }

  // Process import
  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file first')
      return
    }

    setImporting(true)
    setImportResult(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please login first')
        setImporting(false)
        return
      }

      let data: string[][] = []
      
      if (importFile.name.endsWith('.csv')) {
        const text = await importFile.text()
        data = parseCSV(text)
      } else {
        alert('For Excel files, please save as CSV first or use the template')
        setImporting(false)
        return
      }

      if (data.length < 2) {
        alert('File is empty or invalid')
        setImporting(false)
        return
      }

      const headers = data[0].map(h => h.toLowerCase().trim())
      const nameIndex = headers.findIndex(h => h === 'name')
      const phoneIndex = headers.findIndex(h => h === 'phone')
      const groupIndex = headers.findIndex(h => h === 'group')

      if (phoneIndex === -1) {
        alert('Phone column is required. Please use the template format.')
        setImporting(false)
        return
      }

      let imported = 0
      let failed = 0
      const errors: string[] = []

      for (let i = 1; i < data.length; i++) {
        const row = data[i]
        const name = nameIndex !== -1 ? row[nameIndex] : ''
        const phone = row[phoneIndex]?.trim()
        const group = groupIndex !== -1 ? row[groupIndex]?.trim().toLowerCase() : 'customer'

        if (!phone || phone.length < 8) {
          failed++
          errors.push(`Row ${i + 1}: Invalid phone number "${phone || 'empty'}"`)
          continue
        }

        const validGroups = ['customer', 'vip']
        const finalGroup = validGroups.includes(group) ? group : 'customer'

        try {
          const { error } = await supabase
            .from('contacts')
            .insert({
              user_id: user.id,
              name: name || null,
              phone: phone,
              group: finalGroup
            })

          if (error) {
            failed++
            errors.push(`Row ${i + 1}: ${error.message}`)
          } else {
            imported++
          }
        } catch (error) {
          failed++
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      setImportResult({
        success: imported > 0,
        message: imported > 0 ? `Successfully imported ${imported} customers` : 'No customers were imported',
        imported,
        failed,
        errors: errors.slice(0, 5)
      })

      if (imported > 0) {
        fetchCustomers()
      }
    } catch (error) {
      console.error('Import error:', error)
      setImportResult({
        success: false,
        message: 'Failed to import file. Please check the format and try again.',
        imported: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setImporting(false)
    }
  }

  const closeImportModal = () => {
    setShowImportModal(false)
    setImportFile(null)
    setImportResult(null)
    setImporting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const totalCustomers = contacts.length
  const vipCount = contacts.filter(c => c.group === 'vip').length
  const regularCount = contacts.filter(c => c.group === 'customer').length

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-zinc-950 text-zinc-100">
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
                    Customer Management
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Customer Management</h1>
              <p className="text-sm text-zinc-400">Manage your customer contacts</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-zinc-700"
              >
                <Upload className="size-4" />
                Import
              </button>
              <button
                onClick={() => {
                  setEditingContact(null)
                  setFormData({ name: "", phone: "", group: "customer" })
                  setShowAddModal(true)
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="size-4" />
                Add Customer
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Total Customers</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight">{totalCustomers}</p>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">All customer contacts</p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">VIP Diners</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <Star className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight">{vipCount}</p>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">Premium customers</p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Regular Customers</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-700/50 text-zinc-400">
                  <User className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight">{regularCount}</p>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">Standard customers</p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-zinc-800">
                  <tr className="text-left text-zinc-400 text-sm">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Group</th>
                    <th className="px-4 py-3 font-medium">Added</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                          Loading...
                        </div>
                      </td>
                    </tr>
                  ) : contacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        No customers found. Add your first customer!
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 text-zinc-200 font-medium">
                          {contact.name || 'No name'}
                        </td>
                        <td className="px-4 py-3 text-zinc-300">
                          <div className="flex items-center gap-2">
                            <Phone className="size-3.5 text-zinc-500" />
                            {contact.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            contact.group === 'vip' 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                              : 'bg-zinc-700 text-zinc-300'
                          }`}>
                            {contact.group === 'vip' ? 'VIP Diner' : 'Regular'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-sm">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(contact)}
                              className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-zinc-200"
                              title="Edit"
                            >
                              <Edit2 className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-zinc-400 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
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
              {contacts.length} customers total
            </p>
          </div>
        </div>
      </SidebarInset>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-zinc-100">Import Customers</h2>
              <button
                onClick={closeImportModal}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-zinc-300 mb-2">File Format Requirements:</p>
              <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                <li>CSV or Excel file (.csv, .xlsx)</li>
                <li>Required columns: <span className="text-zinc-300 font-medium">Name, Phone, Group</span></li>
                <li>Group options: <span className="text-zinc-300">customer</span> or <span className="text-zinc-300">vip</span></li>
                <li>First row must be the header row</li>
              </ul>
            </div>

            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors mb-4"
            >
              <Download className="size-4" />
              Download CSV Template
            </button>

            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 mb-4 text-center hover:border-zinc-600 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv,.xlsx"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileSpreadsheet className="size-10 text-zinc-500" />
                <span className="text-sm text-zinc-400">
                  {importFile ? importFile.name : 'Click to select or drag and drop'}
                </span>
                <span className="text-xs text-zinc-500">Supports CSV and Excel files</span>
              </label>
            </div>

            {importResult && (
              <div className={`p-3 rounded-lg mb-4 ${
                importResult.success 
                  ? 'bg-emerald-500/10 border border-emerald-500/20' 
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <div className="flex items-start gap-2">
                  {importResult.success ? (
                    <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${
                      importResult.success ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {importResult.message}
                    </p>
                    {importResult.imported !== undefined && (
                      <p className="text-xs text-zinc-400">
                        {importResult.imported} imported, {importResult.failed} failed
                      </p>
                    )}
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-1 text-xs text-red-400 space-y-0.5">
                        {importResult.errors.map((err, idx) => (
                          <p key={idx}>• {err}</p>
                        ))}
                        {importResult.errors.length > 5 && (
                          <p className="text-zinc-500">And {importResult.errors.length - 5} more errors...</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Import Customers
                  </>
                )}
              </button>
              <button
                onClick={closeImportModal}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-zinc-100 mb-4">
              {editingContact ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1">
                  Name <span className="text-zinc-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0244123456"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <p className="text-xs text-zinc-500 mt-1">Format: 0244123456 or 233244123456</p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1">Group</label>
                <select
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="customer">Regular Customer</option>
                  <option value="vip">VIP Diner</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors"
                >
                  {editingContact ? 'Update Customer' : 'Add Customer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingContact(null)
                    setFormData({ name: "", phone: "", group: "customer" })
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarProvider>
  )
}