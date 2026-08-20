// app/api/bundles/purchase/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bundleId, amount, credits, expiry_days } = await request.json()

    // Check wallet balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance, sms_credit_balance')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
    }

    const currentBalance = profile?.wallet_balance || 0

    if (currentBalance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Deduct from wallet and add SMS credits
    const newBalance = currentBalance - amount
    const currentSmsCredits = profile?.sms_credit_balance || 0
    const newSmsCredits = currentSmsCredits + credits

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        wallet_balance: newBalance,
        sms_credit_balance: newSmsCredits
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log transaction
    const { error: logError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'bundle_purchase',
        amount: amount,
        credits_added: credits,
        bundle_id: bundleId,
        expiry_days: expiry_days,
        status: 'completed',
      })

    if (logError) {
      console.error('Failed to log transaction:', logError)
    }

    return NextResponse.json({
      success: true,
      data: {
        new_balance: newBalance,
        credits_added: credits,
        total_sms_credits: newSmsCredits,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Purchase failed' },
      { status: 500 }
    )
  }
}