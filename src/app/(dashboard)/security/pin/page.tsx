'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { pinService } from '@/lib/security/pin.service'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Key, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TransactionPinPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [step, setStep] = useState<'setup' | 'change' | 'disable'>('setup')
  const [pinData, setPinData] = useState({
    newPin: '',
    confirmPin: '',
    currentPin: '',
  })

  const handleSetupPin = async () => {
    if (pinData.newPin !== pinData.confirmPin) {
      toast.error('PINs do not match')
      return
    }

    if (!/^\d{4}$/.test(pinData.newPin)) {
      toast.error('PIN must be 4 digits')
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setLoading(true)
    try {
      const result = await pinService.setTransactionPin(
        user.id,
        pinData.newPin,
        pinData.confirmPin
      )
      if (result.success) {
        toast.success('Transaction PIN set successfully')
        router.push('/security')
      } else {
        toast.error(result.error || 'Failed to set PIN')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Transaction PIN</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Add an extra layer of security for your transactions
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Set Transaction PIN</CardTitle>
                <CardDescription>
                  You'll be asked for this PIN when sending money
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPin">4-Digit PIN</Label>
              <div className="relative">
                <Input
                  id="newPin"
                  type={showPin ? 'text' : 'password'}
                  placeholder="****"
                  maxLength={4}
                  value={pinData.newPin}
                  onChange={(e) => setPinData({ ...pinData, newPin: e.target.value })}
                  className="pr-10 text-center text-2xl tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <Input
                id="confirmPin"
                type={showPin ? 'text' : 'password'}
                placeholder="****"
                maxLength={4}
                value={pinData.confirmPin}
                onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value })}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button
              onClick={handleSetupPin}
              disabled={loading || !pinData.newPin || !pinData.confirmPin}
              className="w-full"
            >
              {loading ? 'Setting PIN...' : 'Set Transaction PIN'}
            </Button>

            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-500">
                <Shield className="h-3 w-3 inline mr-1" />
                Your PIN is securely encrypted. Never share it with anyone. BonaPay will never ask for your PIN.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}