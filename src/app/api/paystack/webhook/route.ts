// app/api/paystack/webhook/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, data } = body

    // Verify webhook signature (implement your own verification)
    // const signature = request.headers.get('x-paystack-signature')
    // verifySignature(signature, body)

    if (event === 'charge.success') {
      const supabase = await createClient()
      const { user_id, purpose, amount } = data.metadata

      if (purpose === 'wallet_load') {
        // First, get current balance
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', user_id)
          .single()

        if (fetchError) {
          console.error('Failed to fetch wallet balance:', fetchError)
          return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 })
        }

        const currentBalance = profile?.wallet_balance || 0
        const newBalance = currentBalance + amount

        // Credit the user's wallet
        const { error } = await supabase
          .from('profiles')
          .update({ 
            wallet_balance: newBalance
          })
          .eq('id', user_id)

        if (error) {
          console.error('Failed to update wallet:', error)
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