// hooks/useSessionTimeout.ts
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SESSION_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds

export function useSessionTimeout() {
  const router = useRouter()
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [isIdle, setIsIdle] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const resetTimer = () => {
      setLastActivity(Date.now())
      setIsIdle(false)
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const timeSinceLastActivity = Date.now() - lastActivity
      
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        setIsIdle(true)
        // Sign out user
        await supabase.auth.signOut()
        router.push('/login')
      }
    }

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Check session every 30 seconds
    const interval = setInterval(checkSession, 30000)

    // Initial check
    checkSession()

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
      clearInterval(interval)
    }
  }, [lastActivity, router, supabase])

  return { isIdle }
}