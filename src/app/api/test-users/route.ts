// app/api/test-users/route.ts
import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // 1. Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({ 
        error: 'Session error: ' + sessionError.message 
      }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ 
        error: 'No active session. Please login first.',
        authenticated: false 
      }, { status: 401 })
    }

    console.log('✅ Session found for:', session.user.email)

    // 2. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Profile error:', profileError)
    }

    // 3. Get all profiles (if superadmin)
    let allProfiles = []
    if (profile?.role === 'superadmin') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error) {
        allProfiles = data || []
      }
    }

    // 4. Get some stats
    const { count: userCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at,
        last_sign_in: session.user.last_sign_in_at,
      },
      profile: profile || null,
      allProfiles: allProfiles,
      stats: {
        totalUsers: userCount || 0,
        role: profile?.role || 'unknown',
        isSuperAdmin: profile?.role === 'superadmin'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}