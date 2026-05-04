'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getSupabaseClient } from '@/lib/supabase/client'
import { investmentService, InvestmentProduct, UserInvestment } from '@/lib/investment/investment.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TrendingUp, Shield, Wallet, ArrowRight, CheckCircle } from 'lucide-react'

const RISK_COLORS = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
}

export default function InvestPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<InvestmentProduct[]>([])
  const [investments, setInvestments] = useState<UserInvestment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<InvestmentProduct | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [investing, setInvesting] = useState(false)

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

    const [productsData, investmentsData] = await Promise.all([
      investmentService.getInvestmentProducts(),
      investmentService.getUserInvestments(user.id),
    ])

    setProducts(productsData)
    setInvestments(investmentsData)
    setLoading(false)
  }

  const handleInvest = async () => {
    if (!selectedProduct) return

    const amount = parseFloat(investmentAmount)
    if (isNaN(amount) || amount < selectedProduct.min_investment) {
      toast.error(`Minimum investment is ${formatCurrency(selectedProduct.min_investment)}`)
      return
    }
    if (amount > selectedProduct.max_investment) {
      toast.error(`Maximum investment is ${formatCurrency(selectedProduct.max_investment)}`)
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setInvesting(true)
    try {
      const result = await investmentService.createInvestment(user.id, selectedProduct.id, amount)
      if (result.success) {
        toast.success('Investment created successfully!')
        setSelectedProduct(null)
        setInvestmentAmount('')
        fetchData()
      } else {
        toast.error(result.error || 'Failed to create investment')
      }
    } catch (error) {
      toast.error('Failed to create investment')
    } finally {
      setInvesting(false)
    }
  }

  const handleWithdraw = async (investmentId: string) => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const result = await investmentService.withdrawInvestment(user.id, investmentId)
    if (result.success) {
      toast.success('Investment withdrawn successfully!')
      fetchData()
    } else {
      toast.error(result.error || 'Failed to withdraw')
    }
  }

  const calculateProgress = (investment: UserInvestment) => {
    const start = new Date(investment.start_date).getTime()
    const end = new Date(investment.maturity_date).getTime()
    const now = Date.now()
    const total = end - start
    const elapsed = now - start
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
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
    { id: 'products', label: 'Investment Plans', icon: TrendingUp },
    { id: 'portfolio', label: 'My Portfolio', icon: Wallet },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Investments</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Grow your wealth with our investment products
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

        {/* Investment Plans Content */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className={`w-2 h-2 rounded-full ${RISK_COLORS[product.risk_level]} mt-2`} />
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">+{product.expected_return}%</p>
                      <p className="text-xs text-slate-500">expected return</p>
                    </div>
                  </div>
                  <CardTitle className="mt-2">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Minimum</span>
                      <span className="font-medium">{formatCurrency(product.min_investment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Maximum</span>
                      <span className="font-medium">{formatCurrency(product.max_investment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-medium">{product.duration_days} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Risk Level</span>
                      <Badge className={RISK_COLORS[product.risk_level]}>
                        {product.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setSelectedProduct(product)}>
                        Invest Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* My Portfolio Content */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {investments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Wallet className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <h3 className="text-lg font-semibold mb-2">No Investments Yet</h3>
                  <p className="text-slate-500 mb-4">Start investing to grow your wealth</p>
                  <Button onClick={() => setActiveTab('products')}>
                    Explore Investment Plans
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {investments.map((investment) => (
                  <Card key={investment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{investment.product_name}</CardTitle>
                          <CardDescription>
                            Started: {formatDate(investment.start_date)}
                          </CardDescription>
                        </div>
                        <Badge className={investment.status === 'active' ? 'bg-green-500' : 'bg-slate-500'}>
                          {investment.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Principal</p>
                          <p className="text-xl font-bold">{formatCurrency(investment.amount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Expected Return</p>
                          <p className="text-xl font-bold text-green-600">
                            +{formatCurrency(investment.expected_return_amount)}
                          </p>
                        </div>
                      </div>

                      {investment.status === 'active' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Progress</span>
                            <span className="text-slate-500">
                              {formatDate(investment.start_date)} → {formatDate(investment.maturity_date)}
                            </span>
                          </div>
                          <Progress value={calculateProgress(investment)} className="h-2" />
                        </div>
                      )}

                      {investment.status === 'active' && new Date(investment.maturity_date) <= new Date() && (
                        <Button
                          onClick={() => handleWithdraw(investment.id)}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Withdraw Investment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Investment Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invest in {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Enter the amount you want to invest
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount (₦)</Label>
                <Input
                  type="number"
                  placeholder={`Minimum ${formatCurrency(selectedProduct.min_investment)}`}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Min: {formatCurrency(selectedProduct.min_investment)} • 
                  Max: {formatCurrency(selectedProduct.max_investment)} • 
                  Duration: {selectedProduct.duration_days} days
                </p>
              </div>

              {parseFloat(investmentAmount) >= selectedProduct.min_investment && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Projected Returns</p>
                  <div className="flex justify-between text-sm">
                    <span>Principal</span>
                    <span>{formatCurrency(parseFloat(investmentAmount))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Return ({selectedProduct.expected_return}%)</span>
                    <span className="text-green-600">
                      +{formatCurrency(parseFloat(investmentAmount) * selectedProduct.expected_return / 100)}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total After {selectedProduct.duration_days} Days</span>
                    <span>
                      {formatCurrency(parseFloat(investmentAmount) * (1 + selectedProduct.expected_return / 100))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleInvest} disabled={investing}>
              {investing ? 'Processing...' : 'Invest Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}