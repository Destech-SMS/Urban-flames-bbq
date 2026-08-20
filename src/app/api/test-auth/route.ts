// app/api/test-auth/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      hasSession: !!session,
      sessionUser: session?.user?.email || null,
      hasUser: !!user,
      userEmail: user?.email || null,
      userId: user?.id || null,
      sessionError: sessionError?.message || null,
      userError: userError?.message || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}