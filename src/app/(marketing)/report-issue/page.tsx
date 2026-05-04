'use client';

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Upload, CheckCircle, Link } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function ReportIssuePage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    issueType: '',
    transactionId: '',
    amount: '',
    description: '',
    urgency: 'normal'
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success('Issue reported successfully! Our support team will contact you within 24 hours.')
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      issueType: '',
      transactionId: '',
      amount: '',
      description: '',
      urgency: 'normal'
    })
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-500 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Report an Issue
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-orange-100 max-w-3xl mx-auto"
          >
            We're here to help resolve any problems you're experiencing
          </motion.p>
        </div>
      </section>

      {/* Form Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <CardTitle>Issue Reporting Form</CardTitle>
                </div>
                <p className="text-sm text-slate-500">
                  Please provide as much detail as possible to help us resolve your issue quickly.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="issueType">Issue Type *</Label>
                      <Select value={formData.issueType} onValueChange={(value) => setFormData({ ...formData, issueType: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transaction">Transaction Issue</SelectItem>
                          <SelectItem value="login">Login/Access Issue</SelectItem>
                          <SelectItem value="transfer">Failed Transfer</SelectItem>
                          <SelectItem value="card">Card Issue</SelectItem>
                          <SelectItem value="bill">Bill Payment Issue</SelectItem>
                          <SelectItem value="account">Account Issue</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="transactionId">Transaction ID (if applicable)</Label>
                      <Input
                        id="transactionId"
                        value={formData.transactionId}
                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., TXN123456789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (if applicable)</Label>
                      <Input
                        id="amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="mt-1"
                        placeholder="₦"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description of Issue *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={5}
                      className="mt-1"
                      placeholder="Please describe the issue in detail, including any error messages you received..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Can wait 24-48 hours</SelectItem>
                        <SelectItem value="normal">Normal - Resolve within 24 hours</SelectItem>
                        <SelectItem value="high">High - Urgent, need same day</SelectItem>
                        <SelectItem value="critical">Critical - Emergency issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Drag and drop screenshots here or click to upload</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-orange-600 to-red-500">
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Support Options */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="mt-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Need immediate assistance? Call our support team at{' '}
              <Link href="tel:0800-BONAPAY" className="text-blue-600 font-semibold">
                0800-BONAPAY
              </Link>
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Support hours: Monday - Friday, 8AM - 8PM | Saturday, 9AM - 5PM
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}