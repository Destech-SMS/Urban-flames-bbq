import Link from 'next/link'

export default function RootPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      {/* Navigation Bar */}
      <nav className="max-w-6xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-zinc-800">
        <h2 className="text-xl font-bold text-orange-500 tracking-wide">Urban Flames SMS Platform</h2>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition">
            Client Portal Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center my-auto">
        <span className="bg-orange-500/10 text-orange-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-orange-500/20">
          B2B Software & Messaging Service
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-6 mb-6 text-white">
          Restaurant SMS Credit & <span className="text-orange-500">Gateway Solutions</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          A dedicated software platform enabling restaurant administrators to purchase bulk SMS credit bundles 
          and manage automated customer engagement text notifications seamlessly.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition">
            Access Dashboard & Top Up
          </Link>
        </div>
      </div>

      {/* Footer with Compliance Links */}
      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>© 2026 Urban Flames SMS Platform. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/privacy" className="hover:text-zinc-300 transition underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-300 transition underline">Terms of Service</Link>
          <Link href="/support" className="hover:text-zinc-300 transition underline">Support</Link>
        </div>
      </footer>
    </main>
  );
}