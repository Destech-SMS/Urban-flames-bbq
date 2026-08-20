// app/api/contacts/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 Fetching contacts for user:', user.id)

    // Get ALL contacts for this user (no group filter)
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Contacts API Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Found ${data?.length || 0} contacts for user`)

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('❌ Server Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}