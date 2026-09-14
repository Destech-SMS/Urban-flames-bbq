// app/api/paystack/verify/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const reference = searchParams.get('reference') || searchParams.get('trxref')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin
  const redirectBase = `${appUrl}/dashboard/credits`

  const fail = (msg: string) =>
    NextResponse.redirect(`${redirectBase}?error=${encodeURIComponent(msg)}`)

  try {
    if (!reference) return fail('Reference is required')

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!paystackSecret || !supabaseUrl || !supabaseServiceKey) {
      const missing = []
      if (!paystackSecret) missing.push('PAYSTACK_SECRET_KEY')
      if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
      if (!supabaseServiceKey) missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
      return fail(`Server config missing: ${missing.join(', ')}`)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Verify transaction with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    const result = await response.json()

    if (!result.status || result.data?.status !== 'success') {
      return fail('Payment verification failed')
    }

    const metadata = result.data.metadata || {}
    const user_id = metadata.user_id
    const purpose = metadata.purpose || 'wallet_load'
    const amountPaid = Number(result.data.amount) / 100

    if (!user_id) return fail('Missing user in metadata')
    if (!amountPaid || amountPaid <= 0) return fail('Invalid payment amount')

    // 2. Idempotency Check (Informational only now)
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .maybeSingle()

    // If the transaction exists AND the wallet was already updated, just redirect.
    // But we still need to check if the wallet was actually updated.
    // For safety, we will proceed with the wallet update regardless, 
    // using the transaction insert as the final gatekeeper.
    
    if (purpose === 'wallet_load') {
      // 3. Fetch current balance
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user_id)
        .single()

      if (fetchError) {
        console.error('Fetch profile error:', fetchError)
        return fail('Failed to fetch wallet')
      }

      // 4. Update wallet (Incrementing instead of setting)
      // Using RPC or manual increment is safer, but we'll calculate here.
      // NOTE: If the webhook already updated this, this will double-credit!
      // To prevent double credit, we check if the transaction exists FIRST.
      
      // We'll use a transaction-safe approach:
      // Only update the wallet if we successfully insert the transaction log.
      
      const currentBalance = Number(profile?.wallet_balance) || 0
      const newBalance = Number((currentBalance + amountPaid).toFixed(2))

      // 5. Log transaction FIRST (This acts as the lock)
      // If the webhook already inserted it, this will fail with a unique constraint error (23505)
      const { error: txError } = await supabase.from('transactions').insert({
        user_id,
        type: 'load_wallet',
        amount: amountPaid,
        credits_added: 0,
        status: 'completed',
        reference,
      })

      // If the transaction already exists (Webhook won the race), stop here.
      if (txError) {
        if (txError.code === '23505') { // Unique violation
           console.log('Transaction already logged by webhook. Skipping wallet update.')
           return NextResponse.redirect(`${redirectBase}?success=${encodeURIComponent('Payment already processed')}`)
        }
        console.error('Transaction log error:', txError)
        return fail(`Failed to log transaction: ${txError.message}`)
      }

      // 6. If we successfully logged the transaction, NOW update the wallet
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user_id)

      if (updateError) {
        console.error('Supabase update error:', updateError)
        return fail(`Failed to update wallet: ${updateError.message}`)
      }

    } else {
      return fail('Unknown payment purpose')
    }

    return NextResponse.redirect(
      `${redirectBase}?success=${encodeURIComponent('Payment successful!')}`
    )
  } catch (error) {
    console.error('Verification error:', error)
    return fail('Payment verification failed')
  }
}