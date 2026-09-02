import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <nav className="max-w-4xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-zinc-800">
        <h2 className="text-lg font-bold text-orange-500">Urban Flames SMS Platform</h2>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition">
          ← Back to Home
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12 flex-1">
        <span className="bg-orange-500/10 text-orange-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-orange-500/20">
          Legal Compliance
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-4 mb-6 text-white">Terms of Service</h1>
        
        <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
          <p>
            Welcome to the Urban Flames SMS Platform. By accessing or using our portal to purchase SMS credits and manage restaurant text communications, you agree to comply with and be bound by these terms.
          </p>
          
          <h2 className="text-lg font-semibold text-white pt-2">1. Service Description</h2>
          <p>
            Our platform provides restaurant administrators with a dashboard interface to purchase digital prepaid SMS credit bundles (via Paystack) and transmit operational messages (such as order confirmations and staff notifications) routed through mNotify.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2">2. Acceptable Use Policy</h2>
          <p>
            Users agree not to utilize the messaging infrastructure for spam, phishing, unauthorized marketing, or unsolicited bulk messaging. Accounts found violating messaging compliance guidelines will be suspended immediately.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2">3. Purchases & Refunds</h2>
          <p>
            All SMS credit bundles purchased via Paystack are prepaid. Pricing is fixed per bundle tier (averaging GHS 0.03 per SMS). Credits are non-refundable once allocated to your platform wallet balance.
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>© 2026 Urban Flames SMS Platform. All rights reserved.</p>
      </footer>
    </main>
  )
}