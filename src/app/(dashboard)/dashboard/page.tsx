'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Wallet, TrendingUp, CreditCard, Zap, PiggyBank, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

interface Account {
  account_number: string
  balance: number
}

interface Transaction {
  id: string
  amount: number
  description: string
  type: 'debit' | 'credit'
  category: string
  created_at: string
  recipient_name?: string
}

interface SpendingData {
  category: string
  amount: number
  color: string
}

interface WeeklyData {
  day: string
  spent: number
  received: number
}

interface AnalyticsTransaction {
  amount: number
  type: 'debit' | 'credit'
  category: string
  created_at: string
}

const CATEGORY_COLORS: Record<string, string> = {
  transfer: '#3B82F6',
  bill_payment: '#10B981',
  airtime: '#F59E0B',
  data: '#8B5CF6',
  cable_tv: '#EF4444',
  savings: '#06B6D4',
  deposit: '#22C55E',
}

export default function DashboardPage() {
  const router = useRouter()
  const [account, setAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showBalance, setShowBalance] = useState(true)
  const [loading, setLoading] = useState(true)
  const [spendingData, setSpendingData] = useState<SpendingData[]>([])
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [totalReceived, setTotalReceived] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('account_number, balance')
        .eq('user_id', user.id)
        .single()

      if (accountError) throw accountError
      setAccount(accountData)

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id, amount, description, type, category, created_at, recipient_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionsError) throw transactionsError
      setTransactions(transactionsData || [])

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('amount, type, category, created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())

      if (allTransactions && allTransactions.length > 0) {
        const categoryMap = new Map<string, number>()
        let spent = 0
        let received = 0

        allTransactions.forEach((tx: AnalyticsTransaction) => {
          if (tx.type === 'debit') {
            spent += tx.amount
            const category = tx.category || 'transfer'
            categoryMap.set(category, (categoryMap.get(category) || 0) + tx.amount)
          } else {
            received += tx.amount
          }
        })

        setTotalSpent(spent)
        setTotalReceived(received)

        const spendingCategories: SpendingData[] = Array.from(categoryMap.entries())
          .map(([category, amount]) => ({
            category: category.replace('_', ' ').toUpperCase(),
            amount,
            color: CATEGORY_COLORS[category] || '#6B7280',
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5)

        setSpendingData(spendingCategories)

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const weeklySpent = new Array(7).fill(0)
        const weeklyReceived = new Array(7).fill(0)

        allTransactions.forEach((tx: AnalyticsTransaction) => {
          const date = new Date(tx.created_at)
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
          if (tx.type === 'debit') {
            weeklySpent[dayIndex] += tx.amount
          } else {
            weeklyReceived[dayIndex] += tx.amount
          }
        })

        const weeklyChartData: WeeklyData[] = days.map((day, i) => ({
          day,
          spent: weeklySpent[i],
          received: weeklyReceived[i],
        }))

        setWeeklyData(weeklyChartData)
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDemoMoney = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newBalance = (account?.balance || 0) + 5000
      
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'credit',
          category: 'deposit',
          amount: 5000,
          description: 'Demo Money Added',
          reference: `DEMO-${Date.now()}`,
          status: 'completed',
        })

      if (transactionError) throw transactionError

      setAccount(prev => prev ? { ...prev, balance: newBalance } : null)
      toast.success('₦5,000 demo money added!')
      fetchDashboardData()
    } catch (error: any) {
      toast.error('Failed to add demo money')
    }
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
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back to your financial hub
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {showBalance ? formatCurrency(account?.balance || 0) : '••••••'}
                    </span>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 hover:bg-blue-400/20 rounded-lg transition-colors"
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-blue-100 mt-1">
                    Account: {account?.account_number}
                  </p>
                </div>
                <Button
                  onClick={handleAddDemoMoney}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Add Demo Funds
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Spent This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-slate-500">Total expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Received This Month</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</div>
              <p className="text-xs text-slate-500">Total income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Net Flow</CardTitle>
              <Activity className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReceived - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalReceived - totalSpent)}
              </div>
              <p className="text-xs text-slate-500">Income - Expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/transfer">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Send Money</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cards">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm font-medium">Virtual Cards</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/bills">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-sm font-medium">Pay Bills</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/savings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-medium">Savings</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {spendingData.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No spending data available</p>
                  <p className="text-sm">Make some transactions to see your spending patterns</p>
                </div>
              ) : (
                <>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={spendingData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="amount"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {spendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {spendingData.map((category) => (
                      <div key={category.category} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span>{category.category}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(category.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyData.length === 0 || weeklyData.every(d => d.spent === 0 && d.received === 0) ? (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No activity data available</p>
                  <p className="text-sm">Transactions this week will appear here</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis tickFormatter={(value) => `₦${value / 1000}k`} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="spent" fill="#EF4444" name="Spent" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="received" fill="#22C55E" name="Received" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Make your first transfer or add demo funds</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'credit'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.description || (transaction.type === 'credit' ? 'Money Added' : 'Money Sent')}
                        </p>
                        {transaction.recipient_name && (
                          <p className="text-sm text-slate-500">To: {transaction.recipient_name}</p>
                        )}
                        <p className="text-xs text-slate-400">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}