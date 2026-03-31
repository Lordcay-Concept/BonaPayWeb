'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getSupabaseClient } from '@/lib/supabase/client'
import { billService } from '@/lib/bills/bill.service'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Zap, Phone, Wifi, Tv, CheckCircle, Loader2 } from 'lucide-react'

const ELECTRICITY_PROVIDERS = ['IKEDC', 'Eko Electric', 'Abuja Disco', 'PHCN']
const NETWORKS = ['mtn', 'glo', 'airtel', '9mobile']
const DATA_PLANS = [
  { name: '500MB - 1GB', amount: 500 },
  { name: '1GB - 2GB', amount: 1000 },
  { name: '3GB', amount: 1500 },
  { name: '5GB', amount: 2500 },
  { name: '10GB', amount: 5000 },
]
const CABLE_PROVIDERS = ['dstv', 'gotv', 'startimes']
const DSTV_PACKAGES = ['DStv Premium', 'DStv Compact+', 'DStv Compact', 'DStv Family']
const GOTV_PACKAGES = ['GOtv Max', 'GOtv Plus', 'GOtv Value', 'GOtv Lite']

export default function BillsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('electricity')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  // Electricity state
  const [electricityProvider, setElectricityProvider] = useState('')
  const [meterNumber, setMeterNumber] = useState('')
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid')
  const [electricityAmount, setElectricityAmount] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifiedName, setVerifiedName] = useState('')

  // Airtime state
  const [airtimePhone, setAirtimePhone] = useState('')
  const [airtimeNetwork, setAirtimeNetwork] = useState('')
  const [airtimeAmount, setAirtimeAmount] = useState('')

  // Data state
  const [dataPhone, setDataPhone] = useState('')
  const [dataNetwork, setDataNetwork] = useState('')
  const [dataPlan, setDataPlan] = useState('')
  const [dataAmount, setDataAmount] = useState(0)

  // Cable TV state
  const [cableProvider, setCableProvider] = useState('')
  const [smartCardNumber, setSmartCardNumber] = useState('')
  const [cablePackage, setCablePackage] = useState('')
  const [cableAmount, setCableAmount] = useState('')

  useEffect(() => {
    // Update data amount when plan changes
    const plan = DATA_PLANS.find(p => p.name === dataPlan)
    if (plan) {
      setDataAmount(plan.amount)
    }
  }, [dataPlan])

  const verifyElectricityMeter = async () => {
    if (!meterNumber || !electricityProvider) {
      toast.error('Please enter meter number and select provider')
      return
    }

    setVerifying(true)
    try {
      const result = await billService.verifyElectricityMeter(meterNumber, electricityProvider)
      if (result.success) {
        setVerifiedName(result.customerName || 'Customer')
        toast.success('Meter verified successfully')
      } else {
        toast.error(result.error || 'Verification failed')
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const handleElectricityPayment = async () => {
    if (!electricityProvider || !meterNumber || !electricityAmount) {
      toast.error('Please fill all fields')
      return
    }

    const amount = parseFloat(electricityAmount)
    if (isNaN(amount) || amount < 100) {
      toast.error('Please enter a valid amount (minimum ₦100)')
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    setPaymentDetails({
      type: 'electricity',
      provider: electricityProvider,
      meterNumber,
      meterType,
      amount,
      customerName: verifiedName || 'Customer',
    })
    setShowConfirm(true)
  }

  const handleAirtimePayment = async () => {
    if (!airtimePhone || !airtimeNetwork || !airtimeAmount) {
      toast.error('Please fill all fields')
      return
    }

    const amount = parseFloat(airtimeAmount)
    if (isNaN(amount) || amount < 50) {
      toast.error('Please enter a valid amount (minimum ₦50)')
      return
    }

    if (airtimePhone.length !== 11) {
      toast.error('Please enter a valid 11-digit phone number')
      return
    }

    setPaymentDetails({
      type: 'airtime',
      phoneNumber: airtimePhone,
      network: airtimeNetwork,
      amount,
    })
    setShowConfirm(true)
  }

  const handleDataPayment = async () => {
    if (!dataPhone || !dataNetwork || !dataPlan) {
      toast.error('Please fill all fields')
      return
    }

    if (dataPhone.length !== 11) {
      toast.error('Please enter a valid 11-digit phone number')
      return
    }

    setPaymentDetails({
      type: 'data',
      phoneNumber: dataPhone,
      network: dataNetwork,
      dataPlan,
      amount: dataAmount,
    })
    setShowConfirm(true)
  }

  const handleCablePayment = async () => {
    if (!cableProvider || !smartCardNumber || !cablePackage || !cableAmount) {
      toast.error('Please fill all fields')
      return
    }

    const amount = parseFloat(cableAmount)
    if (isNaN(amount) || amount < 500) {
      toast.error('Please enter a valid amount')
      return
    }

    setPaymentDetails({
      type: 'cable',
      provider: cableProvider,
      smartCardNumber,
      package: cablePackage,
      amount,
    })
    setShowConfirm(true)
  }

  const confirmPayment = async () => {
    if (!paymentDetails) return

    setLoading(true)
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    try {
      let result
      switch (paymentDetails.type) {
        case 'electricity':
          result = await billService.payElectricity(user.id, {
            meterNumber: paymentDetails.meterNumber,
            meterType: paymentDetails.meterType,
            amount: paymentDetails.amount,
            provider: paymentDetails.provider,
          })
          break
        case 'airtime':
          result = await billService.buyAirtime(user.id, {
            phoneNumber: paymentDetails.phoneNumber,
            amount: paymentDetails.amount,
            network: paymentDetails.network,
          })
          break
        case 'data':
          result = await billService.buyData(user.id, {
            phoneNumber: paymentDetails.phoneNumber,
            amount: paymentDetails.amount,
            dataPlan: paymentDetails.dataPlan,
            network: paymentDetails.network,
          })
          break
        case 'cable':
          result = await billService.payCableTV(user.id, {
            smartCardNumber: paymentDetails.smartCardNumber,
            package: paymentDetails.package,
            amount: paymentDetails.amount,
            provider: paymentDetails.provider,
          })
          break
      }

      if (result?.success) {
        toast.success('Payment successful!')
        setShowConfirm(false)
        // Reset forms
        if (paymentDetails.type === 'electricity') {
          setElectricityProvider('')
          setMeterNumber('')
          setElectricityAmount('')
          setVerifiedName('')
        } else if (paymentDetails.type === 'airtime') {
          setAirtimePhone('')
          setAirtimeNetwork('')
          setAirtimeAmount('')
        } else if (paymentDetails.type === 'data') {
          setDataPhone('')
          setDataNetwork('')
          setDataPlan('')
        } else if (paymentDetails.type === 'cable') {
          setCableProvider('')
          setSmartCardNumber('')
          setCablePackage('')
          setCableAmount('')
        }
      } else {
        toast.error(result?.error || 'Payment failed')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Bill Payments</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Pay electricity bills, buy airtime, data, and cable TV subscriptions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="electricity" className="gap-2">
              <Zap className="h-4 w-4" />
              Electricity
            </TabsTrigger>
            <TabsTrigger value="airtime" className="gap-2">
              <Phone className="h-4 w-4" />
              Airtime
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Wifi className="h-4 w-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="cable" className="gap-2">
              <Tv className="h-4 w-4" />
              Cable TV
            </TabsTrigger>
          </TabsList>

          {/* Electricity Tab */}
          <TabsContent value="electricity">
            <Card>
              <CardHeader>
                <CardTitle>Electricity Bill Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select value={electricityProvider} onValueChange={setElectricityProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select electricity provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {ELECTRICITY_PROVIDERS.map(provider => (
                        <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Meter Number</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter meter number"
                      value={meterNumber}
                      onChange={(e) => setMeterNumber(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={verifyElectricityMeter} disabled={verifying}>
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Meter Type</Label>
                  <Select value={meterType} onValueChange={(v: any) => setMeterType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meter type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prepaid">Prepaid</SelectItem>
                      <SelectItem value="postpaid">Postpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {verifiedName && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Customer: {verifiedName}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Amount (₦)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={electricityAmount}
                    onChange={(e) => setElectricityAmount(e.target.value)}
                  />
                </div>

                <Button onClick={handleElectricityPayment} className="w-full">
                  Pay Electricity Bill
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Airtime Tab */}
          <TabsContent value="airtime">
            <Card>
              <CardHeader>
                <CardTitle>Buy Airtime</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="08012345678"
                    value={airtimePhone}
                    onChange={(e) => setAirtimePhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Network</Label>
                  <Select value={airtimeNetwork} onValueChange={setAirtimeNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      {NETWORKS.map(network => (
                        <SelectItem key={network} value={network}>{network.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount (₦)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={airtimeAmount}
                    onChange={(e) => setAirtimeAmount(e.target.value)}
                  />
                </div>

                <Button onClick={handleAirtimePayment} className="w-full">
                  Buy Airtime
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Buy Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="08012345678"
                    value={dataPhone}
                    onChange={(e) => setDataPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Network</Label>
                  <Select value={dataNetwork} onValueChange={setDataNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      {NETWORKS.map(network => (
                        <SelectItem key={network} value={network}>{network.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Plan</Label>
                  <Select value={dataPlan} onValueChange={setDataPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_PLANS.map(plan => (
                        <SelectItem key={plan.name} value={plan.name}>
                          {plan.name} - {formatCurrency(plan.amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {dataPlan && (
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-sm">Amount to pay: {formatCurrency(dataAmount)}</p>
                  </div>
                )}

                <Button onClick={handleDataPayment} className="w-full">
                  Buy Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cable TV Tab */}
          <TabsContent value="cable">
            <Card>
              <CardHeader>
                <CardTitle>Cable TV Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select value={cableProvider} onValueChange={setCableProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {CABLE_PROVIDERS.map(provider => (
                        <SelectItem key={provider} value={provider}>{provider.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Smart Card Number (IUC)</Label>
                  <Input
                    placeholder="Enter smart card number"
                    value={smartCardNumber}
                    onChange={(e) => setSmartCardNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Package</Label>
                  <Select value={cablePackage} onValueChange={setCablePackage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      {(cableProvider === 'dstv' ? DSTV_PACKAGES : GOTV_PACKAGES).map(pkg => (
                        <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount (₦)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={cableAmount}
                    onChange={(e) => setCableAmount(e.target.value)}
                  />
                </div>

                <Button onClick={handleCablePayment} className="w-full">
                  Pay Cable TV
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Please confirm your payment details
            </DialogDescription>
          </DialogHeader>
          {paymentDetails && (
            <div className="space-y-3 py-4">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                <p className="text-sm text-slate-500">Payment Details</p>
                {paymentDetails.type === 'electricity' && (
                  <>
                    <p><strong>Provider:</strong> {paymentDetails.provider}</p>
                    <p><strong>Meter Number:</strong> {paymentDetails.meterNumber}</p>
                    <p><strong>Customer:</strong> {paymentDetails.customerName}</p>
                    <p><strong>Amount:</strong> {formatCurrency(paymentDetails.amount)}</p>
                  </>
                )}
                {paymentDetails.type === 'airtime' && (
                  <>
                    <p><strong>Phone:</strong> {paymentDetails.phoneNumber}</p>
                    <p><strong>Network:</strong> {paymentDetails.network.toUpperCase()}</p>
                    <p><strong>Amount:</strong> {formatCurrency(paymentDetails.amount)}</p>
                  </>
                )}
                {paymentDetails.type === 'data' && (
                  <>
                    <p><strong>Phone:</strong> {paymentDetails.phoneNumber}</p>
                    <p><strong>Network:</strong> {paymentDetails.network.toUpperCase()}</p>
                    <p><strong>Plan:</strong> {paymentDetails.dataPlan}</p>
                    <p><strong>Amount:</strong> {formatCurrency(paymentDetails.amount)}</p>
                  </>
                )}
                {paymentDetails.type === 'cable' && (
                  <>
                    <p><strong>Provider:</strong> {paymentDetails.provider.toUpperCase()}</p>
                    <p><strong>Smart Card:</strong> {paymentDetails.smartCardNumber}</p>
                    <p><strong>Package:</strong> {paymentDetails.package}</p>
                    <p><strong>Amount:</strong> {formatCurrency(paymentDetails.amount)}</p>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPayment} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}