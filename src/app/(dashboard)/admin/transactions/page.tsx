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
import { Download, Receipt } from 'lucide-react'
import { pdfService } from '@/lib/pdf/pdf.service'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Eye, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  user_id: string
  user_name: string
  user_email: string
  type: 'debit' | 'credit'
  amount: number
  description: string
  reference: string
  recipient_name?: string
  recipient_account?: string
  status: string
  created_at: string
  metadata?: any
}

export default function AdminTransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDetails, setShowDetails] = useState(false)

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
      await fetchTransactions()
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    const supabase = getSupabaseClient()
    
    try {
      // Fetch all transactions
      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get user info for each transaction
      const transactionsWithUsers = await Promise.all(
        (transactionsData || []).map(async (tx) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', tx.user_id)
            .single()

          return {
            ...tx,
            user_name: profile?.full_name || 'Unknown',
            user_email: profile?.email || 'Unknown',
          }
        })
      )

      setTransactions(transactionsWithUsers)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      toast.error('Failed to load transactions')
    }
  }

  const handleExport = () => {
    const filtered = getFilteredTransactions()
    const csv = [
      ['Reference', 'User', 'Type', 'Amount', 'Description', 'Status', 'Date'],
      ...filtered.map(tx => [
        tx.reference,
        tx.user_email,
        tx.type,
        tx.amount.toString(),
        tx.description,
        tx.status,
        tx.created_at,
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export started')
  }

  const getFilteredTransactions = () => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === 'all' || tx.type === filterType
      const matchesStatus = filterStatus === 'all' || tx.status === filterStatus
      
      return matchesSearch && matchesType && matchesStatus
    })
  }

  const handleDownloadReceipt = async (transaction: Transaction) => {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  try {
    const receiptData = {
      transaction_id: transaction.id,
      reference: transaction.reference,
      date: formatDate(transaction.created_at),
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      recipient_name: transaction.recipient_name,
      recipient_account: transaction.recipient_account,
      status: transaction.status,
    }

    const pdfBlob = await pdfService.generateReceipt(receiptData)
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt_${transaction.reference}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Receipt downloaded')
  } catch (error) {
    toast.error('Failed to download receipt')
  }
}

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>
      case 'reversed':
        return <Badge className="bg-orange-500">Reversed</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  const filteredTransactions = getFilteredTransactions()
  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0)

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
            <h1 className="text-3xl font-bold">Transaction Monitoring</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor all platform transactions
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Failed Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {filteredTransactions.filter(t => t.status === 'failed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by reference, user, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Money In</SelectItem>
                  <SelectItem value="debit">Money Out</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{tx.user_name}</p>
                            <p className="text-xs text-slate-500">{tx.user_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'credit' ? (
                              <ArrowDownLeft className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            <span className="text-sm capitalize">{tx.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className={`font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell className="text-sm">{formatDate(tx.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(tx)
                              setShowDetails(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Transaction Details Dialog */}
      {/* Transaction Details Dialog */}
<Dialog open={showDetails} onOpenChange={setShowDetails}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Transaction Details</DialogTitle>
      <DialogDescription>
        Reference: {selectedTransaction?.reference}
      </DialogDescription>
    </DialogHeader>
    {selectedTransaction && (
      <>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Amount</p>
              <p className={`text-xl font-bold ${selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {selectedTransaction.type === 'credit' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Status</p>
              {selectedTransaction.status === 'completed' && (
                <Badge className="bg-green-500">Completed</Badge>
              )}
              {selectedTransaction.status === 'pending' && (
                <Badge className="bg-yellow-500">Pending</Badge>
              )}
              {selectedTransaction.status === 'failed' && (
                <Badge className="bg-red-500">Failed</Badge>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">User</p>
              <p className="font-medium">{selectedTransaction.user_name}</p>
              <p className="text-sm text-slate-500">{selectedTransaction.user_email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Date</p>
              <p>{formatDate(selectedTransaction.created_at)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-slate-500">Description</p>
              <p>{selectedTransaction.description}</p>
            </div>
            {selectedTransaction.recipient_name && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-slate-500">Recipient</p>
                <p className="font-medium">{selectedTransaction.recipient_name}</p>
                <p className="text-sm text-slate-500 font-mono">{selectedTransaction.recipient_account}</p>
              </div>
            )}
            {selectedTransaction.metadata && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-slate-500">Additional Info</p>
                <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(selectedTransaction.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
        
        {/* Download Receipt Button */}
        <div className="flex justify-end mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => handleDownloadReceipt(selectedTransaction)}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>
    </DashboardLayout>
  )
}