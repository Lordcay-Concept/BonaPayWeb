'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Wallet, TrendingUp, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

interface Stats {
  totalUsers: number
  totalBalance: number
  totalTransactions: number
  activeUsers: number
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
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, tier')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        router.push('/dashboard')
        return
      }

      const isUserAdmin = profile?.is_admin === true || profile?.tier === 3
      
      if (!isUserAdmin) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      await fetchStats()
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    const supabase = getSupabaseClient()
    
    try {
      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (usersError) throw usersError

      // Get total balance from all accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('balance')
      
      if (accountsError) throw accountsError
      
      const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0

      // Get total transactions count
      const { count: transactionsCount, error: transError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })

      if (transError) throw transError

      setStats({
        totalUsers: usersCount || 0,
        totalBalance: totalBalance,
        totalTransactions: transactionsCount || 0,
        activeUsers: usersCount || 0,
      })
    } catch (error: any) {
      console.error('Failed to fetch stats:', error)
      toast.error('Failed to load dashboard data')
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
              This is a BonaPay platform. In production, this dashboard would show real-time analytics,
              user activity logs, fraud detection alerts, and system health metrics.
            </p>
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-semibold mb-2">Quick Stats:</h3>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li>• Total Users: {stats.totalUsers}</li>
                <li>• Total Platform Balance: {formatCurrency(stats.totalBalance)}</li>
                <li>• Total Transactions: {stats.totalTransactions}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}