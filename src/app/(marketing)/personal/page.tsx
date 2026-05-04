'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowRight, Zap, Shield, Smartphone, TrendingUp, 
  CreditCard, Clock, Gift, CheckCircle, Wallet, 
  Send, Receipt, PiggyBank, Sparkles, Users, Star
} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function PersonalPage() {
  const features = [
    {
      icon: Send,
      title: "Instant Money Transfers",
      description: "Send money to any bank in Nigeria instantly with zero delays",
      benefits: ["Free BonaPay to BonaPay transfers", "Low fees for other banks", "Send to 100+ banks"]
    },
    {
      icon: Receipt,
      title: "Bill Payments",
      description: "Pay all your bills from one app - electricity, airtime, data, cable TV",
      benefits: ["Save favorite payees", "Schedule recurring payments", "Payment reminders"]
    },
    {
      icon: CreditCard,
      title: "Virtual & Physical Cards",
      description: "Create virtual cards instantly or order a physical debit card",
      benefits: ["Free virtual cards", "Spending limits", "Instant freeze/unfreeze"]
    },
    {
      icon: PiggyBank,
      title: "High-Yield Savings",
      description: "Grow your money with competitive interest rates",
      benefits: ["Up to 15% annual interest", "Flexible deposits", "No hidden fees"]
    },
    {
      icon: TrendingUp,
      title: "Investment Opportunities",
      description: "Invest in treasury bills, bonds, and mutual funds",
      benefits: ["Low minimum investment", "Diversified portfolios", "Expert management"]
    },
    {
      icon: Gift,
      title: "Referral Rewards",
      description: "Earn up to ₦1,000 for every friend you refer",
      benefits: ["Unlimited referrals", "Instant cash rewards", "Bonus promotions"]
    }
  ]

  const accountTiers = [
    { tier: "Tier 1", limit: "₦50,000", requirements: "Phone number only", color: "bg-blue-100 text-blue-700" },
    { tier: "Tier 2", limit: "₦500,000", requirements: "BVN + Valid ID", color: "bg-green-100 text-green-700" },
    { tier: "Tier 3", limit: "₦5,000,000", requirements: "Full KYC + Utility bill", color: "bg-purple-100 text-purple-700" }
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
            Personal Banking
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Banking designed for your lifestyle. Simple, secure, and rewarding.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features Grid */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Everything You Need in One App
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
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

        {/* Account Tiers */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Choose Your Account Tier
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {accountTiers.map((tier, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle>{tier.tier}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{tier.limit}</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Daily Transaction Limit</p>
                  <Badge className={tier.color}>{tier.requirements}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-6">Why Choose BonaPay for Personal Banking?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Bank-Grade Security</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Your money is protected with 256-bit encryption and 2FA</p>
            </div>
            <div className="text-center">
              <Clock className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">24/7 Customer Support</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Get help anytime via live chat, phone, or email</p>
            </div>
            <div className="text-center">
              <Zap className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Instant Transactions</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Real-time processing for all your payments</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center">
          <Link href="/signup">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 text-lg px-8">
              Open Your Account Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-slate-500 mt-4">No minimum balance • No hidden fees</p>
        </motion.div>
      </div>
    </div>
  )
}