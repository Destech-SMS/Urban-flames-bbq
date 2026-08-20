// components/login-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log("🔐 Login attempt started")
    console.log("📧 Email:", email)

    try {
      // Initialize Supabase client
      console.log("🔄 Creating Supabase client...")
      const supabase = createClient()
      
      if (!supabase) {
        console.error("❌ Supabase client is null!")
        setError("Failed to initialize connection")
        setLoading(false)
        return
      }
      
      console.log("✅ Supabase client created successfully")

      // Check if auth is available
      if (!supabase.auth) {
        console.error("❌ Supabase auth is not available!")
        setError("Authentication service unavailable")
        setLoading(false)
        return
      }

      // Attempt login
      console.log("📤 Sending login request...")
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      console.log("📥 Login response received")

      if (authError) {
        console.error("❌ Auth error:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
          details: authError
        })
        
        // Show user-friendly error message
        if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.")
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Please confirm your email before logging in.")
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      if (!data?.user) {
        console.error("❌ No user data returned")
        setError("Login successful but no user data returned")
        setLoading(false)
        return
      }

      console.log("✅ Login successful:", {
        user: data.user.email,
        id: data.user.id,
        hasSession: !!data.session
      })

      // Redirect to dashboard
      console.log("🚀 Redirecting to dashboard...")
      router.push("/dashboard")
      router.refresh()
      
    } catch (err) {
      console.error("💥 Unexpected error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-center text-zinc-100">Portal Access</h1>
        <p className="text-xs text-zinc-400 text-center">Enter your credentials to sign in</p>
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-center">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-300">Email / Username</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@urbanflame.com"
          className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-zinc-100 placeholder:text-zinc-600"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-300">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-zinc-100 placeholder:text-zinc-600"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-md transition-all duration-200 disabled:opacity-50 shadow-lg shadow-orange-600/20"
      >
        {loading ? "Authenticating..." : "Sign In"}
      </button>

      {/* <div className="text-center text-[10px] text-zinc-500">
        <span>Default: admin@urbanflame.com / Admin@2026</span>
      </div> */}
    </form>
  )
}