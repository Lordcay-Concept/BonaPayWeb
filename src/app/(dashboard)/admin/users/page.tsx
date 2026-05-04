'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, UserCheck, UserX, Eye, Ban, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  is_admin: boolean
  is_active: boolean
  kyc_status: string
  tier: number
  created_at: string
  account: {
    account_number: string
    balance: number
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'suspend' | 'activate' | 'delete'>('suspend')
  const [processing, setProcessing] = useState(false)

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
      await fetchUsers()
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    const supabase = getSupabaseClient()
    
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch accounts for each user
      const usersWithAccounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: account } = await supabase
            .from('accounts')
            .select('account_number, balance')
            .eq('user_id', profile.id)
            .single()

          return {
            ...profile,
            account: account || { account_number: 'N/A', balance: 0 }
          }
        })
      )

      setUsers(usersWithAccounts)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    }
  }

  const handleUserAction = async () => {
    if (!selectedUser) return

    setProcessing(true)
    const supabase = getSupabaseClient()

    try {
      if (actionType === 'suspend') {
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('id', selectedUser.id)

        if (error) throw error
        toast.success('User suspended successfully')
      } else if (actionType === 'activate') {
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: true })
          .eq('id', selectedUser.id)

        if (error) throw error
        toast.success('User activated successfully')
      } else if (actionType === 'delete') {
        // Delete from auth.users (this will cascade)
        const { error } = await supabase.auth.admin.deleteUser(selectedUser.id)
        if (error) throw error
        toast.success('User deleted successfully')
      }

      await fetchUsers()
      setShowActionDialog(false)
      setSelectedUser(null)
    } catch (error: any) {
      toast.error(error.message || 'Action failed')
    } finally {
      setProcessing(false)
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

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.account?.account_number?.includes(searchTerm)
  )

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage all users on the platform
            </p>
          </div>
          <div className="text-sm text-slate-500">
            Total Users: {filteredUsers.length}
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or account number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.full_name || 'N/A'}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                            <p className="text-xs text-slate-400">{user.phone || 'No phone'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {user.account?.account_number || 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(user.account?.balance || 0)}
                        </TableCell>
                        <TableCell>{getKycBadge(user.kyc_status)}</TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge className="bg-red-500">Suspended</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user.is_active ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-600"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setActionType('suspend')
                                  setShowActionDialog(true)
                                }}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setActionType('activate')
                                  setShowActionDialog(true)
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {!user.is_admin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setActionType('delete')
                                  setShowActionDialog(true)
                                }}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'suspend' && 'Suspend User'}
              {actionType === 'activate' && 'Activate User'}
              {actionType === 'delete' && 'Delete User'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'suspend' && `Are you sure you want to suspend ${selectedUser?.full_name || selectedUser?.email}? They will not be able to use the platform.`}
              {actionType === 'activate' && `Are you sure you want to activate ${selectedUser?.full_name || selectedUser?.email}? They will regain full access.`}
              {actionType === 'delete' && `Are you sure you want to delete ${selectedUser?.full_name || selectedUser?.email}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'delete' ? 'destructive' : 'default'}
              onClick={handleUserAction}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'suspend' && 'Suspend'}
                  {actionType === 'activate' && 'Activate'}
                  {actionType === 'delete' && 'Delete'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}