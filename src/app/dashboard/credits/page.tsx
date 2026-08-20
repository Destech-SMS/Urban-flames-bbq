// app/dashboard/credits/page.tsx
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
  Wallet,
  Package,
  Clock,
  Zap,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  History,
  Coins,
} from "lucide-react"

interface Bundle {
  id: string
  name: string
  amount: number
  credits: number
  price_per_sms: number
  expiry_days: number | null
  type: 'expiry' | 'non-expiry'
}

interface Transaction {
  id: string
  type: 'load_wallet' | 'bundle_purchase'
  amount: number
  credits_added: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export default function CreditsPage() {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const [smsCredits, setSmsCredits] = useState(0)
  const [selectedTab, setSelectedTab] = useState<'expiry' | 'non-expiry'>('expiry')
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null)
  const [showLoadWallet, setShowLoadWallet] = useState(false)
  const [loadAmount, setLoadAmount] = useState<number>(10)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Bundle pricing structure
  const expiryBundles: Bundle[] = [
    { id: 'e1', name: 'Starter', amount: 10, credits: 400, price_per_sms: 0.025, expiry_days: 30, type: 'expiry' },
    { id: 'e2', name: 'Basic', amount: 15, credits: 600, price_per_sms: 0.025, expiry_days: 30, type: 'expiry' },
    { id: 'e3', name: 'Standard', amount: 20, credits: 800, price_per_sms: 0.025, expiry_days: 30, type: 'expiry' },
    { id: 'e4', name: 'Popular', amount: 30, credits: 1200, price_per_sms: 0.025, expiry_days: 30, type: 'expiry' },
    { id: 'e5', name: 'Business', amount: 50, credits: 2000, price_per_sms: 0.025, expiry_days: 30, type: 'expiry' },
    { id: 'e6', name: 'Pro', amount: 100, credits: 4000, price_per_sms: 0.025, expiry_days: 30, type: 'expiry' },
  ]

  const nonExpiryBundles: Bundle[] = [
    { id: 'n1', name: 'Micro', amount: 5, credits: 100, price_per_sms: 0.05, expiry_days: null, type: 'non-expiry' },
    { id: 'n2', name: 'Tiny', amount: 10, credits: 200, price_per_sms: 0.05, expiry_days: null, type: 'non-expiry' },
    { id: 'n3', name: 'Starter', amount: 15, credits: 315, price_per_sms: 0.0476, expiry_days: null, type: 'non-expiry' },
    { id: 'n4', name: 'Basic', amount: 20, credits: 420, price_per_sms: 0.0476, expiry_days: null, type: 'non-expiry' },
    { id: 'n5', name: 'Standard', amount: 30, credits: 650, price_per_sms: 0.0462, expiry_days: null, type: 'non-expiry' },
    { id: 'n6', name: 'Popular', amount: 50, credits: 1100, price_per_sms: 0.0455, expiry_days: null, type: 'non-expiry' },
    { id: 'n7', name: 'Business', amount: 100, credits: 2300, price_per_sms: 0.0435, expiry_days: null, type: 'non-expiry' },
    { id: 'n8', name: 'Pro', amount: 150, credits: 3500, price_per_sms: 0.0429, expiry_days: null, type: 'non-expiry' },
    { id: 'n9', name: 'Enterprise', amount: 200, credits: 4800, price_per_sms: 0.0417, expiry_days: null, type: 'non-expiry' },
    { id: 'n10', name: 'Ultimate', amount: 500, credits: 12500, price_per_sms: 0.04, expiry_days: null, type: 'non-expiry' },
  ]

  // Fetch wallet data
  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch balance
      const balanceRes = await fetch('/api/wallet/balance')
      const balanceResult = await balanceRes.json()
      
      if (balanceResult.success) {
        setWalletBalance(balanceResult.data.balance || 0)
        setSmsCredits(balanceResult.data.sms_credits || 0)
      }

      // Fetch transactions
      const transRes = await fetch('/api/wallet/transactions')
      const transResult = await transRes.json()
      
