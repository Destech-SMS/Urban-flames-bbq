// components/auth-provider.tsx
"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check if current path is protected
      const isProtectedRoute = pathname.startsWith('/dashboard')
      
      console.log('🔐 AuthProvider check:', {
        path: pathname,
        isProtected: isProtectedRoute,
        hasSession: !!session
      })

      // If no session and on protected route, redirect to login
      if (!session && isProtectedRoute) {
        console.log('🚫 AuthProvider redirecting to login')
        router.push('/login')
      }
      
      // If session exists and on login page, redirect to dashboard
      if (session && pathname === '/login') {
        console.log('✅ AuthProvider redirecting to dashboard')
        router.push('/dashboard')
      }
      
      setIsLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname.startsWith('/dashboard')) {
        console.log('🚫 Auth state change: redirecting to login')
        router.push('/login')
      }
      if (session && pathname === '/login') {
        console.log('✅ Auth state change: redirecting to dashboard')
        router.push('/dashboard')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router, supabase])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}