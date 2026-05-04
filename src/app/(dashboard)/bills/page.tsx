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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Zap, Phone, Wifi, Tv, Gamepad, CheckCircle, ArrowRight } from 'lucide-react'

// Network logos as simple emoji/icon placeholders (in production, use actual image URLs)
const NETWORK_LOGOS: Record<string, string> = {
  mtn: '📱 MTN',
  airtel: '📱 Airtel',
  glo: '📱 Glo',
  '9mobile': '📱 9mobile',
}

export default function BillsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('electricity')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [networks, setNetworks] = useState<any[]>([])
  const [electricityProviders, setElectricityProviders] = useState<any[]>([])
  const [cableProviders, setCableProviders] = useState<any[]>([])
  const [cablePackages, setCablePackages] = useState<any[]>([])
  const [bettingPlatforms, setBettingPlatforms] = useState<any[]>([])
  const [dataBundles, setDataBundles] = useState<any[]>([])

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
  const [detectedNetwork, setDetectedNetwork] = useState<any>(null)

  // Data state
  const [dataPhone, setDataPhone] = useState('')
  const [dataNetwork, setDataNetwork] = useState('')
  const [dataBundle, setDataBundle] = useState('')
  const [dataAmount, setDataAmount] = useState(0)

  // Cable TV state
  const [cableProvider, setCableProvider] = useState('')
  const [smartCardNumber, setSmartCardNumber] = useState('')
  const [cablePackage, setCablePackage] = useState('')
  const [cableAmount, setCableAmount] = useState(0)

  // Betting state
  const [bettingPlatform, setBettingPlatform] = useState('')
  const [bettingPhone, setBettingPhone] = useState('')
  const [bettingAmount, setBettingAmount] = useState('')

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    if (dataNetwork) {
      fetchDataBundles()
    }
  }, [dataNetwork])

  useEffect(() => {
    if (cableProvider) {
      fetchCablePackages()
    }
  }, [cableProvider])

  const fetchProviders = async () => {
    const [providers, nets, cableProvs, betting] = await Promise.all([
      billService.getElectricityProviders(),
      billService.getNetworks(),
      billService.getCableProviders(),
      billService.getBettingPlatforms(),
    ])
    setElectricityProviders(providers)
    setNetworks(nets)
    setCableProviders(cableProvs)
    setBettingPlatforms(betting)
  }

  const fetchDataBundles = async () => {
    const bundles = await billService.getDataBundles(dataNetwork)
    setDataBundles(bundles)
  }

  const fetchCablePackages = async () => {
    const packages = await billService.getCablePackages(cableProvider)
    setCablePackages(packages)
  }

  const handlePhoneNumberChange = async (phone: string) => {
    setAirtimePhone(phone)
    if (phone.length >= 4) {
      const network = await billService.detectNetwork(phone)
      if (network) {
        setDetectedNetwork(network)
        setAirtimeNetwork(network.code)
      } else {
        setDetectedNetwork(null)
        setAirtimeNetwork('')
      }
    }
  }

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
      provider: electricityProviders.find(p => p.code === electricityProvider)?.name,
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
      network: networks.find(n => n.code === airtimeNetwork)?.name,
      amount,
    })
    setShowConfirm(true)
  }

  const handleDataPayment = async () => {
    if (!dataPhone || !dataNetwork || !dataBundle) {
      toast.error('Please fill all fields')
      return
    }

    if (dataPhone.length !== 11) {
      toast.error('Please enter a valid 11-digit phone number')
      return
    }

    const bundle = dataBundles.find(b => b.id === dataBundle)
    setPaymentDetails({
      type: 'data',
      phoneNumber: dataPhone,
      network: networks.find(n => n.code === dataNetwork)?.name,
      bundleName: bundle?.name,
      amount: dataAmount,
    })
    setShowConfirm(true)
  }

  const handleCablePayment = async () => {
    if (!cableProvider || !smartCardNumber || !cablePackage) {
      toast.error('Please fill all fields')
      return
    }

    const pkg = cablePackages.find(p => p.id === cablePackage)
    setPaymentDetails({
      type: 'cable',
      provider: cableProviders.find(p => p.code === cableProvider)?.name,
      smartCardNumber,
      packageName: pkg?.name,
      amount: cableAmount,
    })
    setShowConfirm(true)
  }

  const handleBettingPayment = async () => {
    if (!bettingPlatform || !bettingPhone || !bettingAmount) {
      toast.error('Please fill all fields')
      return
    }

    const amount = parseFloat(bettingAmount)
    if (isNaN(amount) || amount < 100) {
      toast.error('Please enter a valid amount (minimum ₦100)')
      return
    }

    setPaymentDetails({
      type: 'betting',
      platform: bettingPlatforms.find(p => p.code === bettingPlatform)?.name,
      phoneNumber: bettingPhone,
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
            network: paymentDetails.network?.toLowerCase(),
          })
          break
        case 'data':
          result = await billService.buyData(user.id, {
            phoneNumber: paymentDetails.phoneNumber,
            amount: paymentDetails.amount,
            dataPlan: paymentDetails.bundleName,
            network: paymentDetails.network?.toLowerCase(),
          })
          break
        case 'cable':
          result = await billService.payCableTV(user.id, {
            smartCardNumber: paymentDetails.smartCardNumber,
            package: paymentDetails.packageName,
            amount: paymentDetails.amount,
            provider: paymentDetails.provider?.toLowerCase(),
          })
          break
       case 'betting':
  result = await billService.fundBettingAccount(user.id, {
    platformCode: bettingPlatform,
    phoneNumber: paymentDetails.phoneNumber,
    amount: paymentDetails.amount,
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
          setDetectedNetwork(null)
        } else if (paymentDetails.type === 'data') {
          setDataPhone('')
          setDataNetwork('')
          setDataBundle('')
          setDataAmount(0)
        } else if (paymentDetails.type === 'cable') {
          setCableProvider('')
          setSmartCardNumber('')
          setCablePackage('')
          setCableAmount(0)
        } else if (paymentDetails.type === 'betting') {
          setBettingPlatform('')
          setBettingPhone('')
          setBettingAmount('')
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

  const tabs = [
    { id: 'electricity', label: 'Electricity', icon: Zap },
    { id: 'airtime', label: 'Airtime', icon: Phone },
    { id: 'data', label: 'Data', icon: Wifi },
    { id: 'cable', label: 'Cable TV', icon: Tv },
    { id: 'betting', label: 'Betting', icon: Gamepad },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Bill Payments</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Pay electricity bills, buy airtime, data, cable TV, and fund betting accounts
          </p>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
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

        {/* Electricity Tab */}
        {activeTab === 'electricity' && (
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
                    {electricityProviders.map(provider => (
                      <SelectItem key={provider.code} value={provider.code}>
                        {provider.name} {provider.region ? `(${provider.region})` : ''}
                      </SelectItem>
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
        )}

        {/* Airtime Tab */}
        {activeTab === 'airtime' && (
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
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                />
                {detectedNetwork && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Detected: {detectedNetwork.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Network</Label>
                <Select value={airtimeNetwork} onValueChange={setAirtimeNetwork}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map(network => (
                      <SelectItem key={network.code} value={network.code}>
                        {NETWORK_LOGOS[network.code] || network.name}
                      </SelectItem>
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
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
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
                    {networks.map(network => (
                      <SelectItem key={network.code} value={network.code}>
                        {NETWORK_LOGOS[network.code] || network.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {dataNetwork && (
                <div className="space-y-2">
                  <Label>Data Bundle</Label>
                  <Select value={dataBundle} onValueChange={(val) => {
                    setDataBundle(val)
                    const bundle = dataBundles.find(b => b.id === val)
                    if (bundle) setDataAmount(bundle.price)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataBundles.map(bundle => (
                        <SelectItem key={bundle.id} value={bundle.id}>
                          {bundle.name} - {formatCurrency(bundle.price)} ({bundle.validity_days} days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {dataAmount > 0 && (
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-sm">Amount to pay: {formatCurrency(dataAmount)}</p>
                </div>
              )}

              <Button onClick={handleDataPayment} className="w-full">
                Buy Data
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cable TV Tab */}
        {activeTab === 'cable' && (
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
                    {cableProviders.map(provider => (
                      <SelectItem key={provider.code} value={provider.code}>
                        {provider.name}
                      </SelectItem>
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

              {cableProvider && (
                <div className="space-y-2">
                  <Label>Package</Label>
                  <Select value={cablePackage} onValueChange={(val) => {
                    setCablePackage(val)
                    const pkg = cablePackages.find(p => p.id === val)
                    if (pkg) setCableAmount(pkg.price)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      {cablePackages.map(pkg => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - {formatCurrency(pkg.price)} {pkg.channels ? `(${pkg.channels} channels)` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {cableAmount > 0 && (
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-sm">Amount to pay: {formatCurrency(cableAmount)}</p>
                </div>
              )}

              <Button onClick={handleCablePayment} className="w-full">
                Pay Cable TV
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Betting Tab */}
        {activeTab === 'betting' && (
          <Card>
            <CardHeader>
              <CardTitle>Fund Betting Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Betting Platform</Label>
                <Select value={bettingPlatform} onValueChange={setBettingPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select betting platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {bettingPlatforms.map(platform => (
                      <SelectItem key={platform.code} value={platform.code}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phone Number / User ID</Label>
                <Input
                  placeholder="Enter your registered phone number"
                  value={bettingPhone}
                  onChange={(e) => setBettingPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Amount (₦)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={bettingAmount}
                  onChange={(e) => setBettingAmount(e.target.value)}
                />
                <p className="text-xs text-slate-500">Minimum: ₦100</p>
              </div>

              <Button onClick={handleBettingPayment} className="w-full">
                Fund Account
              </Button>
            </CardContent>
          </Card>
        )}
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
                    <p><strong>Network:</strong> {paymentDetails.network}</p>
                    <p><strong>Amount:</strong> {formatCurrency(paymentDetails.amount)}</p>
                  </>
                )}
                {paymentDetails.type === 'data' && (
                  <>
                    <p><strong>Phone:</strong> {paymentDetails.phoneNumber}</p>
                    <p><strong>Network:</strong> {paymentDetails.network}</p>
                    <p><strong>Plan:</strong> {paymentDetails.bundleName}</p>
                    <p><strong>Amount:</strong> {formatCurrency(paymentDetails.amount)}</p>
                  </>
                )}
                {paymentDetails.type === 'cable' && (
                  <>
                    <p><strong>Provider:</strong> {paymentDetails.provider}</p>
                    <p><strong>Smart Card:</strong> {paymentDetails.smartCardNumber}</p>
                    <p><strong>Package:</strong> {paymentDetails.packageName}</p>
                    <p><strong>Amount:</strong> {formatCurrency(paymentDetails.amount)}</p>
                  </>
                )}
                {paymentDetails.type === 'betting' && (
                  <>
                    <p><strong>Platform:</strong> {paymentDetails.platform}</p>
                    <p><strong>Phone:</strong> {paymentDetails.phoneNumber}</p>
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