'use client';

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Shield, Zap, Wallet, Smartphone,
 TrendingUp, CreditCard, Clock, Star, CheckCircle, ChevronRight, 
 Users, Award, Globe, Lock, Sparkles, Gift, Send, Building2, FileText, 
 Headphones, Database, Cloud, AlertCircle, Phone, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function LearnMorePage() {
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
            Learn More About BonaPay
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Your complete guide to modern digital banking in Nigeria
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">What is BonaPay?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              BonaPay is a licensed digital bank in Nigeria, revolutionizing how Nigerians manage their finances. 
              We combine traditional banking services with modern technology to provide seamless, secure, and 
              accessible financial services to everyone, anywhere in Nigeria.
            </p>
          </motion.div>

          {/* How It Works */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How BonaPay Works</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Download & Sign Up</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Get the app from Play Store or App Store and create your account in minutes</p>
              </div>
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Verify Your Identity</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Complete your KYC with your BVN and valid ID for full account access</p>
              </div>
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Start Banking</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Send money, pay bills, and manage your finances instantly</p>
              </div>
            </div>
          </motion.div>

          {/* Features Deep Dive */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Key Features</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-semibold mb-2">Instant Money Transfers</h3>
                <p className="text-slate-600 dark:text-slate-400">Send money to any bank in Nigeria instantly. Our integration with NIBSS ensures real-time processing with zero delays. You can also send to other BonaPay users for free!</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-semibold mb-2">Bill Payments</h3>
                <p className="text-slate-600 dark:text-slate-400">Pay electricity bills, buy airtime and data, subscribe to cable TV (DSTV, GOtv, Startimes), and pay for other services directly from your app.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-semibold mb-2">Virtual & Physical Cards</h3>
                <p className="text-slate-600 dark:text-slate-400">Create virtual cards for secure online shopping instantly. Order a physical debit card for ATM withdrawals and POS payments at any location.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-semibold mb-2">Savings & Investments</h3>
                <p className="text-slate-600 dark:text-slate-400">Grow your money with our high-yield savings products and investment opportunities. Start saving from as low as ₦1,000 with competitive interest rates.</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-semibold mb-2">QR Code Payments</h3>
                <p className="text-slate-600 dark:text-slate-400">Make contactless payments at merchants by scanning QR codes. Fast, secure, and convenient for both customers and businesses.</p>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Security Measures</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">256-bit Encryption</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Bank-grade encryption for all your data and transactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Extra layer of security for account access</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Real-time Fraud Detection</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered system monitoring suspicious activities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Session Management</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Control and monitor all devices logged into your account</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Fees & Charges */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Transparent Fees</h2>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2">Service</th>
                    <th className="text-right py-2">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2">Account Opening</td>
                    <td className="text-right text-green-600">Free</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2">Money Transfer (BonaPay to BonaPay)</td>
                    <td className="text-right text-green-600">Free</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2">Money Transfer (Other Banks)</td>
                    <td className="text-right">₦10 - ₦52</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <td className="py-2">Bill Payments</td>
                    <td className="text-right">Free - ₦100</td>
                  </tr>
                  <tr>
                    <td className="py-2">Virtual Card Issuance</td>
                    <td className="text-right">Free</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Customer Support */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Customer Support</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Our dedicated support team is available 24/7 to assist you with any issues or questions. 
              Reach us through multiple channels for quick resolution.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Headphones className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold">Live Chat</p>
                <p className="text-sm text-slate-500">24/7 In-app chat</p>
              </div>
              <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold">Email</p>
                <p className="text-sm text-slate-500">support@bonapay.com</p>
              </div>
              <div className="text-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold">Call Center</p>
                <p className="text-sm text-slate-500">0800-BONAPAY</p>
              </div>
            </div>
          </motion.div>

          
        </div>
      </div>
    </div>
  )
}