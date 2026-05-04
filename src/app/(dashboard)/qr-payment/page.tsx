'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { qrService } from '@/lib/qr/qr.service'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QrCode, Download, Copy, Check, Camera, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QRPaymentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('generate')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [qrData, setQrData] = useState<string | null>(null)
  const [qrPaymentId, setQrPaymentId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [qrInput, setQrInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const handleGenerateQR = async () => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 1) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!description) {
      toast.error('Please enter a description')
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setGenerating(true)
    try {
      const result = await qrService.generateQRCode(user.id, amountNum, description)
      if (result.success && result.data) {
        setQrData(result.data.qr_code)
        setQrPaymentId(result.data.id)
        setShowQRDialog(true)
        toast.success('QR code generated successfully')
      } else {
        toast.error(result.error || 'Failed to generate QR code')
      }
    } catch (error) {
      toast.error('Failed to generate QR code')
    } finally {
      setGenerating(false)
    }
  }

  const handleScanAndPay = async () => {
    if (!qrInput) {
      toast.error('Please enter or scan QR code data')
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setProcessing(true)
    try {
      const result = await qrService.processQRPayment(qrInput, user.id)
      if (result.success) {
        toast.success('Payment successful!')
        setQrInput('')
      } else {
        toast.error(result.error || 'Payment failed')
      }
    } catch (error) {
      toast.error('Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const copyToClipboard = () => {
    if (qrData) {
      navigator.clipboard.writeText(qrData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Copied to clipboard')
    }
  }

  const downloadQR = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg')
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          const pngFile = canvas.toDataURL('image/png')
          const downloadLink = document.createElement('a')
          downloadLink.download = `qr-payment-${Date.now()}.png`
          downloadLink.href = pngFile
          downloadLink.click()
        }
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">QR Code Payments</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Generate QR codes to receive payments or scan to pay
          </p>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'generate' 
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <QrCode className="h-4 w-4 inline mr-2" />
              Generate QR
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'scan' 
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <Camera className="h-4 w-4 inline mr-2" />
              Scan & Pay
            </button>
          </div>
        </div>

        {/* Generate QR Content */}
        {activeTab === 'generate' && (
          <Card>
            <CardHeader>
              <CardTitle>Generate Payment QR Code</CardTitle>
              <CardDescription>
                Create a QR code that others can scan to pay you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What is this payment for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGenerateQR}
                disabled={generating || !amount || !description}
                className="w-full"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Scan & Pay Content */}
        {activeTab === 'scan' && (
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code to Pay</CardTitle>
              <CardDescription>
                Enter the QR code data or paste the scanned code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrInput">QR Code Data</Label>
                <Textarea
                  id="qrInput"
                  placeholder="Paste QR code data here..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-slate-500">
                  Paste the QR code data from the payment request
                </p>
              </div>
              <Button
                onClick={handleScanAndPay}
                disabled={processing || !qrInput}
                className="w-full"
              >
                {processing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="max-w-md text-center">
            <DialogHeader>
              <DialogTitle>Your QR Code</DialogTitle>
              <DialogDescription>
                Scan this QR code to pay {formatCurrency(parseFloat(amount) || 0)}
              </DialogDescription>
            </DialogHeader>
            <div ref={qrRef} className="flex justify-center p-4 bg-white rounded-lg">
              {qrData && (
                <QRCodeSVG
                  value={qrData}
                  size={200}
                  level="H"
                  includeMargin
                />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{description}</p>
              <p className="text-2xl font-bold">{formatCurrency(parseFloat(amount) || 0)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Data'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={downloadQR}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowQRDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}