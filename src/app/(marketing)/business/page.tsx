'use client';
import { useDownloadModal } from '@/hooks/useDownloadModal'
import { DownloadModal } from '@/components/DownloadModal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, Building2, Users, Send, Receipt, 
  CreditCard, TrendingUp, Shield, Clock, CheckCircle,
  BarChart, Wallet, Globe, Zap, FileText, Settings
} from 'lucide-react'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

 
export default function BusinessPage() {
  const businessFeatures = [
    {
      icon: Send,
      title: "Bulk Payments",
      description: "Pay multiple beneficiaries at once with our batch transfer feature",
      benefits: ["Pay salaries", "Vendor payments", "Supplier settlements"]
    },
    {
      icon: Receipt,
      title: "Business Invoicing",
      description: "Create and send professional invoices to your clients",
      benefits: ["Custom branding", "Payment tracking", "Auto reminders"]
    },
    {
      icon: CreditCard,
      title: "Business Cards",
      description: "Corporate cards for your team with spending controls",
      benefits: ["Set spending limits", "Real-time tracking", "Expense categorization"]
    },
    {
      icon: BarChart,
      title: "Business Analytics",
      description: "Track your business performance with detailed insights",
      benefits: ["Sales reports", "Expense tracking", "Cash flow analysis"]
    },
    {
      icon: Globe,
      title: "Payment Gateway",
      description: "Accept payments from customers via multiple channels",
      benefits: ["Web checkout", "Payment links", "QR code payments"]
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Add team members with role-based access controls",
      benefits: ["Multi-user access", "Permission settings", "Activity audit"]
    }
  ]

  const pricingPlans = [
    { name: "Starter", price: "Free", features: ["Up to ₦500k monthly volume", "Basic analytics", "Email support"], popular: false },
    { name: "Business", price: "₦5,000/month", features: ["Up to ₦5M monthly volume", "Advanced analytics", "Priority support", "API access"], popular: true },
    { name: "Enterprise", price: "Custom", features: ["Unlimited volume", "Dedicated account manager", "24/7 phone support", "Custom integration"], popular: false }
  ]

  const { isOpen, showDownloadModal, hideDownloadModal } = useDownloadModal()

  const handleGetStarted = () => {
    // Show download modal instead of going to signup
    showDownloadModal()
  }

  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Business Banking
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Powerful banking tools to help your business grow and thrive
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features Grid */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Everything Your Business Needs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow group">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.div>

        {/* Pricing Plans */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12">
            Choose the plan that's right for your business
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600 mt-2">{plan.price}</div>
                  <p className="text-sm text-slate-500">billed monthly</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full mt-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'variant-outline'}`}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Benefits for Business */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-6">Why Businesses Trust BonaPay</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <Shield className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Secure</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Bank-grade security for all transactions</p>
            </div>
            <div className="text-center">
              <Zap className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Fast</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Instant settlements and transfers</p>
            </div>
            <div className="text-center">
              <Clock className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Dedicated business support team</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Scalable</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Grows with your business</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center">
          <button
                      onClick={handleGetStarted}
                      className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Start your Business Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
          <p className="text-sm text-slate-500 mt-4">Free business account setup • No hidden fees</p>
        </motion.div>
      </div>
    </div>
  )
}