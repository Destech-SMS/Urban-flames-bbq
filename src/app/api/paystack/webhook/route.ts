// app/api/paystack/webhook/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    // 1. Verify the webhook is actually from Paystack (SECURITY)
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY

    if (!signature || !paystackSecret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 401 })
    }

    const hash = crypto
      .createHmac('sha512', paystackSecret)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.error('Invalid Paystack signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { event, data } = JSON.parse(body)

    if (event !== 'charge.success') {
      return NextResponse.json({ success: true, message: 'Event ignored' })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server config missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const metadata = data.metadata || {}
    const user_id = metadata.user_id
    const purpose = metadata.purpose || 'wallet_load'
    const reference = data.reference
    const amountPaid = Number(data.amount) / 100

    console.log('Webhook received payment:', { user_id, purpose, reference, amountPaid })

    if (!user_id) {
      console.error('Webhook: Missing user_id in metadata')
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    // Idempotency check
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .maybeSingle()

    if (existing) {
      console.log('Webhook: Transaction already processed:', reference)
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    if (purpose === 'wallet_load') {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user_id)
        .maybeSingle()

      if (fetchError) {
        console.error('Webhook: Profile fetch error:', fetchError)
        return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 })
      }

      if (!profile) {
        console.error(`Webhook: NO PROFILE FOUND for user_id: ${user_id}`)
        
        await supabase.from('transactions').insert({
          user_id: user_id,
          type: 'load_wallet',
          amount: amountPaid,
          credits_added: 0,
          status: 'failed',
          reference: reference,
        })

        return NextResponse.json({ 
          success: false, 
          message: 'Payment received but user profile not found. Logged for manual review.' 
        })
      }

      const currentBalance = Number(profile.wallet_balance) || 0
      const newBalance = Number((currentBalance + amountPaid).toFixed(2))

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user_id)

      if (updateError) {
        console.error('Webhook: Failed to update wallet:', updateError)
        return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 })
      }

      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user_id,
          type: 'load_wallet',
          amount: amountPaid,
          credits_added: 0,
          status: 'completed',
          reference: reference,
        })

      if (txError) {
        console.error('Webhook: Failed to log transaction:', txError)
      }

      console.log(`Webhook: Successfully credited ${amountPaid} to user ${user_id}. New balance: ${newBalance}`)
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook failed' },
      { status: 500 }
    )
  }
}