// app/api/paystack/webhook/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, data } = body

    if (event === 'charge.success') {
      const supabase = await createClient()
      const { user_id, purpose, amount } = data.metadata

      // Update this to match your credit purchase purpose
      if (purpose === 'credits_purchase') {
        // First, get current credits (replace 'credits' with your actual column name if different)
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('credits') 
          .eq('id', user_id)
          .single()

        if (fetchError) {
          console.error('Failed to fetch user profile:', fetchError)
          return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
        }

        const currentCredits = profile?.credits || 0
        const creditsToAdd = amount // Adjust this formula if amount is in cash currency and needs conversion to credits
        const newCredits = currentCredits + creditsToAdd

        // Credit the user's account
        const { error } = await supabase
          .from('profiles')
          .update({ 
            credits: newCredits
          })
          .eq('id', user_id)

        if (error) {
          console.error('Failed to update credits:', error)
          return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
        }

        // Log transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: user_id,
            type: 'credits_purchase',
            amount: amount,
            credits_added: creditsToAdd, // Log the actual credits added here
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