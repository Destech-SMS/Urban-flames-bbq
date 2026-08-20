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

    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group') || ''

    // Explicitly select all columns including 'group'
    let query = supabase
      .from('contacts')
      .select('id, user_id, name, phone, group, created_at')  // Make sure 'group' is selected
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // If group is provided, filter by it
    if (group) {
      query = query.eq('group', group)
    }

    const { data, error } = await query

    if (error) {
      console.error('Contacts API Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Found ${data?.length || 0} contacts for user ${user.email}`)

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}