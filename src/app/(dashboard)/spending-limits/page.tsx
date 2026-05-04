'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, TrendingUp, TrendingDown, Wallet, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface SpendingLimits {
  daily_limit: number
  weekly_limit: number
  monthly_limit: number
  daily_spent: number
  weekly_spent: number
  monthly_spent: number
}

export default function SpendingLimitsPage() {
  const router = useRouter()
  const [limits, setLimits] = useState<SpendingLimits>({
    daily_limit: 1000000,
    weekly_limit: 5000000,
    monthly_limit: 20000000,
    daily_spent: 0,
    weekly_spent: 0,
    monthly_spent: 0,
  })
  const [editing, setEditing] = useState(false)
  const [newLimits, setNewLimits] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLimits()
  }, [])

  const fetchLimits = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Get user's account with limits
    const { data: account, error } = await supabase
      .from('accounts')
      .select('daily_transaction_limit, weekly_transaction_limit, monthly_transaction_limit, daily_spent, weekly_spent, monthly_spent')
      .eq('user_id', user.id)
      .single()

    if (account) {
      setLimits({
        daily_limit: account.daily_transaction_limit,
        weekly_limit: account.weekly_transaction_limit,
        monthly_limit: account.monthly_transaction_limit,
        daily_spent: account.daily_spent || 0,
        weekly_spent: account.weekly_spent || 0,
        monthly_spent: account.monthly_spent || 0,
      })
      setNewLimits({
        daily: account.daily_transaction_limit,
        weekly: account.weekly_transaction_limit,
        monthly: account.monthly_transaction_limit,
      })
    }
    setLoading(false)
  }

  const updateLimits = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('accounts')
      .update({
        daily_transaction_limit: newLimits.daily,
        weekly_transaction_limit: newLimits.weekly,
        monthly_transaction_limit: newLimits.monthly,
      })
      .eq('user_id', user.id)

    if (error) {
      toast.error('Failed to update limits')
    } else {
      toast.success('Spending limits updated')
      setEditing(false)
      fetchLimits()
    }
  }

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

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
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Spending Limits</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Control your spending with daily, weekly, and monthly limits
          </p>
        </div>

        {/* Daily Limit */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Daily Limit
                </CardTitle>
                <CardDescription>Reset every day at midnight</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Spent today</p>
                <p className="text-lg font-bold">{formatCurrency(limits.daily_spent)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Limit: {formatCurrency(limits.daily_limit)}</span>
              <span className={limits.daily_spent > limits.daily_limit ? 'text-red-600' : ''}>
                {((limits.daily_spent / limits.daily_limit) * 100).toFixed(1)}% used
              </span>
            </div>
            <Progress 
              value={(limits.daily_spent / limits.daily_limit) * 100} 
              className={`h-2 ${getProgressColor(limits.daily_spent, limits.daily_limit)}`}
            />
            {limits.daily_spent > limits.daily_limit && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  You've exceeded your daily limit by {formatCurrency(limits.daily_spent - limits.daily_limit)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Limit */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weekly Limit
                </CardTitle>
                <CardDescription>Reset every Monday at midnight</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Spent this week</p>
                <p className="text-lg font-bold">{formatCurrency(limits.weekly_spent)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Limit: {formatCurrency(limits.weekly_limit)}</span>
              <span>{((limits.weekly_spent / limits.weekly_limit) * 100).toFixed(1)}% used</span>
            </div>
            <Progress 
              value={(limits.weekly_spent / limits.weekly_limit) * 100} 
              className={`h-2 ${getProgressColor(limits.weekly_spent, limits.weekly_limit)}`}
            />
          </CardContent>
        </Card>

        {/* Monthly Limit */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Monthly Limit
                </CardTitle>
                <CardDescription>Reset on the first day of each month</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Spent this month</p>
                <p className="text-lg font-bold">{formatCurrency(limits.monthly_spent)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Limit: {formatCurrency(limits.monthly_limit)}</span>
              <span>{((limits.monthly_spent / limits.monthly_limit) * 100).toFixed(1)}% used</span>
            </div>
            <Progress 
              value={(limits.monthly_spent / limits.monthly_limit) * 100} 
              className={`h-2 ${getProgressColor(limits.monthly_spent, limits.monthly_limit)}`}
            />
          </CardContent>
        </Card>

        {/* Edit Limits Card */}
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Limits</CardTitle>
            <CardDescription>Set limits that work for your budget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!editing ? (
              <Button onClick={() => setEditing(true)} className="w-full">
                Edit Limits
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Daily Limit (₦)</Label>
                  <Input
                    type="number"
                    value={newLimits.daily}
                    onChange={(e) => setNewLimits({ ...newLimits, daily: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weekly Limit (₦)</Label>
                  <Input
                    type="number"
                    value={newLimits.weekly}
                    onChange={(e) => setNewLimits({ ...newLimits, weekly: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Limit (₦)</Label>
                  <Input
                    type="number"
                    value={newLimits.monthly}
                    onChange={(e) => setNewLimits({ ...newLimits, monthly: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={updateLimits} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}