'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Wallet, TrendingUp, Activity } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalBalance: number
  totalTransactions: number
  activeUsers: number
}

interface Account {
  balance: number
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBalance: 0,
    totalTransactions: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    const supabase = getSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Simple admin check - in production, use roles table
    if (user.email !== 'admin@fintechflow.com') {
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    fetchStats()
  }

  const fetchStats = async () => {
    const supabase = getSupabaseClient()
    
    try {
      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get total balance
      const { data: accounts } = await supabase
        .from('accounts')
        .select('balance')
      
      // Fixed: Added proper types to the reduce function
      const totalBalance = accounts?.reduce(
        (sum: number, acc: Account) => sum + (acc.balance || 0), 
        0
      ) || 0

      // Get total transactions
      const { count: transactionsCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: usersCount || 0,
        totalBalance: totalBalance,
        totalTransactions: transactionsCount || 0,
        activeUsers: usersCount || 0, // Simplified for demo
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return null
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
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Overview of platform statistics and activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-slate-500">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
              <p className="text-xs text-slate-500">Across all accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-slate-500">Total processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-slate-500">Currently active</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 text-sm">
              This is a demo fintech platform. In production, this dashboard would show real-time analytics,
              user activity logs, fraud detection alerts, and system health metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}