import Link from 'next/link'

export default function SupportPage() {
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
          Customer Assistance
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-4 mb-6 text-white">Support Center</h1>
        
        <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
          <p>
            Need help with your account, credit top-ups, or message delivery? Our technical support team is here to assist restaurant administrators.
          </p>
          
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
            <h2 className="text-base font-semibold text-white">Contact Channels</h2>
            <p><strong className="text-zinc-100">Technical Support Email:</strong> destinyfelix823@gmail.com</p>
            <p><strong className="text-zinc-100">Response Time:</strong> Within 24 hours on business days.</p>
            <p><strong className="text-zinc-100">Gateway Provider:</strong> Powered securely via Paystack & mNotify infrastructure.</p>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>© 2026 Urban Flames SMS Platform. All rights reserved.</p>
      </footer>
    </main>
  )
}