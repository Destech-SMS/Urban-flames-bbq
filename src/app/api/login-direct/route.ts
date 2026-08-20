// app/api/login-direct/route.ts
import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    console.log('🔐 Direct login attempt for:', email)
    
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Login error:', error)
      return NextResponse.json({ 
        success: false,
        error: error.message,
        status: error.status,
        code: error.code
      }, { status: 401 })
    }

    console.log('✅ Login successful for:', email)
    console.log('📊 User ID:', data.user?.id)
    console.log('📊 Session:', !!data.session)

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
      profile: profile || null,
      hasSession: !!data.session
    })
    
  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}