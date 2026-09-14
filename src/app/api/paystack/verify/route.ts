// app/api/paystack/verify/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const reference = searchParams.get('reference') || searchParams.get('trxref')

  // Use the request origin so localhost stays on localhost, and prod stays on prod.
  // Fall back to env var if needed.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin
  const redirectBase = `${appUrl}/dashboard/credits`

  const fail = (msg: string) =>
    NextResponse.redirect(`${redirectBase}?error=${encodeURIComponent(msg)}`)

  try {
    if (!reference) {
      return fail('Reference is required')
    }

    // UPDATED: Matching your exact .env variable names
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    // UPDATED: Better error message to tell you exactly what is missing
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

    const { user_id, purpose } = result.data.metadata || {}
    // Trust Paystack's amount (kobo) not the client metadata.
    const amountPaid = Number(result.data.amount) / 100

    if (!user_id) return fail('Missing user in metadata')
    if (!amountPaid || amountPaid <= 0) return fail('Invalid payment amount')

    // 2. Idempotency: has this reference already been processed?
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .maybeSingle()

    if (existing) {
      // Already processed — just redirect success
      return NextResponse.redirect(
        `${redirectBase}?success=${encodeURIComponent('Payment already processed')}`
      )
    }

    if (purpose === 'wallet_load') {
      // 3. Fetch current balance
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user_id)
        .single()

      if (fetchError) return fail('Failed to fetch wallet')

      const currentBalance = Number(profile?.wallet_balance) || 0
      const newBalance = Number((currentBalance + amountPaid).toFixed(2))

      // 4. Update wallet
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user_id)

      if (updateError) {
        console.error('Supabase update error:', updateError)
        return fail(`Failed to update wallet: ${updateError.message}`)
      }

      // 5. Log transaction WITH the reference so we can dedupe next time
      const { error: txError } = await supabase.from('transactions').insert({
        user_id,
        type: 'load_wallet',
        amount: amountPaid,
        credits_added: 0,
        status: 'completed',
        reference, // add this column in Supabase (unique index recommended)
      })

      if (txError) {
        // If this fails due to unique constraint, the payment was already credited.
        console.error('Transaction log error:', txError)
      }
    } else {
      // Unknown purpose — don't silently succeed
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