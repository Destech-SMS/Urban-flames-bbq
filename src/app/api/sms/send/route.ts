// app/api/sms/send/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { MNotifyGateway } from '@/lib/sms/mnotify'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipients, message, group } = await request.json()

    // Validate input
    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 })
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 160) {
      return NextResponse.json({ error: 'Message exceeds 160 characters' }, { status: 400 })
    }

    // ============================================
    // STEP 1: REMOVE DUPLICATE PHONE NUMBERS
    // ============================================
    
    const recipientList: string[] = Array.isArray(recipients) ? recipients : []
    const uniqueRecipients = [...new Set(recipientList)]
    
    const duplicateCount = recipientList.length - uniqueRecipients.length
    if (duplicateCount > 0) {
      console.log(`Removed ${duplicateCount} duplicate phone number(s)`)
      console.log(`Original count: ${recipientList.length}, Unique count: ${uniqueRecipients.length}`)
    }

    // ============================================
    // STEP 2: CLEAN AND FORMAT PHONE NUMBERS
    // ============================================
    
    const cleanedRecipients = uniqueRecipients
      .map((phone: string) => {
        let cleaned = phone.replace(/\D/g, '')
        if (cleaned.startsWith('0')) {
          cleaned = cleaned.substring(1)
          cleaned = '233' + cleaned
        }
        if (!cleaned.startsWith('233')) {
          cleaned = '233' + cleaned
        }
        return cleaned
      })
      .filter((phone: string) => phone.length >= 10)
    
    if (cleanedRecipients.length === 0) {
      return NextResponse.json({ 
        error: 'No valid phone numbers after cleaning' 
      }, { status: 400 })
    }

    console.log(`After cleaning: ${cleanedRecipients.length} valid numbers`)

    // ============================================
    // STEP 3: CHECK SYSTEM CREDIT BALANCE
    // ============================================
    
    // Get user's current SMS credit balance from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('sms_credit_balance')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching credit balance:', profileError)
      return NextResponse.json({ error: 'Failed to check credit balance' }, { status: 500 })
    }

    const currentCredits = profile?.sms_credit_balance || 0
    
    // Check if user has enough credits
    if (currentCredits < cleanedRecipients.length) {
      return NextResponse.json({ 
        error: `Insufficient SMS credits. You have ${currentCredits} credits but need ${cleanedRecipients.length}.` 
      }, { status: 400 })
    }

    // ============================================
    // STEP 4: DEDUCT CREDITS FROM SYSTEM
    // ============================================
    
    const newCreditBalance = currentCredits - cleanedRecipients.length

    // Update the user's credit balance in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        sms_credit_balance: newCreditBalance
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating credit balance:', updateError)
      return NextResponse.json({ error: 'Failed to update credit balance' }, { status: 500 })
    }

    console.log(`Credits deducted: ${cleanedRecipients.length}. New balance: ${newCreditBalance}`)

    // ============================================
    // STEP 5: SEND SMS VIA MNOTIFY
    // ============================================
    
    const gateway = new MNotifyGateway()
    const result = await gateway.sendSms(cleanedRecipients, message)

    // ============================================
    // STEP 6: SAVE TO DATABASE
    // ============================================
    
    const smsLogs = cleanedRecipients.map((recipient: string) => ({
      user_id: user.id,
      recipient: recipient,
      message: message,
      status: 'sent',
      sent_at: new Date().toISOString(),
      campaign_id: result.summary?._id || null,
      group: group || 'direct'
    }))

    const { error: logError } = await supabase
      .from('sms_logs')
      .insert(smsLogs)

    if (logError) {
      console.error('Error saving SMS logs:', logError)
    }

    // ============================================
    // STEP 7: RETURN RESPONSE
    // ============================================
    
    return NextResponse.json({
      success: true,
      data: result,
      stats: {
        total: result.summary?.total_sent || 0,
        credit_used: cleanedRecipients.length,
        credit_left: newCreditBalance,
        original_count: recipientList.length,
        unique_count: cleanedRecipients.length,
        duplicates_removed: recipientList.length - cleanedRecipients.length
      },
      recipients: cleanedRecipients
    })

  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send SMS' },
      { status: 500 }
    )
  }
}