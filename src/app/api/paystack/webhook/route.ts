// app/api/paystack/webhook/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    // 1. Verify the webhook is actually from Paystack (SECURITY)
    const body = await request.text() // Get raw body for signature check
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

    // 2. Parse the verified body
    const { event, data } = JSON.parse(body)

    // We only care about successful charges
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
    // Use 'wallet_load' to match your verify route and DB schema
    const purpose = metadata.purpose || 'wallet_load' 
    const reference = data.reference
    const amountPaid = Number(data.amount) / 100

    if (!user_id) {
      console.error('Webhook: Missing user_id in metadata')
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    // 3. Idempotency: Check if this reference was already processed
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .maybeSingle()

    if (existing) {
      console.log('Webhook: Transaction already processed:', reference)
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // 4. Process the wallet load
    if (purpose === 'wallet_load') {
      
      // Get current wallet balance
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user_id)
        .single()

      if (fetchError) {
        console.error('Webhook: Failed to fetch profile:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
      }

      const currentBalance = Number(profile?.wallet_balance) || 0
      const newBalance = Number((currentBalance + amountPaid).toFixed(2))

      // Update wallet balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user_id)

      if (updateError) {
        console.error('Webhook: Failed to update wallet:', updateError)
        return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 })
      }

      // Log the transaction WITH the reference to prevent future double-processing
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user_id,
          type: 'load_wallet',
          amount: amountPaid,
          credits_added: 0,
          status: 'completed',
          reference: reference, // CRITICAL: This must be here
        })

      if (txError) {
        console.error('Webhook: Failed to log transaction:', txError)
        // Even if logging fails, the wallet was updated, so we return 200 to stop Paystack retries
      }

      console.log(`Webhook: Successfully added ${amountPaid} to user ${user_id}`)
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