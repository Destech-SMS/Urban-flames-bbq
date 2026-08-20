// lib/sms/mnotify.ts
interface MNotifyResponse {
  status: string
  code: string
  message: string
  summary?: {
    _id: string
    type: string
    total_sent: number
    contacts: number
    total_rejected: number
    numbers_sent: string[]
    credit_used: number
    credit_left: number
  }
}

interface BalanceResponse {
  status: string
  balance: number
  bonus: number
}

export class MNotifyGateway {
  private apiKey: string
  private apiUrl: string
  private senderId: string

  constructor() {
    this.apiKey = process.env.MNOTIFY_API_KEY || ''
    this.apiUrl = 'https://api.mnotify.com/api/sms/quick'
    this.senderId = process.env.MNOTIFY_SENDER_ID || 'DestTech'
  }

  async sendSms(recipients: string[], message: string): Promise<MNotifyResponse> {
    try {
      // Format recipients to Ghana format (remove leading 0, add 233)
      const formattedRecipients = recipients.map((phone: string) => this.formatPhoneNumber(phone))

      const payload = {
        recipient: formattedRecipients,
        sender: this.senderId,
        message: message,
        is_schedule: false,
        schedule_date: ''
      }

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data: MNotifyResponse = await response.json()

      if (data.code === '2000') {
        return data
      } else {
        throw new Error(data.message || 'Failed to send SMS')
      }
    } catch (error) {
      console.error('MNotify error:', error)
      throw error
    }
  }

  async checkBalance(): Promise<{ balance: number; bonus: number }> {
    try {
      const response = await fetch(
        `https://api.mnotify.com/api/balance/sms?key=${this.apiKey}`,
        {
          method: 'GET',
        }
      )

      const data: BalanceResponse = await response.json()
      
      if (data.status === 'success') {
        return {
          balance: data.balance || 0,
          bonus: data.bonus || 0
        }
      } else {
        throw new Error('Failed to check balance')
      }
    } catch (error) {
      console.error('Balance check error:', error)
      return { balance: 0, bonus: 0 }
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '')
    
    // If starts with 0, remove it and add 233
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1)
      cleaned = '233' + cleaned
    }
    
    // If doesn't start with 233, add it
    if (!cleaned.startsWith('233')) {
      cleaned = '233' + cleaned
    }

    return cleaned
  }
}