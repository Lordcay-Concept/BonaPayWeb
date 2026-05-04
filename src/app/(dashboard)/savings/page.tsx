'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getSupabaseClient } from '@/lib/supabase/client'
import { savingsService, SavingsProduct, UserSavings } from '@/lib/savings/savings.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { PiggyBank, TrendingUp, Calendar, Lock, ArrowRight, Wallet } from 'lucide-react'

export default function SavingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('active')
  const [products, setProducts] = useState<SavingsProduct[]>([])
  const [userSavings, setUserSavings] = useState<UserSavings[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<SavingsProduct | null>(null)
  const [amount, setAmount] = useState('')
  const [creating, setCreating] = useState(false)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const [productsData, savingsData] = await Promise.all([
      savingsService.getSavingsProducts(),
      savingsService.getUserSavings(user.id),
    ])

    setProducts(productsData)
    setUserSavings(savingsData)
    setLoading(false)
  }

  const handleCreateSavings = async () => {
    if (!selectedProduct || !amount) return

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < selectedProduct.minimum_balance) {
      toast.error(`Minimum amount is ${formatCurrency(selectedProduct.minimum_balance)}`)
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setCreating(true)
    try {
      const result = await savingsService.createSavings(user.id, {
        product_id: selectedProduct.id,
        amount: amountNum,
      })

      if (result.success) {
        toast.success('Savings plan created successfully!')
        setSelectedProduct(null)
        setAmount('')
        fetchData()
      } else {
        toast.error(result.error || 'Failed to create savings')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setCreating(false)
    }
  }

  const handleWithdraw = async (savingsId: string) => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setWithdrawing(savingsId)
    try {
      const result = await savingsService.withdrawSavings(user.id, savingsId)
      if (result.success) {
        toast.success('Savings withdrawn successfully!')
        fetchData()
      } else {
        toast.error(result.error || 'Failed to withdraw')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setWithdrawing(null)
    }
  }

  const calculateProgress = (savings: UserSavings) => {
    if (!savings.maturity_date) return 0
    const start = new Date(savings.start_date).getTime()
    const end = new Date(savings.maturity_date).getTime()
    const now = Date.now()
    const total = end - start
    const elapsed = now - start
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  const calculateProjectedReturn = (principal: number, rate: number, days: number | null) => {
    if (!days) return principal * (rate / 100)
    const yearlyInterest = principal * (rate / 100)
    return yearlyInterest * (days / 365)
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

  const tabs = [
    { id: 'active', label: 'Active Savings', icon: PiggyBank },
    { id: 'products', label: 'Savings Plans', icon: TrendingUp },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Savings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Grow your money with our savings plans
          </p>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Savings Content */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {userSavings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <PiggyBank className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <h3 className="text-lg font-semibold mb-2">No Active Savings</h3>
                  <p className="text-slate-500 mb-4">Start saving today and watch your money grow</p>
                  <Button onClick={() => setActiveTab('products')}>
                    Explore Savings Plans
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userSavings.map((savings) => (
                  <Card key={savings.id} className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{savings.product_name}</CardTitle>
                          <CardDescription>
                            Started {formatDate(savings.start_date)}
                          </CardDescription>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          savings.status === 'active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : savings.status === 'matured'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {savings.status === 'active' ? 'Active' : savings.status === 'matured' ? 'Matured' : 'Withdrawn'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Principal</p>
                          <p className="text-xl font-bold">{formatCurrency(savings.balance)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Interest Accrued</p>
                          <p className="text-xl font-bold text-green-600">
                            +{formatCurrency(savings.interest_accrued)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">Interest Rate</span>
                          <span className="font-medium">{savings.interest_rate}% p.a</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">Projected Total</span>
                          <span className="font-medium">
                            {formatCurrency(savings.balance + calculateProjectedReturn(
                              savings.balance, 
                              savings.interest_rate, 
                              savings.maturity_date ? Math.ceil((new Date(savings.maturity_date).getTime() - new Date(savings.start_date).getTime()) / (1000 * 60 * 60 * 24)) : null
                            ))}
                          </span>
                        </div>
                      </div>

                      {savings.maturity_date && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Progress</span>
                            <span className="text-slate-500">
                              {formatDate(savings.start_date)} → {formatDate(savings.maturity_date)}
                            </span>
                          </div>
                          <Progress value={calculateProgress(savings)} className="h-2" />
                          <p className="text-xs text-slate-500">
                            {calculateProgress(savings) === 100 ? 'Ready to withdraw!' : `Matures on ${formatDate(savings.maturity_date)}`}
                          </p>
                        </div>
                      )}

                      {savings.status === 'active' && (
                        <Button 
                          onClick={() => handleWithdraw(savings.id)} 
                          disabled={withdrawing === savings.id}
                          className="w-full"
                          variant="outline"
                        >
                          {withdrawing === savings.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                          ) : (
                            <>
                              <Wallet className="h-4 w-4 mr-2" />
                              Withdraw Savings
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Savings Plans Content */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                      <PiggyBank className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{product.interest_rate}%</p>
                      <p className="text-xs text-slate-500">p.a</p>
                    </div>
                  </div>
                  <CardTitle className="mt-4">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Minimum Balance</span>
                      <span className="font-medium">{formatCurrency(product.minimum_balance)}</span>
                    </div>
                    {product.duration_days && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Lock Period</span>
                        <span className="font-medium">{product.duration_days} days</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Projected Return (1 year)</span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(100000 * product.interest_rate / 100)}
                      </span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setSelectedProduct(product)}>
                        Start Saving
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Savings Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Enter the amount you want to save
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                placeholder={`Minimum ${formatCurrency(selectedProduct?.minimum_balance || 0)}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Minimum: {formatCurrency(selectedProduct?.minimum_balance || 0)}
              </p>
            </div>

            {selectedProduct && parseFloat(amount) >= selectedProduct.minimum_balance && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Projected Returns</p>
                <div className="flex justify-between text-sm">
                  <span>Principal</span>
                  <span>{formatCurrency(parseFloat(amount))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Interest ({selectedProduct.interest_rate}% p.a)</span>
                  <span className="text-green-600">
                    +{formatCurrency(parseFloat(amount) * selectedProduct.interest_rate / 100)}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total After 1 Year</span>
                  <span>{formatCurrency(parseFloat(amount) * (1 + selectedProduct.interest_rate / 100))}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSavings} disabled={creating}>
              {creating ? 'Creating...' : 'Start Saving'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}