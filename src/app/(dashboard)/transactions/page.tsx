'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { transferSchema } from '@/lib/validations'
import { getSupabaseClient } from '@/lib/supabase/client'
import { billService } from '@/lib/bills/bill.service'
import { formatCurrency, generateTransactionReference } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, Building2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type TransferFormData = {
  recipientAccount: string
  amount: number
  note?: string
}

interface Account {
  balance: number
  account_number: string
}

export default function TransferPage() {
  const router = useRouter()
  const [account, setAccount] = useState<Account | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [transferData, setTransferData] = useState<TransferFormData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifiedAccount, setVerifiedAccount] = useState<{ name: string; bank: string } | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  })

  const amount = watch('amount')
  const recipientAccount = watch('recipientAccount')

  const isDisabled = !recipientAccount || !amount || (account ? amount > account.balance : false)

  useEffect(() => {
    fetchAccount()
  }, [])

  const fetchAccount = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('balance, account_number')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setAccount(data)
    }
  }

  // Verify account number when user types
  const handleAccountNumberChange = async (accountNumber: string) => {
    setValue('recipientAccount', accountNumber)
    setVerifiedAccount(null)
    setVerificationError(null)
    
    if (accountNumber.length === 10) {
      setVerifying(true)
      try {
        const result = await billService.verifyAccountNumber(accountNumber)
        if (result.success) {
          setVerifiedAccount({
            name: result.accountName!,
            bank: result.bankName!,
          })
        } else {
          setVerificationError(result.error || 'Verification failed')
        }
      } catch (error) {
        setVerificationError('Unable to verify account')
      } finally {
        setVerifying(false)
      }
    }
  }

  const onSubmit = (data: TransferFormData) => {
    if (!verifiedAccount) {
      toast.error('Please verify the account number first')
      return
    }
    
    if (account && data.amount > account.balance) {
      toast.error('Insufficient funds')
      return
    }
    setTransferData(data)
    setShowConfirm(true)
  }

  const handleConfirmTransfer = async () => {
    if (!transferData) return
    
    setIsLoading(true)
    const supabase = getSupabaseClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const newBalance = (account?.balance || 0) - transferData.amount
      
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'debit',
          amount: transferData.amount,
          description: transferData.note || 'Money Transfer',
          reference: generateTransactionReference(),
          recipient_account: transferData.recipientAccount,
          recipient_name: verifiedAccount?.name || 'Recipient',
          status: 'completed',
        })

      if (transactionError) throw transactionError

      toast.success(`Successfully sent ${formatCurrency(transferData.amount)} to ${verifiedAccount?.name}`)
      reset()
      setVerifiedAccount(null)
      setVerificationError(null)
      setShowConfirm(false)
      fetchAccount()
      router.push('/transactions')
    } catch (error: any) {
      toast.error(error.message || 'Transfer failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Send Money</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Transfer money to any bank account in Nigeria
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipientAccount">Recipient Account Number</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="recipientAccount"
                    placeholder="0123456789"
                    className="pl-10"
                    value={recipientAccount}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                  />
                </div>
                {errors.recipientAccount && (
                  <p className="text-sm text-red-500">{errors.recipientAccount.message}</p>
                )}
                
                {/* Verification Status */}
                {verifying && (
                  <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <p className="text-sm text-slate-600">Verifying account...</p>
                  </div>
                )}
                
                {verifiedAccount && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        {verifiedAccount.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {verifiedAccount.bank}
                      </p>
                    </div>
                  </div>
                )}
                
                {verificationError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {verificationError}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (NGN)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">₦</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    {...register('amount', { valueAsNumber: true })}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
                {amount > 0 && account && (
                  <p className="text-sm text-slate-500">
                    Available balance: {formatCurrency(account.balance)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="What's this for?"
                  {...register('note')}
                />
              </div>

              {recipientAccount && amount > 0 && account && amount > account.balance && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">Insufficient funds. You need {formatCurrency(amount - account.balance)} more.</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isDisabled || !verifiedAccount}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Transfer</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to send {transferData && formatCurrency(transferData.amount)} to:
              </AlertDialogDescription>
            </AlertDialogHeader>
            {verifiedAccount && transferData && (
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                <p className="font-medium">{verifiedAccount.name}</p>
                <p className="text-sm text-slate-500">{verifiedAccount.bank}</p>
                <p className="text-sm font-mono text-slate-600">{transferData.recipientAccount}</p>
                {transferData.note && (
                  <p className="text-sm text-slate-500">Note: {transferData.note}</p>
                )}
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmTransfer} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Confirm Transfer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}