// app/api/paystack/verify/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    }

    // Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!result.status || result.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Get user from metadata
    const { user_id, purpose, amount } = result.data.metadata

    const supabase = await createClient()

    if (purpose === 'wallet_load') {
      // Get current balance
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user_id)
        .single()

      if (fetchError) {
        return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 })
      }

      const currentBalance = profile?.wallet_balance || 0
      const newBalance = currentBalance + amount

      // Update wallet
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user_id)

      if (error) {
        return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 })
      }

      // Log transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user_id,
          type: 'load_wallet',
          amount: amount,
          credits_added: 0,
          status: 'completed',
        })
    }

    // Redirect to credits page with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=Payment successful!`)
    
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?error=Payment verification failed`)
  }
}