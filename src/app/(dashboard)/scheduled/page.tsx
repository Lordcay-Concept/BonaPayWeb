'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { scheduledService, ScheduledTransfer } from '@/lib/scheduled/scheduled.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Plus, Pause, Play, Trash2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const FREQUENCIES = [
  { value: 'one-time', label: 'One Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function ScheduledTransfersPage() {
  const router = useRouter()
  const [transfers, setTransfers] = useState<ScheduledTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    recipient_account: '',
    recipient_name: '',
    recipient_bank: '',
    amount: '',
    description: '',
    frequency: 'one-time',
    next_execution: '',
    end_date: '',
  })

  useEffect(() => {
    fetchScheduledTransfers()
  }, [])

  const fetchScheduledTransfers = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const userTransfers = await scheduledService.getUserScheduledTransfers(user.id)
    setTransfers(userTransfers)
    setLoading(false)
  }

  const handleCreateTransfer = async () => {
    const amountNum = parseFloat(formData.amount)
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!formData.recipient_account || !formData.recipient_name || !formData.recipient_bank) {
      toast.error('Please fill in recipient details')
      return
    }

    if (!formData.next_execution) {
      toast.error('Please select a start date')
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setCreating(true)
    try {
      const result = await scheduledService.createScheduledTransfer(user.id, {
        recipient_account: formData.recipient_account,
        recipient_name: formData.recipient_name,
        recipient_bank: formData.recipient_bank,
        amount: amountNum,
        description: formData.description,
        frequency: formData.frequency as any,
        next_execution: formData.next_execution,
        end_date: formData.end_date || undefined,
      })

      if (result.success) {
        toast.success('Scheduled transfer created successfully')
        setShowCreateDialog(false)
        setFormData({
          recipient_account: '',
          recipient_name: '',
          recipient_bank: '',
          amount: '',
          description: '',
          frequency: 'one-time',
          next_execution: '',
          end_date: '',
        })
        fetchScheduledTransfers()
      } else {
        toast.error(result.error || 'Failed to create scheduled transfer')
      }
    } catch (error) {
      toast.error('Failed to create scheduled transfer')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateStatus = async (transferId: string, status: 'active' | 'paused' | 'cancelled') => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const result = await scheduledService.updateTransferStatus(transferId, user.id, status)
    if (result.success) {
      toast.success(`Transfer ${status} successfully`)
      fetchScheduledTransfers()
    } else {
      toast.error(result.error || 'Failed to update transfer')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>
      case 'paused':
        return <Badge className="bg-yellow-500">Paused</Badge>
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    return FREQUENCIES.find(f => f.value === frequency)?.label || frequency
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
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Scheduled Transfers</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Set up recurring payments and automated transfers
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Transfer</DialogTitle>
                <DialogDescription>
                  Set up a one-time or recurring transfer
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Recipient Account Number</Label>
                  <Input
                    placeholder="0123456789"
                    value={formData.recipient_account}
                    onChange={(e) => setFormData({ ...formData, recipient_account: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recipient Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank</Label>
                  <Input
                    placeholder="GTBank"
                    value={formData.recipient_bank}
                    onChange={(e) => setFormData({ ...formData, recipient_bank: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₦)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Rent, Subscription, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.next_execution}
                    onChange={(e) => setFormData({ ...formData, next_execution: e.target.value })}
                  />
                </div>
                {formData.frequency !== 'one-time' && (
                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTransfer} disabled={creating}>
                  {creating ? 'Creating...' : 'Schedule Transfer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {transfers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2">No Scheduled Transfers</h3>
              <p className="text-slate-500 mb-4">Set up recurring payments to automate your finances</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Schedule Your First Transfer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <Card key={transfer.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{transfer.recipient_name}</h3>
                        {getStatusBadge(transfer.status)}
                      </div>
                      <p className="text-sm text-slate-500">
                        {transfer.recipient_bank} • {transfer.recipient_account}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{transfer.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(transfer.amount)}</p>
                      <p className="text-sm text-slate-500">{getFrequencyLabel(transfer.frequency)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Next: {formatDate(transfer.next_execution)}</span>
                      </div>
                      {transfer.last_execution && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Last: {formatDate(transfer.last_execution)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {transfer.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(transfer.id, 'paused')}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      ) : transfer.status === 'paused' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(transfer.id, 'active')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      ) : null}
                      {transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleUpdateStatus(transfer.id, 'cancelled')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}