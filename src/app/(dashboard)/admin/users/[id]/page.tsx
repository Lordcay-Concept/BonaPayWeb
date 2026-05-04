'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, User, Mail, Phone, Calendar, CreditCard, Shield, Activity, CheckCircle, XCircle, Ban, UserX } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface UserDetails {
  id: string
  email: string
  full_name: string
  phone: string
  is_admin: boolean
  is_active: boolean
  kyc_status: string
  tier: number
  created_at: string
  last_login_at?: string
  account: {
    id: string
    account_number: string
    balance: number
    created_at: string
  }
  transactions: Array<{
    id: string
    amount: number
    type: string
    description: string
    status: string
    created_at: string
  }>
}

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAndFetch()
  }, [userId])

  const checkAdminAndFetch = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, tier')
        .eq('id', currentUser.id)
        .single()

      if (profile?.is_admin !== true && profile?.tier !== 3) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      await fetchUserDetails()
    } catch (error) {
      router.push('/dashboard')
    }
  }

  const fetchUserDetails = async () => {
    const supabase = getSupabaseClient()
    
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Fetch user account
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (accountError) console.error('Account error:', accountError)

      // Fetch user transactions (last 10)
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionsError) console.error('Transactions error:', transactionsError)

      setUser({
        ...profile,
        account: account || {
          id: '',
          account_number: 'N/A',
          balance: 0,
          created_at: new Date().toISOString(),
        },
        transactions: transactions || [],
      })
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      toast.error('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendUser = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId)

      if (error) throw error
      toast.success('User suspended successfully')
      fetchUserDetails()
    } catch (error: any) {
      toast.error(error.message || 'Failed to suspend user')
    }
  }

  const handleActivateUser = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('id', userId)

      if (error) throw error
      toast.success('User activated successfully')
      fetchUserDetails()
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate user')
    }
  }

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-gray-500">Not Submitted</Badge>
    }
  }

  const getTransactionBadge = (status: string, type: string) => {
    if (status !== 'completed') {
      return <Badge className="bg-red-500">Failed</Badge>
    }
    return type === 'credit' 
      ? <Badge className="bg-green-500">Credit</Badge>
      : <Badge className="bg-orange-500">Debit</Badge>
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

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto mb-3 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">User Not Found</h3>
          <Link href="/admin/users">
            <Button>Back to Users</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{user.full_name || user.email}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              User ID: {user.id}
            </p>
          </div>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium">{user.phone || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Joined</p>
                  <p className="font-medium">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <div className="flex items-center gap-2">
                    {user.is_active ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge className="bg-red-500">Suspended</Badge>
                    )}
                    {user.is_admin && <Badge className="bg-purple-500">Admin</Badge>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-500">Account Number</p>
                <p className="font-mono text-lg">{user.account?.account_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(user.account?.balance || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Account Created</p>
                <p>{formatDate(user.account?.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for more info */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="kyc">KYC Information</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Last 10 transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {user.transactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-xs text-slate-500">{formatDate(tx.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          {getTransactionBadge(tx.status, tx.type)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>KYC Information</CardTitle>
                <CardDescription>Identity verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium">KYC Status</p>
                      <p className="text-sm text-slate-500">Identity verification</p>
                    </div>
                    {getKycBadge(user.kyc_status)}
                  </div>
                  {user.kyc_status === 'pending' && (
                    <div className="flex gap-3">
                      <Button variant="default" className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve KYC
                      </Button>
                      <Button variant="destructive" className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject KYC
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>User activity history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Activity log coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          {user.is_active ? (
            <Button variant="destructive" onClick={handleSuspendUser}>
              <Ban className="h-4 w-4 mr-2" />
              Suspend User
            </Button>
          ) : (
            <Button variant="default" onClick={handleActivateUser}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Activate User
            </Button>
          )}
          {!user.is_admin && (
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              <UserX className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}