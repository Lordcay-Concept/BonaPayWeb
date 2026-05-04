'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, DollarSign, Bell, Shield, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemSettings {
  // Fee Settings
  transfer_fee_percentage: number
  transfer_fee_fixed: number
  bill_payment_fee: number
  airtime_fee: number
  withdrawal_fee: number
  // Limit Settings
  daily_transfer_limit: number
  weekly_transfer_limit: number
  monthly_transfer_limit: number
  daily_withdrawal_limit: number
  // Notification Settings
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  // Security Settings
  session_timeout_minutes: number
  max_login_attempts: number
  two_factor_required: boolean
  // Announcement
  announcement: string
  announcement_active: boolean
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SystemSettings>({
    // Fee Settings
    transfer_fee_percentage: 0.5,
    transfer_fee_fixed: 0,
    bill_payment_fee: 0,
    airtime_fee: 0,
    withdrawal_fee: 0,
    // Limit Settings
    daily_transfer_limit: 1000000,
    weekly_transfer_limit: 5000000,
    monthly_transfer_limit: 20000000,
    daily_withdrawal_limit: 500000,
    // Notification Settings
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    // Security Settings
    session_timeout_minutes: 30,
    max_login_attempts: 5,
    two_factor_required: false,
    // Announcement
    announcement: '',
    announcement_active: false,
  })

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, tier')
        .eq('id', user.id)
        .single()

      if (profile?.is_admin !== true && profile?.tier !== 3) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      await fetchSettings()
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single()

      if (data) {
        setSettings(data as SystemSettings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const saveSettings = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          id: 1,
          ...settings,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  const publishAnnouncement = async () => {
    const supabase = getSupabaseClient()
    
    try {
      // Get all users
      const { data: users } = await supabase
        .from('profiles')
        .select('id')

      // Create announcement notifications
      const notifications = users?.map(user => ({
        user_id: user.id,
        title: 'System Announcement',
        message: settings.announcement,
        type: 'system',
      })) || []

      if (notifications.length > 0) {
        await supabase
          .from('notifications')
          .insert(notifications)
      }

      toast.success('Announcement published to all users')
    } catch (error) {
      toast.error('Failed to publish announcement')
    }
  }

  if (!isAdmin) return null

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Configure fees, limits, and system preferences
          </p>
        </div>

        <Tabs defaultValue="fees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fees">Fees & Limits</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          {/* Fees & Limits Tab */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Transaction Fees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Transfer Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.transfer_fee_percentage}
                      onChange={(e) => setSettings({ ...settings, transfer_fee_percentage: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Transfer Fee (Fixed)</Label>
                    <Input
                      type="number"
                      value={settings.transfer_fee_fixed}
                      onChange={(e) => setSettings({ ...settings, transfer_fee_fixed: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bill Payment Fee</Label>
                    <Input
                      type="number"
                      value={settings.bill_payment_fee}
                      onChange={(e) => setSettings({ ...settings, bill_payment_fee: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Airtime Fee</Label>
                    <Input
                      type="number"
                      value={settings.airtime_fee}
                      onChange={(e) => setSettings({ ...settings, airtime_fee: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <CardTitle className="text-lg mb-4">Spending Limits</CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Daily Transfer Limit (₦)</Label>
                      <Input
                        type="number"
                        value={settings.daily_transfer_limit}
                        onChange={(e) => setSettings({ ...settings, daily_transfer_limit: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weekly Transfer Limit (₦)</Label>
                      <Input
                        type="number"
                        value={settings.weekly_transfer_limit}
                        onChange={(e) => setSettings({ ...settings, weekly_transfer_limit: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Transfer Limit (₦)</Label>
                      <Input
                        type="number"
                        value={settings.monthly_transfer_limit}
                        onChange={(e) => setSettings({ ...settings, monthly_transfer_limit: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-500">Send transaction alerts via email</p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked: boolean) => setSettings({ ...settings, email_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium">SMS Alerts</p>
                    <p className="text-sm text-slate-500">Send critical alerts via SMS</p>
                  </div>
                  <Switch
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked: boolean) => setSettings({ ...settings, sms_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-slate-500">Real-time mobile notifications</p>
                  </div>
                  <Switch
                    checked={settings.push_notifications}
                    onCheckedChange={(checked: boolean) => setSettings({ ...settings, push_notifications: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.session_timeout_minutes}
                    onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-slate-500">Users will be logged out after this period of inactivity</p>
                </div>

                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={settings.max_login_attempts}
                    onChange={(e) => setSettings({ ...settings, max_login_attempts: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium">Require 2FA</p>
                    <p className="text-sm text-slate-500">Force two-factor authentication for all users</p>
                  </div>
                  <Switch
                    checked={settings.two_factor_required}
                    onCheckedChange={(checked: boolean) => setSettings({ ...settings, two_factor_required: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  System Announcements
                </CardTitle>
                <CardDescription>
                  Send important updates to all users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Announcement Message</Label>
                  <textarea
                    className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Enter announcement message..."
                    value={settings.announcement}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                  />
                </div>

                <Button onClick={publishAnnouncement} className="w-full">
                  Publish Announcement
                </Button>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <Bell className="h-4 w-4 inline mr-2" />
                    This announcement will be sent to all users as a notification.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={saveSettings} size="lg">
            Save All Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}