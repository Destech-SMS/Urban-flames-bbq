import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-extrabold tracking-tight mt-4 mb-6 text-white">Privacy Policy</h1>
        
        <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
          <p>
            At Urban Flames SMS Platform, accessible via our web application, protecting your privacy is a top priority. This Privacy Policy document outlines the types of information we collect and record and how we use it.
          </p>
          
          <h2 className="text-lg font-semibold text-white pt-2">1. Information We Collect</h2>
          <p>
            We collect account registration details (such as restaurant administrator names, email addresses, and phone numbers) and transaction details associated with purchasing digital SMS credits. We also store recipient contact details and message logs uploaded solely for managing your restaurant operational alerts through mNotify.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2">2. How We Use Your Information</h2>
          <p>
            Your information is used strictly to provide, operate, and maintain our platform, process your secure credit purchases via Paystack, authenticate your admin access, and fulfill text message routing.
          </p>

          <h2 className="text-lg font-semibold text-white pt-2">3. Data Security</h2>
          <p>
            We implement robust security measures to protect your operational data, user credentials, and messaging records against unauthorized access, modification, or disclosure.
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>© 2026 Urban Flames SMS Platform. All rights reserved.</p>
      </footer>
    </main>
  )
}