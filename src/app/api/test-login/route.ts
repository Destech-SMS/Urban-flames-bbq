// app/api/test-login/route.ts
import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 })
    }

    console.log('🔐 Testing login for:', email)

    const supabase = createClient()
    
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Login error:', error)
      return NextResponse.json({ 
        success: false,
        error: error.message,
        code: error.status
      }, { status: 401 })
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    console.log('✅ Login successful for:', email)

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
      profile: profile || null,
      session: {
        access_token: data.session?.access_token ? 'present' : 'missing',
        refresh_token: data.session?.refresh_token ? 'present' : 'missing',
        expires_at: data.session?.expires_at
      }
    })
    
  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}