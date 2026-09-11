// app/api/paystack/verify/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference') || searchParams.get('trxref')

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!paystackSecret || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 })
    }

    // Initialize Supabase Admin Client to bypass RLS during the external payment redirect
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

      const currentBalance = Number(profile?.wallet_balance) || 0
      const amountToAdd = Number(amount) || 0
      const newBalance = Number((currentBalance + amountToAdd).toFixed(2))

      // Update wallet
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user_id)

      if (error) {
        console.error('Supabase update error:', error)
        return NextResponse.json({ error: `Failed to update wallet: ${error.message}` }, { status: 500 })
      }

      // Log transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user_id,
          type: 'load_wallet',
          amount: amountToAdd,
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