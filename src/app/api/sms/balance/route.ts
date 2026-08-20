// app/api/sms/balance/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get SMS credit balance from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('sms_credit_balance')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching SMS balance:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const balance = profile?.sms_credit_balance || 0

    return NextResponse.json({
      success: true,
      data: {
        balance: balance,
        bonus: 0 // No bonus from database
      }
    })

  } catch (error) {
    console.error('Balance check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check balance' },
      { status: 500 }
    )
  }
}