'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ArrowUpRight, TrendingUp, Filter, Download } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  description: string
  type: 'debit' | 'credit'
  status: string
  created_at: string
  recipient_name?: string
  recipient_account?: string
  reference: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [searchTerm, filter, transactions])

  const fetchTransactions = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
      setFilteredTransactions(data || [])
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.recipient_name && t.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredTransactions(filtered)
  }

  const handleExport = () => {
    // Create CSV data
    const csvData = filteredTransactions.map(t => ({
      Date: formatDate(t.created_at),
      Description: t.description,
      Type: t.type === 'credit' ? 'Money In' : 'Money Out',
      Amount: t.type === 'credit' ? t.amount : -t.amount,
      Reference: t.reference,
      Status: t.status,
    }))

    const headers = Object.keys(csvData[0] || {}).join(',')
    const rows = csvData.map(row => Object.values(row).join(','))
    const csv = [headers, ...rows].join('\n')

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              View and manage all your transactions
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by description, reference, or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filter === 'credit' ? 'default' : 'outline'}
                  onClick={() => setFilter('credit')}
                  size="sm"
                  className="gap-1"
                >
                  <TrendingUp className="h-4 w-4" />
                  Money In
                </Button>
                <Button
                  variant={filter === 'debit' ? 'default' : 'outline'}
                  onClick={() => setFilter('debit')}
                  size="sm"
                  className="gap-1"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Money Out
                </Button>
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500">No transactions found</p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchTerm ? 'Try a different search term' : 'Your transactions will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-2 rounded-full",
                        transaction.type === 'credit'
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      )}>
                        {transaction.type === 'credit' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.recipient_name && (
                          <p className="text-sm text-slate-500">To: {transaction.recipient_name}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-400">{formatDate(transaction.created_at)}</p>
                          <span className="text-xs text-slate-300">•</span>
                          <p className="text-xs text-slate-400">Ref: {transaction.reference.slice(0, 12)}...</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "font-semibold",
                        transaction.type === 'credit' ? "text-green-600" : "text-red-600"
                      )}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className={cn(
                        "text-xs px-2 py-0.5 rounded-full mt-1",
                        transaction.status === 'completed' 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : transaction.status === 'pending'
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {transaction.status}
                      </div>
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

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}