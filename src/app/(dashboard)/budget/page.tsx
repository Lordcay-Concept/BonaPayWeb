'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { budgetService, Budget, BudgetAlert } from '@/lib/budget/budget.service'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Plus, Trash2, TrendingUp, TrendingDown, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
  'Healthcare', 'Education', 'Rent', 'Investments', 'Other'
]

const PERIODS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'yearly', label: 'Yearly' },
]

export default function BudgetPage() {
  const router = useRouter()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    notification_threshold: '80',
  })

  useEffect(() => {
    fetchBudgetData()
  }, [])

  const fetchBudgetData = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const [budgetsData, alertsData] = await Promise.all([
      budgetService.getUserBudgets(user.id),
      budgetService.getBudgetAlerts(user.id),
    ])

    setBudgets(budgetsData)
    setAlerts(alertsData)
    setLoading(false)
  }

  const handleCreateBudget = async () => {
    if (!formData.category || !formData.amount) {
      toast.error('Please fill all fields')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount < 1) {
      toast.error('Please enter a valid amount')
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    if (formData.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else if (formData.period === 'weekly') {
      const day = now.getDay()
      startDate = new Date(now)
      startDate.setDate(now.getDate() - day)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
    } else if (formData.period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear(), 11, 31)
    }

    setCreating(true)
    try {
      const result = await budgetService.createBudget(user.id, {
        category: formData.category,
        amount,
        period: formData.period as any,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        notification_threshold: parseInt(formData.notification_threshold),
        is_active: true,
      })

      if (result.success) {
        toast.success('Budget created successfully')
        setShowCreateDialog(false)
        setFormData({
          category: '',
          amount: '',
          period: 'monthly',
          notification_threshold: '80',
        })
        fetchBudgetData()
      } else {
        toast.error(result.error || 'Failed to create budget')
      }
    } catch (error) {
      toast.error('Failed to create budget')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const result = await budgetService.deleteBudget(budgetId, user.id)
    if (result.success) {
      toast.success('Budget deleted')
      fetchBudgetData()
    } else {
      toast.error(result.error || 'Failed to delete')
    }
  }

  const getStatusColor = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const remainingBudget = totalBudget - totalSpent

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Budget Planner</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track your spending and stay within budget
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Set a spending limit for a category
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Budget Amount (₦)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select value={formData.period} onValueChange={(v) => setFormData({ ...formData, period: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Alert at (%)</Label>
                  <Input
                    type="number"
                    placeholder="80"
                    value={formData.notification_threshold}
                    onChange={(e) => setFormData({ ...formData, notification_threshold: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">Get notified when you reach this percentage of your budget</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBudget} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Budget'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Remaining</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(remainingBudget)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Alerts */}
        {alerts.length > 0 && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <Bell className="h-5 w-5" />
                Budget Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium">{alert.category}</p>
                      <p className="text-sm text-slate-500">{alert.message}</p>
                    </div>
                    <Badge className="bg-yellow-500">
                      {alert.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budgets List */}
        {budgets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2">No Budgets Yet</h3>
              <p className="text-slate-500 mb-4">Create your first budget to track your spending</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.amount) * 100
              return (
                <Card key={budget.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{budget.category}</h3>
                        <p className="text-sm text-slate-500">{budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Spent: <span className={getStatusColor(budget.spent, budget.amount)}>{formatCurrency(budget.spent)}</span></span>
                      <span className="text-sm">Budget: {formatCurrency(budget.amount)}</span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className={`h-2 ${getProgressColor(budget.spent, budget.amount)}`} />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-slate-500">{percentage.toFixed(1)}% used</span>
                      <span className="text-xs text-slate-500">{formatCurrency(budget.amount - budget.spent)} remaining</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}