      if (transResult.success) {
        setTransactions(transResult.data || [])
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      setError('Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadWallet = async () => {
    if (loadAmount < 10) {
      setError('Minimum load amount is GHS 10')
      return
    }

    setProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      // Initialize Paystack payment
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: loadAmount,
          email: 'user@email.com', // Will come from user session
          purpose: 'wallet_load'
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize payment')
      }

      // Redirect to Paystack checkout
      if (result.data.authorization_url) {
        window.location.href = result.data.authorization_url
      }

    } catch (error) {
      console.error('Error loading wallet:', error)
      setError(error instanceof Error ? error.message : 'Failed to load wallet')
    } finally {
      setProcessing(false)
    }
  }

  const handlePurchaseBundle = async (bundle: Bundle) => {
    if (walletBalance < bundle.amount) {
      setError(`Insufficient wallet balance. Please load your wallet with GHS ${bundle.amount - walletBalance}`)
      return
    }

    if (!confirm(`Purchase ${bundle.name} bundle for GHS ${bundle.amount}?`)) {
      return
    }

    setProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/bundles/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: bundle.id,
          amount: bundle.amount,
          credits: bundle.credits,
          expiry_days: bundle.expiry_days
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to purchase bundle')
      }

      setSuccess(`Successfully purchased ${bundle.name} bundle! ${bundle.credits} SMS credits added.`)
      await fetchWalletData()
      setSelectedBundle(null)

    } catch (error) {
      console.error('Error purchasing bundle:', error)
      setError(error instanceof Error ? error.message : 'Failed to purchase bundle')
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-zinc-950 text-zinc-100">
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-zinc-400">
              <Loader2 className="size-6 animate-spin text-orange-500" />
              Loading wallet...
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
                    Buy SMS Credits
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Page Content */}
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

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg">
              <p className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                {success}
              </p>
            </div>
          )}

          {/* Wallet Balance */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Available Balance</p>
                <p className="text-3xl font-bold text-white mt-1">{formatCurrency(walletBalance)}</p>
                <p className="text-orange-200 text-xs mt-1">
                  <Coins className="inline size-3 mr-1" />
                  {smsCredits} SMS Credits available
                </p>
              </div>
              <button
                onClick={() => setShowLoadWallet(!showLoadWallet)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Wallet className="size-4" />
                Load Wallet
              </button>
            </div>
          </div>

          {/* Load Wallet Modal */}
          {showLoadWallet && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-100">Load Wallet</h3>
                <button
                  onClick={() => setShowLoadWallet(false)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <ArrowLeft className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {[10, 20, 50, 100, 200].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setLoadAmount(amount)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      loadAmount === amount
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <p className="text-sm font-bold">GHS {amount}</p>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={loadAmount}
                  onChange={(e) => setLoadAmount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Custom amount"
                />
                <button
                  onClick={handleLoadWallet}
                  disabled={processing}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      Pay Now
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Minimum load: GHS 10. Payments powered by Paystack.</p>
            </div>
          )}

          {/* Bundle Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setSelectedTab('expiry')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                selectedTab === 'expiry'
                  ? 'text-orange-400 border-b-2 border-orange-500'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="inline size-4 mr-2" />
              Expiry (30 Days)
            </button>
            <button
              onClick={() => setSelectedTab('non-expiry')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                selectedTab === 'non-expiry'
                  ? 'text-orange-400 border-b-2 border-orange-500'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="inline size-4 mr-2" />
              Non-Expiry
            </button>
          </div>

          {/* Bundle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(selectedTab === 'expiry' ? expiryBundles : nonExpiryBundles).map((bundle) => (
              <div
                key={bundle.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-zinc-100">{bundle.name}</h3>
                  {bundle.expiry_days && (
                    <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                      {bundle.expiry_days} Days
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-orange-500">{formatCurrency(bundle.amount)}</p>
                <p className="text-sm text-zinc-400 mt-1">{bundle.credits} SMS Credits</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {formatCurrency(bundle.price_per_sms)} per SMS
                </p>
                <button
                  onClick={() => handlePurchaseBundle(bundle)}
                  disabled={processing || walletBalance < bundle.amount}
                  className="w-full mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {walletBalance < bundle.amount ? 'Insufficient Balance' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>

          {/* Transaction History */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <History className="size-5 text-orange-500" />
                Transaction History
              </h3>
              <button
                onClick={fetchWalletData}
                className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                <RefreshCw className="size-3" />
                Refresh
              </button>
            </div>
            {transactions.length === 0 ? (
              <p className="text-center text-zinc-500 py-4">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/30 border border-zinc-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm text-zinc-200 font-medium">
                        {tx.type === 'load_wallet' ? 'Load Wallet' : 'Bundle Purchase'}
                      </p>
                      <p className="text-xs text-zinc-500">{formatDate(tx.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-zinc-200">
                        {formatCurrency(tx.amount)}
                      </p>
                      {tx.credits_added > 0 && (
                        <p className="text-xs text-emerald-400">+{tx.credits_added} credits</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}