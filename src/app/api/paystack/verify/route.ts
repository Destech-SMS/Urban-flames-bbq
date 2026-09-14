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

    if (purpose === 'wallet_load') {
      // 2. Log the transaction FIRST — this is our lock against double-processing
      const { error: txError } = await supabase.from('transactions').insert({
        user_id,
        type: 'load_wallet',
        amount: amountPaid,
        credits_added: 0,
        status: 'completed',
        reference,
      })

      // If insert fails due to unique violation, the webhook already processed it
      if (txError) {
        if (txError.code === '23505') {
          console.log('Verify: Transaction already logged (webhook won the race)')
          return NextResponse.redirect(
            `${redirectBase}?success=${encodeURIComponent('Payment already processed')}`
          )
        }
        console.error('Verify: Transaction log error:', txError)
        return fail(`Failed to log transaction: ${txError.message}`)
      }

      // 3. Only NOW update the wallet (transaction insert succeeded = we own this payment)
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user_id)
        .maybeSingle()

      if (fetchError || !profile) {
        console.error('Verify: Profile not found for user', user_id)
        return fail('User profile not found')
      }

      const currentBalance = Number(profile.wallet_balance) || 0
      const newBalance = Number((currentBalance + amountPaid).toFixed(2))

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user_id)

      if (updateError) {
        console.error('Verify: Wallet update error:', updateError)
        return fail(`Failed to update wallet: ${updateError.message}`)
      }

      console.log(`Verify: Credited ${amountPaid} to user ${user_id}. New balance: ${newBalance}`)
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