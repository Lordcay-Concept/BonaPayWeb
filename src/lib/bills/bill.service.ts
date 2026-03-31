import { getSupabaseClient } from '@/lib/supabase/client'
import { generateTransactionReference } from '@/lib/utils'

export interface BillCategory {
  id: string
  name: string
  code: string
  icon: string
}

export interface ElectricityBill {
  meterNumber: string
  meterType: 'prepaid' | 'postpaid'
  amount: number
  provider: string
}

export interface AirtimeBill {
  phoneNumber: string
  amount: number
  network: 'mtn' | 'glo' | 'airtel' | '9mobile'
}

export interface DataBill {
  phoneNumber: string
  dataPlan: string
  amount: number
  network: 'mtn' | 'glo' | 'airtel' | '9mobile'
}

export interface CableTVBill {
  smartCardNumber: string
  package: string
  amount: number
  provider: 'dstv' | 'gotv' | 'startimes'
}

export class BillService {
  private supabase = getSupabaseClient()

  /**
   * Get all bill categories
   */
  async getBillCategories(): Promise<BillCategory[]> {
    const { data, error } = await this.supabase
      .from('bill_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Get categories error:', error)
      return []
    }

    return data || []
  }

  /**
   * Pay electricity bill
   */
  async payElectricity(userId: string, bill: ElectricityBill): Promise<{ success: boolean; reference?: string; error?: string }> {
    try {
      // Check user balance
      const { data: account, error: accountError } = await this.supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (accountError || !account) {
        return { success: false, error: 'Account not found' }
      }

      if (account.balance < bill.amount) {
        return { success: false, error: 'Insufficient funds' }
      }

      const reference = generateTransactionReference()

      // Deduct from balance
      const newBalance = account.balance - bill.amount
      const { error: updateError } = await this.supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Create transaction record
      const { error: transactionError } = await this.supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'debit',
          category: 'bill_payment',
          amount: bill.amount,
          description: `Electricity Bill Payment - ${bill.provider}`,
          reference: reference,
          metadata: {
            bill_type: 'electricity',
            meter_number: bill.meterNumber,
            meter_type: bill.meterType,
            provider: bill.provider,
          },
          status: 'completed',
        })

      if (transactionError) throw transactionError

      // Create bill payment record
      await this.supabase
        .from('bill_payments')
        .insert({
          user_id: userId,
          biller_name: `${bill.provider} Electricity`,
          biller_code: 'elec',
          customer_id: bill.meterNumber,
          customer_name: 'Customer',
          amount: bill.amount,
          reference: reference,
          status: 'completed',
          metadata: { meter_type: bill.meterType },
        })

      // Create notification
      await this.createBillNotification(userId, 'Electricity', bill.amount, reference)

      return { success: true, reference }
    } catch (error: any) {
      console.error('Electricity payment error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Buy airtime
   */
  async buyAirtime(userId: string, bill: AirtimeBill): Promise<{ success: boolean; reference?: string; error?: string }> {
    try {
      // Check user balance
      const { data: account, error: accountError } = await this.supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (accountError || !account) {
        return { success: false, error: 'Account not found' }
      }

      if (account.balance < bill.amount) {
        return { success: false, error: 'Insufficient funds' }
      }

      const reference = generateTransactionReference()

      // Deduct from balance
      const newBalance = account.balance - bill.amount
      const { error: updateError } = await this.supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Create transaction record
      const { error: transactionError } = await this.supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'debit',
          category: 'airtime',
          amount: bill.amount,
          description: `Airtime Purchase - ${bill.network.toUpperCase()}`,
          reference: reference,
          metadata: {
            phone_number: bill.phoneNumber,
            network: bill.network,
          },
          status: 'completed',
        })

      if (transactionError) throw transactionError

      // Create bill payment record
      await this.supabase
        .from('bill_payments')
        .insert({
          user_id: userId,
          biller_name: `${bill.network.toUpperCase()} Airtime`,
          biller_code: 'airtime',
          customer_id: bill.phoneNumber,
          customer_name: 'Customer',
          amount: bill.amount,
          reference: reference,
          status: 'completed',
        })

      // Create notification
      await this.createBillNotification(userId, 'Airtime', bill.amount, reference)

      return { success: true, reference }
    } catch (error: any) {
      console.error('Airtime purchase error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Buy data
   */
  async buyData(userId: string, bill: DataBill): Promise<{ success: boolean; reference?: string; error?: string }> {
    try {
      // Check user balance
      const { data: account, error: accountError } = await this.supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (accountError || !account) {
        return { success: false, error: 'Account not found' }
      }

      if (account.balance < bill.amount) {
        return { success: false, error: 'Insufficient funds' }
      }

      const reference = generateTransactionReference()

      // Deduct from balance
      const newBalance = account.balance - bill.amount
      const { error: updateError } = await this.supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Create transaction record
      const { error: transactionError } = await this.supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'debit',
          category: 'data',
          amount: bill.amount,
          description: `Data Purchase - ${bill.dataPlan}`,
          reference: reference,
          metadata: {
            phone_number: bill.phoneNumber,
            network: bill.network,
            data_plan: bill.dataPlan,
          },
          status: 'completed',
        })

      if (transactionError) throw transactionError

      // Create bill payment record
      await this.supabase
        .from('bill_payments')
        .insert({
          user_id: userId,
          biller_name: `${bill.network.toUpperCase()} Data`,
          biller_code: 'data',
          customer_id: bill.phoneNumber,
          customer_name: 'Customer',
          amount: bill.amount,
          reference: reference,
          status: 'completed',
        })

      // Create notification
      await this.createBillNotification(userId, 'Data', bill.amount, reference)

      return { success: true, reference }
    } catch (error: any) {
      console.error('Data purchase error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Pay cable TV
   */
  async payCableTV(userId: string, bill: CableTVBill): Promise<{ success: boolean; reference?: string; error?: string }> {
    try {
      // Check user balance
      const { data: account, error: accountError } = await this.supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (accountError || !account) {
        return { success: false, error: 'Account not found' }
      }

      if (account.balance < bill.amount) {
        return { success: false, error: 'Insufficient funds' }
      }

      const reference = generateTransactionReference()

      // Deduct from balance
      const newBalance = account.balance - bill.amount
      const { error: updateError } = await this.supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Create transaction record
      const { error: transactionError } = await this.supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'debit',
          category: 'cable_tv',
          amount: bill.amount,
          description: `Cable TV Subscription - ${bill.provider.toUpperCase()}`,
          reference: reference,
          metadata: {
            smart_card_number: bill.smartCardNumber,
            package: bill.package,
            provider: bill.provider,
          },
          status: 'completed',
        })

      if (transactionError) throw transactionError

      // Create bill payment record
      await this.supabase
        .from('bill_payments')
        .insert({
          user_id: userId,
          biller_name: `${bill.provider.toUpperCase()} Cable TV`,
          biller_code: 'cable',
          customer_id: bill.smartCardNumber,
          customer_name: 'Customer',
          amount: bill.amount,
          reference: reference,
          status: 'completed',
        })

      // Create notification
      await this.createBillNotification(userId, 'Cable TV', bill.amount, reference)

      return { success: true, reference }
    } catch (error: any) {
      console.error('Cable TV payment error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Verify electricity meter
   */
  async verifyElectricityMeter(meterNumber: string, provider: string): Promise<{ success: boolean; customerName?: string; error?: string }> {
    // Mock verification - in production, integrate with actual API
    return {
      success: true,
      customerName: `Customer ${meterNumber.slice(-4)}`,
    }
  }

  /**
   * Verify smart card
   */
  async verifySmartCard(smartCardNumber: string, provider: string): Promise<{ success: boolean; customerName?: string; error?: string }> {
    // Mock verification - in production, integrate with actual API
    return {
      success: true,
      customerName: `Customer ${smartCardNumber.slice(-4)}`,
    }
  }

  /**
   * Create notification for bill payment
   */
  private async createBillNotification(userId: string, billType: string, amount: number, reference: string) {
    await this.supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: `${billType} Payment Successful`,
        message: `Your ${billType} payment of ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)} was successful. Reference: ${reference}`,
        type: 'transaction',
        metadata: { bill_type: billType, amount, reference },
      })
  }
}

export const billService = new BillService()