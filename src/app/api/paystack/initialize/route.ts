// app/api/paystack/initialize/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Get the REAL logged-in user from server session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get amount from frontend
    const { amount, purpose } = await request.json()

    if (!amount || amount < 0.5) {
      return NextResponse.json({ error: 'Minimum amount is GHS 0.5' }, { status: 400 })
    }

    // 3. Hardcoded email for Paystack receipt — does NOT need to match the logged-in user
    const paystackEmail = 'josepholaitan18@gmail.com'

    console.log('Initialize Paystack:', {
      user_id: user.id,
      email: paystackEmail,
      amount,
    })

    // 4. Initialize Paystack with the REAL user.id in metadata
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: paystackEmail,             // Paystack receipt email (hardcoded)
        amount: Math.round(amount * 100), // convert GHS to pesewas
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/verify`,
        metadata: {
          user_id: user.id,               // ✅ THE ONLY THING THAT MATTERS
          purpose: purpose || 'wallet_load',
        }
      }),
    })

    const data = await response.json()

    if (!data.status) {
      console.error('Paystack init failed:', data)
      return NextResponse.json({ error: data.message || 'Paystack init failed' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Initialize error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Initialization failed' },
      { status: 500 }
    )
  }
}