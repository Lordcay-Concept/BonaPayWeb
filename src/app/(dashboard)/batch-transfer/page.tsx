'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { batchTransferService, BatchRecipient } from '@/lib/transfers/batch.service'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, Download, Plus, Trash2, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BatchTransferPage() {
  const router = useRouter()
  const [recipients, setRecipients] = useState<BatchRecipient[]>([])
  const [newRecipient, setNewRecipient] = useState<BatchRecipient>({
    account_number: '',
    bank_code: '',
    amount: 0,
    note: '',
  })
  const [processing, setProcessing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [csvData, setCsvData] = useState('')

  const banks = [
    'GTBank', 'Zenith Bank', 'Access Bank', 'First Bank', 'UBA',
    'FCMB', 'Stanbic IBTC', 'Union Bank', 'Polaris Bank', 'Wema Bank'
  ]

  const addRecipient = () => {
    if (!newRecipient.account_number || !newRecipient.amount) {
      toast.error('Please fill account number and amount')
      return
    }
    setRecipients([...recipients, { ...newRecipient }])
    setNewRecipient({
      account_number: '',
      bank_code: '',
      amount: 0,
      note: '',
    })
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setCsvData(text)
    
    const lines = text.split('\n').filter(line => line.trim())
    const parsed: BatchRecipient[] = []
    
    for (const line of lines) {
      const parts = line.split(',')
      if (parts.length >= 2) {
        parsed.push({
          account_number: parts[0].trim(),
          bank_code: parts[1].trim(),
          amount: parseFloat(parts[2]) || 0,
          note: parts[3]?.trim(),
        })
      }
    }
    
    if (parsed.length > 0) {
      setRecipients(parsed)
      toast.success(`${parsed.length} recipients loaded from CSV`)
    }
  }

  const downloadTemplate = () => {
    const template = 'Account Number,Bank Code,Amount,Note\n0123456789,GTBank,1000,Rent\n0987654321,Zenith Bank,2000,Food'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'batch_transfer_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0)

  const handleProcessBatch = async () => {
    if (recipients.length === 0) {
      toast.error('No recipients added')
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setProcessing(true)
    try {
      const result = await batchTransferService.createBatchTransfer(user.id, recipients)
      if (result.success) {
        toast.success('Batch transfer initiated!')
        setRecipients([])
        setShowConfirm(false)
        router.push('/transactions')
      } else {
        toast.error(result.error || 'Batch transfer failed')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Batch Transfer</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Send money to multiple recipients at once
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Recipients */}
          <Card>
            <CardHeader>
              <CardTitle>Add Recipients</CardTitle>
              <CardDescription>Add recipients one by one or upload CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  placeholder="0123456789"
                  value={newRecipient.account_number}
                  onChange={(e) => setNewRecipient({ ...newRecipient, account_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bank</Label>
                <Select value={newRecipient.bank_code} onValueChange={(v) => setNewRecipient({ ...newRecipient, bank_code: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₦)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={newRecipient.amount || ''}
                  onChange={(e) => setNewRecipient({ ...newRecipient, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Note (Optional)</Label>
                <Input
                  placeholder="Payment reference"
                  value={newRecipient.note}
                  onChange={(e) => setNewRecipient({ ...newRecipient, note: e.target.value })}
                />
              </div>
              <Button onClick={addRecipient} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </CardContent>
          </Card>

          {/* CSV Upload */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Upload</CardTitle>
              <CardDescription>Upload bulk recipients from CSV file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste CSV data here..."
                value={csvData}
                onChange={handleCSVUpload}
                rows={6}
              />
              <Button variant="outline" onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Format: Account Number, Bank, Amount, Note (optional)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recipients List */}
        {recipients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recipients ({recipients.length})</CardTitle>
              <CardDescription>Total: {formatCurrency(totalAmount)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium">{recipient.account_number}</p>
                      <p className="text-sm text-slate-500">{recipient.bank_code}</p>
                      {recipient.note && <p className="text-xs text-slate-400">{recipient.note}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(recipient.amount)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecipient(index)}
                        className="text-red-600 mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setShowConfirm(true)}
                className="w-full mt-4"
                size="lg"
              >
                Process Batch Transfer ({formatCurrency(totalAmount)})
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Batch Transfer</DialogTitle>
              <DialogDescription>
                You are about to send money to {recipients.length} recipients
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <p className="flex justify-between">
                  <span>Total Recipients:</span>
                  <span className="font-bold">{recipients.length}</span>
                </p>
                <p className="flex justify-between mt-2">
                  <span>Total Amount:</span>
                  <span className="font-bold text-red-600">{formatCurrency(totalAmount)}</span>
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This action cannot be undone. Please review all recipient details before confirming.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcessBatch} disabled={processing}>
                {processing ? 'Processing...' : 'Confirm & Process'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}