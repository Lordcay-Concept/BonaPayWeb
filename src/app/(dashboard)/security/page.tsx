'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getSupabaseClient } from '@/lib/supabase/client'
import { authService } from '@/lib/auth/auth.service'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Smartphone, Key, Copy, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function SecurityPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [setupData, setSetupData] = useState<any>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  const fetchUserAndProfile = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(profile)
    setTwoFactorEnabled(profile?.two_factor_enabled || false)
  }

  const handleSetup2FA = async () => {
    setLoading(true)
    try {
      const result = await authService.setupTwoFactor(user.id)
      if (result) {
        setSetupData(result)
        setShowSetup(true)
      } else {
        toast.error('Failed to setup 2FA')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    if (!verificationCode) {
      toast.error('Please enter verification code')
      return
    }

    setLoading(true)
    try {
      const result = await authService.enableTwoFactor(user.id, verificationCode)
      if (result.success) {
        toast.success('2FA enabled successfully!')
        setTwoFactorEnabled(true)
        setShowSetup(false)
        setRecoveryCodes(setupData?.recoveryCodes || [])
        setShowRecoveryCodes(true)
      } else {
        toast.error(result.error || 'Invalid verification code')
      }
    } catch (error) {
      toast.error('Failed to enable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('profiles')
        .update({ 
          two_factor_enabled: false,
          two_factor_secret: null,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('2FA disabled successfully')
      setTwoFactorEnabled(false)
    } catch (error) {
      toast.error('Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      toast.success('Password changed successfully!')
      setShowChangePassword(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your account security and authentication methods
          </p>
        </div>

        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="devices">Devices & Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="authentication" className="space-y-6">
            {/* Two-Factor Authentication Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>
                        Add an extra layer of security to your account
                      </CardDescription>
                    </div>
                  </div>
                  <div>
                    {twoFactorEnabled ? (
                      <Button variant="outline" onClick={handleDisable2FA} disabled={loading}>
                        Disable 2FA
                      </Button>
                    ) : (
                      <Button onClick={handleSetup2FA} disabled={loading}>
                        Enable 2FA
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${twoFactorEnabled ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className="text-sm">
                      {twoFactorEnabled ? '2FA is enabled' : '2FA is disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {twoFactorEnabled
                      ? 'Your account is protected with two-factor authentication.'
                      : 'Protect your account with an additional verification step using Google Authenticator or Authy.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>
                        Change your account password
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setShowChangePassword(!showChangePassword)}>
                    Change Password
                  </Button>
                </div>
              </CardHeader>
              {showChangePassword && (
                <CardContent className="border-t pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleChangePassword} disabled={loading}>
                        Update Password
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowChangePassword(false)
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Active Sessions Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>
                      Manage devices where you're logged in
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-xs text-slate-500">Chrome on Windows • {new Date().toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs text-green-600">Current</span>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    Log Out All Other Devices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>Trusted Devices</CardTitle>
                <CardDescription>
                  Devices that have been trusted to bypass 2FA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No trusted devices</p>
                  <p className="text-sm">When you sign in with 2FA, you can trust the device for 30 days.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 2FA Setup Dialog */}
        <Dialog open={showSetup} onOpenChange={setShowSetup}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code with Google Authenticator or Authy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {setupData && (
                <>
                  <div className="flex justify-center">
                    <img
                      src={setupData.qrCode}
                      alt="2FA QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-xs font-mono text-center break-all">
                      {setupData.secret}
                    </p>
                    <button
                      onClick={() => copyToClipboard(setupData.secret)}
                      className="flex items-center justify-center gap-1 w-full mt-2 text-xs text-blue-600"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied!' : 'Copy secret key'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSetup(false)}>
                Cancel
              </Button>
              <Button onClick={handleEnable2FA} disabled={loading}>
                Verify & Enable
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recovery Codes Dialog */}
        <Dialog open={showRecoveryCodes} onOpenChange={setShowRecoveryCodes}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Recovery Codes</DialogTitle>
              <DialogDescription>
                Save these recovery codes in a safe place. Each code can be used once.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, index) => (
                  <code key={index} className="text-sm font-mono">{code}</code>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  copyToClipboard(recoveryCodes.join('\n'))
                  setShowRecoveryCodes(false)
                }}
              >
                I've Saved These Codes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}