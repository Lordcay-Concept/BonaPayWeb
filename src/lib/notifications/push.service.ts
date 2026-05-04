import { getSupabaseClient } from '@/lib/supabase/client'

export interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

export class PushNotificationService {
  private supabase = getSupabaseClient()
  private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  private vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

  /**
   * Subscribe user to push notifications
   */
  async subscribe(
    userId: string,
    subscription: PushSubscription
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('push_subscriptions')
        .insert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Unsubscribe user from push notifications
   */
  async unsubscribe(
    userId: string,
    endpoint: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Send push notification to a specific user
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    const { data: subscriptions } = await this.supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    for (const sub of subscriptions || []) {
      await this.sendPush(sub, { title, body, data })
    }
  }

  /**
   * Send push notification to all users
   */
  async sendToAll(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    const { data: subscriptions } = await this.supabase
      .from('push_subscriptions')
      .select('*')

    for (const sub of subscriptions || []) {
      await this.sendPush(sub, { title, body, data })
    }
  }

  /**
   * Send actual push notification
   */
  private async sendPush(
    subscription: PushSubscription,
    payload: { title: string; body: string; data?: any }
  ): Promise<void> {
    
    const supabase = getSupabaseClient()
    await supabase
      .from('notifications')
      .insert({
        user_id: subscription.user_id,
        title: payload.title,
        message: payload.body,
        type: 'system',
        metadata: payload.data,
      })
  }
}

export const pushService = new PushNotificationService()