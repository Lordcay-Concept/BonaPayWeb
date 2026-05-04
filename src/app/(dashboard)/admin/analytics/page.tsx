'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { Users, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react'

interface AnalyticsData {
  userGrowth: Array<{ date: string; count: number }>
  transactionVolume: Array<{ date: string; amount: number; count: number }>
  transactionType: Array<{ type: string; amount: number; count: number }>
  revenue: Array<{ date: string; amount: number }>
  topUsers: Array<{ name: string; email: string; transactions: number; volume: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    transactionVolume: [],
    transactionType: [],
    revenue: [],
    topUsers: [],
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    checkAdminAndFetch()
  }, [timeRange])

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
      await fetchAnalytics()
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    const supabase = getSupabaseClient()
    
    try {
      // Get date range
      const now = new Date()
      let startDate = new Date()
      
      if (timeRange === '7d') {
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange === '30d') {
        startDate.setDate(now.getDate() - 30)
      } else if (timeRange === '90d') {
        startDate.setDate(now.getDate() - 90)
      }

      const startDateStr = startDate.toISOString()

      // Fetch user growth
      const { data: userGrowth } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDateStr)
        .order('created_at')

      // Process user growth data
      const userGrowthMap = new Map()
      userGrowth?.forEach(user => {
        const date = user.created_at.split('T')[0]
        userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1)
      })

      const userGrowthData = Array.from(userGrowthMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Fetch transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .gte('created_at', startDateStr)
        .order('created_at')

      // Process transaction volume
      const volumeMap = new Map()
      const revenueMap = new Map()
      let totalCredit = 0
      let totalDebit = 0

      transactions?.forEach(tx => {
        const date = tx.created_at.split('T')[0]
        const current = volumeMap.get(date) || { amount: 0, count: 0 }
        
        if (tx.type === 'credit') {
          current.amount += tx.amount
          totalCredit += tx.amount
        } else {
          current.amount -= tx.amount
          totalDebit += tx.amount
        }
        current.count += 1
        volumeMap.set(date, current)

        // Revenue from fees 
        revenueMap.set(date, (revenueMap.get(date) || 0) + (tx.amount * 0.01))
      })

      const transactionVolumeData = Array.from(volumeMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const revenueData = Array.from(revenueMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Process transaction types
      const typeData = [
        { type: 'Money In', amount: totalCredit, count: transactions?.filter(t => t.type === 'credit').length || 0 },
        { type: 'Money Out', amount: totalDebit, count: transactions?.filter(t => t.type === 'debit').length || 0 },
      ]

      // Fetch top users
      const { data: topUsersData } = await supabase
        .from('transactions')
        .select('user_id, amount')
        .gte('created_at', startDateStr)

      const userVolumeMap = new Map()
      topUsersData?.forEach(tx => {
        userVolumeMap.set(tx.user_id, (userVolumeMap.get(tx.user_id) || 0) + tx.amount)
      })

      const topUsersList = await Promise.all(
        Array.from(userVolumeMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(async ([userId, volume]) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', userId)
              .single()

            const { count: transactionCount } = await supabase
              .from('transactions')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .gte('created_at', startDateStr)

            return {
              name: profile?.full_name || 'Unknown',
              email: profile?.email || 'Unknown',
              transactions: transactionCount || 0,
              volume,
            }
          })
      )

      setAnalytics({
        userGrowth: userGrowthData,
        transactionVolume: transactionVolumeData,
        transactionType: typeData,
        revenue: revenueData,
        topUsers: topUsersList,
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
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
      <div className="space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Platform performance and user insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={timeRange === '7d' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setTimeRange('7d')}
              className="px-4"
            >
              7 Days
            </Button>
            <Button 
              variant={timeRange === '30d' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setTimeRange('30d')}
              className="px-4"
            >
              30 Days
            </Button>
            <Button 
              variant={timeRange === '90d' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setTimeRange('90d')}
              className="px-4"
            >
              90 Days
            </Button>
          </div>
        </div>

        {/* Horizontal Tabs Navigation - No Box */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-6">
            <TabButton value="overview" label="Overview" />
            <TabButton value="transactions" label="Transactions" />
            <TabButton value="users" label="Users" />
            <TabButton value="revenue" label="Revenue" />
          </div>
        </div>

        {/* Overview Tab Content */}
        <div id="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.userGrowth.reduce((sum, d) => sum + d.count, 0)}</div>
                <p className="text-xs text-slate-500">+{analytics.userGrowth[analytics.userGrowth.length - 1]?.count || 0} new</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
                <Activity className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.transactionVolume.reduce((sum, d) => sum + d.amount, 0))}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.reduce((sum, d) => sum + d.amount, 0))}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.topUsers.length}</div>
                <p className="text-xs text-slate-500">Top active users</p>
              </CardContent>
            </Card>
          </div>

          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Type Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.transactionType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="amount"
                        label
                      >
                        {analytics.transactionType.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analytics.transactionType.map((type, i) => (
                    <div key={type.type} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span>{type.type}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(type.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Users by Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topUsers.map((user, index) => (
                    <div key={user.email} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <p className="text-xs text-slate-400">{user.transactions} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(user.volume)}</p>
                        <p className="text-xs text-slate-500">volume</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transactions Tab Content */}
        <div id="transactions" className="space-y-6 hidden">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.transactionVolume}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="amount" fill="#3B82F6" name="Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Tab Content */}
        <div id="users" className="space-y-6 hidden">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Tab Content */}
        <div id="revenue" className="space-y-6 hidden">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area type="monotone" dataKey="amount" fill="#10B981" stroke="#10B981" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Tab Button Component
function TabButton({ value, label }: { value: string; label: string }) {
  const [activeTab, setActiveTab] = useState('overview')

  const handleClick = () => {
    setActiveTab(value)
    
    document.getElementById('overview')?.classList.add('hidden')
    document.getElementById('transactions')?.classList.add('hidden')
    document.getElementById('users')?.classList.add('hidden')
    document.getElementById('revenue')?.classList.add('hidden')
    
    document.getElementById(value)?.classList.remove('hidden')
  }

  const isActive = activeTab === value

  return (
    <button
      onClick={handleClick}
      className={`
        px-4 py-2 text-sm font-medium transition-all border-b-2
        ${isActive 
          ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
        }
      `}
    >
      {label}
    </button>
  )
}