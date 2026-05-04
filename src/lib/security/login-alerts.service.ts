import { getSupabaseClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js';

export interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  location?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser?: string;
  os?: string;
}

export class LoginAlertsService {
  private supabase = getSupabaseClient()

  /**
   * Generate device fingerprint from request data
   */
  generateDeviceFingerprint(deviceInfo: DeviceInfo): string {
    const fingerprintData = `${deviceInfo.userAgent}|${deviceInfo.ipAddress}`;

    let hash = 0;
    for (let i = 0; i < fingerprintData.length; i++) {
      const char = fingerprintData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Parse user agent to get device details
   */
  parseUserAgent(userAgent: string): Partial<DeviceInfo> {
    const ua = userAgent.toLowerCase();
    
    let deviceType: DeviceInfo['deviceType'] = 'unknown';
    if (/(mobile|android|iphone|ipod|blackberry|windows phone)/.test(ua)) {
      deviceType = 'mobile';
    } else if (/(tablet|ipad|kindle)/.test(ua)) {
      deviceType = 'tablet';
    } else if (/(windows|mac|linux|cros)/.test(ua)) {
      deviceType = 'desktop';
    }

    let browser = 'unknown';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';

    let os = 'unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone')) os = 'iOS';

    return { deviceType, browser, os };
  }

  /**
   * Check if device is known for the user
   */
  async isKnownDevice(userId: string, fingerprint: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_devices')
      .select('id')
      .eq('user_id', userId)
      .eq('device_fingerprint', fingerprint)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking known device:', error);
    }

    return !!data;
  }

  /**
   * Register a new device for the user
   */
  async registerDevice(
    userId: string,
    fingerprint: string,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    const { error } = await this.supabase
      .from('user_devices')
      .insert({
        user_id: userId,
        device_fingerprint: fingerprint,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ip_address: deviceInfo.ipAddress,
        location: deviceInfo.location,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        is_trusted: false,
      });

    if (error) {
      console.error('Error registering device:', error);
      throw new Error('Failed to register device');
    }
  }

  /**
   * Update last seen timestamp for device
   */
  async updateDeviceLastSeen(userId: string, fingerprint: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_devices')
      .update({ last_seen: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('device_fingerprint', fingerprint);

    if (error) {
      console.error('Error updating device last seen:', error);
    }
  }

  /**
 * Send login alert notification
 */
async sendLoginAlert(
  userId: string,
  deviceInfo: DeviceInfo,
  alertType: 'new_device' | 'suspicious_location' | 'unusual_time'
): Promise<void> {

  const { data: user } = await this.supabase
    .from('profiles')
    .select('email, phone')
    .eq('id', userId)
    .single();

  if (!user) return;

  const alertMessage = this.generateAlertMessage(deviceInfo, alertType);
  
  const { error: notifError } = await this.supabase.from('notifications').insert({
    user_id: userId,
    type: 'login_alert',
    title: 'New Login Detected',
    message: alertMessage,
    metadata: {
      device_info: deviceInfo,
      alert_type: alertType,
      timestamp: new Date().toISOString(),
    },
    is_read: false,
  });

  if (notifError) {
    console.error('Error creating notification:', notifError);
  }

  await this.sendEmailAlert(user.email, alertMessage, deviceInfo);

  if (user.phone) {
    await this.sendSMSAlert(user.phone, alertMessage);
  }

  try {
    await this.supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'login_alert_sent',
      entity_type: 'security',
      metadata: {
        alert_type: alertType,
        device_info: {
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          location: deviceInfo.location,
        },
      },
      ip_address: deviceInfo.ipAddress,
      user_agent: deviceInfo.userAgent,
    });
  } catch (error) {
    console.error('Error logging audit trail:', error);
  }
}

  /**
   * Generate alert message based on alert type
   */
  private generateAlertMessage(
    deviceInfo: DeviceInfo,
    alertType: 'new_device' | 'suspicious_location' | 'unusual_time'
  ): string {
    const deviceStr = `${deviceInfo.deviceType} (${deviceInfo.browser} on ${deviceInfo.os})`;
    const locationStr = deviceInfo.location || 'Unknown location';
    
    switch (alertType) {
      case 'new_device':
        return `New login from a ${deviceStr} at ${locationStr}. If this wasn't you, please secure your account immediately.`;
      case 'suspicious_location':
        return `Suspicious login attempt from ${locationStr} on a ${deviceStr}. This location is unusual for your account.`;
      case 'unusual_time':
        return `Login detected at an unusual time (${new Date().toLocaleString()}) from ${locationStr} on a ${deviceStr}.`;
      default:
        return `New login detected from ${locationStr} on a ${deviceStr}.`;
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(email: string, message: string, deviceInfo: DeviceInfo): Promise<void> {
    console.log(`Sending email to ${email}: ${message}`);
    
   
  }

  /**
   * Send SMS alert
   */
  private async sendSMSAlert(phone: string, message: string): Promise<void> {
    console.log(`Sending SMS to ${phone}: ${message}`);
    
    
  }

  /**
   * Get user's trusted devices
   */
  async getUserDevices(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', userId)
      .order('last_seen', { ascending: false });

    if (error) {
      console.error('Error fetching user devices:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Trust a device
   */
  async trustDevice(deviceId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_devices')
      .update({ is_trusted: true })
      .eq('id', deviceId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error trusting device:', error);
      throw new Error('Failed to trust device');
    }
  }

  /**
   * Remove/revoke a device
   */
  async revokeDevice(deviceId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_devices')
      .delete()
      .eq('id', deviceId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error revoking device:', error);
      throw new Error('Failed to revoke device');
    }
  }
}

export const loginAlertsService = new LoginAlertsService();