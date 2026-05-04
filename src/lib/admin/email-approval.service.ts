import { getSupabaseClient } from '@/lib/supabase/client'

export class EmailApprovalService {
  private supabase = getSupabaseClient()

  /**
   * Check if email is approved for web signup
   */
  async isEmailApproved(email: string): Promise<boolean> {
    try {
      console.log('Checking email:', email)
      
      const { data, error } = await this.supabase
        .from('approved_emails')
        .select('id, email, status')
        .eq('email', email.toLowerCase())
        .maybeSingle()

      console.log('Query result:', { data, error })

      if (error) {
        console.error('Error checking email:', error)
        return false
      }

      const isApproved = !!data
      console.log('Is approved:', isApproved)
      
      return isApproved
    } catch (error) {
      console.error('Error checking email approval:', error)
      return false
    }
  }

  /**
   * Get all approved emails (Admin only)
   */
  async getApprovedEmails() {
    const { data, error } = await this.supabase
      .from('approved_emails')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching approved emails:', error)
      return []
    }
    return data || []
  }

  /**
   * Add email to approved list (Admin only)
   */
  async addApprovedEmail(email: string, adminUserId: string) {
    const { data, error } = await this.supabase
      .from('approved_emails')
      .insert({
        email: email.toLowerCase(),
        status: 'approved',
        created_by: adminUserId,
        approved_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete approved email (Admin only)
   */
  async deleteApprovedEmail(id: string) {
    const { error } = await this.supabase
      .from('approved_emails')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}

export const emailApprovalService = new EmailApprovalService()