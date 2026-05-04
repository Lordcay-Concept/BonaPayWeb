'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { pdfService } from '@/lib/pdf/pdf.service'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarIcon, Download, FileText, Loader2, AlertCircle } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function StatementsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [fromDate, setFromDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date
  })
  const [toDate, setToDate] = useState<Date>(new Date())
  const [generating, setGenerating] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
    }
  }

  const validateDates = () => {
    if (fromDate > toDate) {
      setError('From date cannot be later than To date')
      return false
    }
    
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 365) {
      setError('Date range cannot exceed 365 days')
      return false
    }
    
    setError(null)
    return true
  }

  const handleGenerateStatement = async () => {
    if (!isAuthenticated) return
    if (!validateDates()) return

    setGenerating(true)
    const loadingToast = toast.loading('Generating statement...')
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        toast.error('Failed to fetch profile', { id: loadingToast })
        return
      }

      // Get account
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('account_number, balance')
        .eq('user_id', user.id)
        .single()

      if (accountError) {
        console.error('Account error:', accountError)
        toast.error('Failed to fetch account details', { id: loadingToast })
        return
      }

      // Get transactions within date range
      const fromDateStr = fromDate.toISOString()
      const toDateStr = toDate.toISOString()
      
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', fromDateStr)
        .lte('created_at', toDateStr)
        .order('created_at', { ascending: true })

      if (transactionsError) {
        console.error('Transactions error:', transactionsError)
        toast.error('Failed to fetch transactions', { id: loadingToast })
        return
      }

      // Calculate running balance and prepare transaction data
      let runningBalance = 0
      const transactionsWithBalance = (transactions || []).map(tx => {
        const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount)
        
        if (tx.type === 'credit') {
          runningBalance += amount
        } else {
          runningBalance -= amount
        }
        
        return {
          date: format(new Date(tx.created_at), 'dd/MM/yyyy'),
          description: tx.description || tx.type,
          reference: tx.reference || tx.id.slice(0, 8).toUpperCase(),
          type: tx.type as 'debit' | 'credit',
          amount: amount,
          balance: runningBalance,
        }
      })

      // Calculate opening balance
      const firstTransaction = transactionsWithBalance[0]
      const openingBalance = firstTransaction 
        ? (firstTransaction.type === 'credit' 
            ? firstTransaction.balance - firstTransaction.amount 
            : firstTransaction.balance + firstTransaction.amount)
        : account?.balance || 0

      const statementData = {
        user_name: profile?.full_name || 'User',
        account_number: account?.account_number || 'N/A',
        period: {
          from: format(fromDate, 'dd/MM/yyyy'),
          to: format(toDate, 'dd/MM/yyyy'),
        },
        transactions: transactionsWithBalance,
        opening_balance: openingBalance,
        closing_balance: account?.balance || 0,
      }

      // Generate PDF
      const pdfBlob = await pdfService.generateStatement(statementData)
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `statement_${format(fromDate, 'yyyy-MM-dd')}_to_${format(toDate, 'yyyy-MM-dd')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Statement generated successfully!', { id: loadingToast })
    } catch (error: any) {
      console.error('Statement generation error:', error)
      toast.error(error.message || 'Failed to generate statement', { id: loadingToast })
    } finally {
      setGenerating(false)
    }
  }

  const setQuickDate = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    setFromDate(date)
    setToDate(new Date())
    setError(null)
  }

  const setQuickMonth = (months: number) => {
    const date = new Date()
    date.setMonth(date.getMonth() - months)
    setFromDate(date)
    setToDate(new Date())
    setError(null)
  }

  if (!isAuthenticated) {
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
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in p-6">
        <div>
          <h1 className="text-3xl font-bold">Account Statements</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Generate and download your account statements in PDF format
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Statement Period</CardTitle>
            <CardDescription>
              Select the date range for your statement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(fromDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={(date) => date && setFromDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(toDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={(date) => date && setToDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button
              onClick={handleGenerateStatement}
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Statement...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Statement
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Quickly select common date ranges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setQuickDate(7)}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                onClick={() => setQuickDate(30)}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                onClick={() => setQuickMonth(3)}
              >
                Last 3 months
              </Button>
              <Button
                variant="outline"
                onClick={() => setQuickMonth(6)}
              >
                Last 6 months
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-blue-600" />
                <span>Statements are generated in PDF format and include all transactions for the selected period.</span>
              </li>
              <li className="flex items-start gap-2">
                <Download className="h-4 w-4 mt-0.5 text-blue-600" />
                <span>Downloaded statements can be saved, printed, or shared as needed.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                <span>Maximum date range is 365 days. For older transactions, please contact support.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}