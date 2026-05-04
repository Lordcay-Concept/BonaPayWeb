'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Smartphone, Shield, Zap, CheckCircle, ArrowRight, CreditCard, Send, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function SMSAlertsPage() {
  const alertTypes = [
    {
      icon: Send,
      title: "Transaction Alerts",
      description: "Get instant SMS notifications for all debits and credits on your account",
      benefits: ["Real-time transaction updates", "Fraud detection", "Payment confirmations"]
    },
    {
      icon: CreditCard,
      title: "Card Alerts",
      description: "Receive alerts for card transactions, ATM withdrawals, and POS payments",
      benefits: ["Card usage notifications", "Spending limits alerts", "Card block confirmations"]
    },
    {
      icon: Shield,
      title: "Security Alerts",
      description: "Instant notifications for login attempts, password changes, and suspicious activity",
      benefits: ["New device login alerts", "Failed login attempts", "Profile changes"]
    },
    {
      icon: Bell,
      title: "Bill Payment Reminders",
      description: "Never miss a payment with timely reminders for bills and subscriptions",
      benefits: ["Due date reminders", "Payment confirmations", "Recurring bill alerts"]
    }
  ]

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
            SMS Alert Service
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Stay informed about your account activity with real-time SMS notifications
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Overview */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Never Miss a Transaction
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Our SMS Alert Service keeps you connected to your finances 24/7. Get instant notifications 
              for every transaction, security event, and important update directly to your phone.
            </p>
          </motion.div>

          {/* Alert Types */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="grid md:grid-cols-2 gap-6 mb-12">
            {alertTypes.map((alert, index) => {
              const Icon = alert.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle>{alert.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{alert.description}</p>
                    <ul className="space-y-2">
                      {alert.benefits.map((benefit, i) => (
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
          </motion.div>

          {/* Pricing */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">Pricing</h2>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 text-center">
              <div className="inline-block bg-green-100 dark:bg-green-900/30 rounded-full px-4 py-2 mb-4">
                <span className="text-green-600 font-bold">FREE for all BonaPay users!</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                SMS Alerts are included at no additional cost for all active BonaPay accounts. 
                Standard SMS rates may apply from your mobile network provider.
              </p>
            </div>
          </motion.div>

          {/* How to Activate */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How to Activate SMS Alerts</h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold mb-1">Log into BonaPay App</h3>
                  <p className="text-slate-600 dark:text-slate-400">Open your BonaPay mobile application</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Go to Settings</h3>
                  <p className="text-slate-600 dark:text-slate-400">Navigate to Profile → Settings → Notifications</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Enable SMS Alerts</h3>
                  <p className="text-slate-600 dark:text-slate-400">Toggle on SMS notifications for the alerts you want to receive</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Confirm Your Phone Number</h3>
                  <p className="text-slate-600 dark:text-slate-400">Verify your registered phone number to start receiving alerts</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="font-semibold mb-1">Are SMS alerts really free?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Yes, BonaPay does not charge for SMS alerts. However, your mobile network may charge standard SMS rates.</p>
              </div>
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="font-semibold mb-1">Can I customize which alerts I receive?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Yes, you can choose which transaction types trigger SMS notifications in your app settings.</p>
              </div>
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="font-semibold mb-1">What if I change my phone number?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update your phone number in the app profile section. SMS alerts will automatically route to your new number.</p>
              </div>
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="font-semibold mb-1">I'm not receiving SMS alerts. What should I do?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Check that SMS alerts are enabled in settings, verify your phone number is correct, and ensure you have network coverage.</p>
              </div>
            </div>
          </motion.div>

         
        </div>
      </div>
    </div>
  )
}