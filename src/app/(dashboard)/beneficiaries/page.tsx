'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { beneficiaryService, Beneficiary } from '@/lib/beneficiary/beneficiary.service'
import { formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, StarOff, Trash2, Plus, User, Building2, Search, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const BANKS = [
  { code: '001', name: 'GTBank' },
  { code: '002', name: 'Zenith Bank' },
  { code: '003', name: 'Access Bank' },
  { code: '004', name: 'First Bank' },
  { code: '005', name: 'UBA' },
  { code: '006', name: 'FCMB' },
  { code: '007', name: 'Stanbic IBTC' },
  { code: '008', name: 'Union Bank' },
  { code: '009', name: 'Polaris Bank' },
  { code: '010', name: 'Wema Bank' },
]

export default function BeneficiariesPage() {
  const router = useRouter()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [adding, setAdding] = useState(false)
  const [formData, setFormData] = useState({
    account_number: '',
    bank_code: '',
    account_name: '',
    nickname: '',
  })
  const [verifiedName, setVerifiedName] = useState('')

  useEffect(() => {
    fetchBeneficiaries()
  }, [])

  const fetchBeneficiaries = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const beneficiariesList = await beneficiaryService.getBeneficiaries(user.id)
    setBeneficiaries(beneficiariesList)
    setLoading(false)
  }

  const handleVerifyAccount = async () => {
    if (!formData.account_number || !formData.bank_code) {
      toast.error('Please enter account number and select bank')
      return
    }

    setVerifying(true)
    try {
      const result = await beneficiaryService.verifyAccount(
        formData.account_number,
        formData.bank_code
      )
      if (result.success && result.accountName) {
        setVerifiedName(result.accountName)
        setFormData(prev => ({ ...prev, account_name: result.accountName! }))
        toast.success('Account verified successfully')
      } else {
        toast.error(result.error || 'Verification failed')
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const handleAddBeneficiary = async () => {
    if (!formData.account_number || !formData.bank_code || !formData.account_name) {
      toast.error('Please fill all required fields')
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setAdding(true)
    try {
      const bank = BANKS.find(b => b.code === formData.bank_code)
      const result = await beneficiaryService.addBeneficiary(user.id, {
        account_number: formData.account_number,
        bank_name: bank?.name || '',
        bank_code: formData.bank_code,
        account_name: formData.account_name,
        nickname: formData.nickname || formData.account_name,
        is_favorite: false,
      })

      if (result.success) {
        toast.success('Beneficiary added successfully')
        setShowAddDialog(false)
        setFormData({
          account_number: '',
          bank_code: '',
          account_name: '',
          nickname: '',
        })
        setVerifiedName('')
        fetchBeneficiaries()
      } else {
        toast.error(result.error || 'Failed to add beneficiary')
      }
    } catch (error) {
      toast.error('Failed to add beneficiary')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleFavorite = async (beneficiary: Beneficiary) => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const result = await beneficiaryService.toggleFavorite(beneficiary.id, user.id)
    if (result.success) {
      toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites')
      fetchBeneficiaries()
    } else {
      toast.error(result.error || 'Failed to update')
    }
  }

  const handleDeleteBeneficiary = async (beneficiary: Beneficiary) => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (confirm(`Are you sure you want to delete ${beneficiary.nickname || beneficiary.account_name}?`)) {
      const result = await beneficiaryService.deleteBeneficiary(beneficiary.id, user.id)
      if (result.success) {
        toast.success('Beneficiary deleted')
        fetchBeneficiaries()
      } else {
        toast.error(result.error || 'Failed to delete')
      }
    }
  }

  const getBankName = (bankCode: string) => {
    return BANKS.find(b => b.code === bankCode)?.name || bankCode
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
            <h1 className="text-3xl font-bold">Beneficiaries</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your saved recipients for quick transfers
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Beneficiary
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Beneficiary</DialogTitle>
                <DialogDescription>
                  Enter the recipient's bank account details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Bank</Label>
                  <Select
                    value={formData.bank_code}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, bank_code: v, account_name: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANKS.map(bank => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="0123456789"
                      value={formData.account_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleVerifyAccount}
                      disabled={verifying || !formData.account_number || !formData.bank_code}
                    >
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                </div>
                {verifiedName && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Account Name: {verifiedName}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Nickname (Optional)</Label>
                  <Input
                    placeholder="e.g., Mom, John, Rent"
                    value={formData.nickname}
                    onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBeneficiary} disabled={adding || !verifiedName}>
                  {adding ? 'Adding...' : 'Add Beneficiary'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {beneficiaries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-12 w-12 mx-auto mb-3 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2">No Beneficiaries</h3>
              <p className="text-slate-500 mb-4">Add your first beneficiary for quick transfers</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Beneficiary
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Favorites Section */}
            {beneficiaries.filter(b => b.is_favorite).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  Favorites
                </h2>
                {beneficiaries.filter(b => b.is_favorite).map((beneficiary) => (
                  <BeneficiaryCard
                    key={beneficiary.id}
                    beneficiary={beneficiary}
                    getBankName={getBankName}
                    onToggleFavorite={() => handleToggleFavorite(beneficiary)}
                    onDelete={() => handleDeleteBeneficiary(beneficiary)}
                  />
                ))}
              </div>
            )}

            {/* All Beneficiaries */}
            {beneficiaries.filter(b => !b.is_favorite).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">All Beneficiaries</h2>
                {beneficiaries.filter(b => !b.is_favorite).map((beneficiary) => (
                  <BeneficiaryCard
                    key={beneficiary.id}
                    beneficiary={beneficiary}
                    getBankName={getBankName}
                    onToggleFavorite={() => handleToggleFavorite(beneficiary)}
                    onDelete={() => handleDeleteBeneficiary(beneficiary)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function BeneficiaryCard({
  beneficiary,
  getBankName,
  onToggleFavorite,
  onDelete,
}: {
  beneficiary: Beneficiary
  getBankName: (code: string) => string
  onToggleFavorite: () => void
  onDelete: () => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold">{beneficiary.nickname || beneficiary.account_name}</p>
            <p className="text-sm text-slate-500">{beneficiary.account_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">{getBankName(beneficiary.bank_code)}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-400">{beneficiary.account_number}</span>
              {beneficiary.transaction_count > 0 && (
                <>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400">{beneficiary.transaction_count} transfers</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onToggleFavorite}>
            {beneficiary.is_favorite ? (
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4 text-slate-400" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}