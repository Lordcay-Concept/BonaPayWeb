'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, Code, Database, Shield, Smartphone, Zap, 
  Download, ExternalLink, ChevronRight, FileText, 
  Settings, Users, Lock, ArrowRight, CheckCircle, Search
} from 'lucide-react'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function DocumentationPage() {
  const docCategories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      docs: [
        { name: "Account Setup Guide", link: "#", time: "5 min read" },
        { name: "KYC Verification Process", link: "#", time: "3 min read" },
        { name: "Security Best Practices", link: "#", time: "8 min read" },
        { name: "App Download & Installation", link: "#", time: "2 min read" }
      ]
    },
    {
      title: "API Documentation",
      icon: Code,
      docs: [
        { name: "Authentication API", link: "#", time: "10 min read" },
        { name: "Payment Gateway Integration", link: "#", time: "15 min read" },
        { name: "Webhook Setup Guide", link: "#", time: "7 min read" },
        { name: "API Reference", link: "#", time: "20 min read" }
      ]
    },
    {
      title: "Developer Resources",
      icon: Database,
      docs: [
        { name: "SDK for Mobile Apps", link: "#", time: "12 min read" },
        { name: "Postman Collection", link: "#", time: "5 min read" },
        { name: "Sample Code Repository", link: "#", time: "8 min read" },
        { name: "API Status Dashboard", link: "#", time: "3 min read" }
      ]
    },
    {
      title: "User Guides",
      icon: Users,
      docs: [
        { name: "How to Send Money", link: "#", time: "4 min read" },
        { name: "Managing Virtual Cards", link: "#", time: "6 min read" },
        { name: "Bill Payments Tutorial", link: "#", time: "5 min read" },
        { name: "Savings & Investments", link: "#", time: "7 min read" }
      ]
    }
  ]

  const quickLinks = [
    { name: "FAQ", icon: FileText, link: "/faq" },
    { name: "API Status", icon: Settings, link: "#" },
    { name: "Security Guide", icon: Lock, link: "#" },
    { name: "Mobile App", icon: Smartphone, link: "#" }
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
            Documentation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Everything you need to know about using and integrating with BonaPay
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.aside variants={fadeInUp} initial="initial" animate="animate" className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
                <h3 className="font-semibold mb-3">Quick Links</h3>
                <ul className="space-y-2">
                  {quickLinks.map((link, index) => {
                    const Icon = link.icon
                    return (
                      <li key={index}>
                        <Link href={link.link} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                          <Icon className="h-4 w-4" />
                          {link.name}
                          <ChevronRight className="h-3 w-3 ml-auto" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Can't find what you're looking for?
                </p>
                <Link href="/contact">
                  <Button size="sm" className="w-full">Contact Support</Button>
                </Link>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search Bar */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search documentation..." 
                  className="w-full px-4 py-3 pl-10 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              </div>
            </motion.div>

            {/* Documentation Categories */}
            {docCategories.map((category, catIndex) => {
              const Icon = category.icon
              return (
                <motion.div 
                  key={catIndex}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle>{category.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {category.docs.map((doc, docIndex) => (
                          <Link 
                            key={docIndex}
                            href={doc.link}
                            className="group flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <div>
                              <p className="font-medium group-hover:text-blue-600 transition-colors">{doc.name}</p>
                              <p className="text-xs text-slate-500">{doc.time}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}

            {/* Developer Tools */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <Card>
                <CardHeader>
                  <CardTitle>Developer Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">API Client Libraries</h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        Official SDKs for Python, Node.js, PHP, and Java
                      </p>
                      <Button variant="outline" size="sm" className="w-full">Download SDKs</Button>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">API Playground</h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        Test API endpoints directly in your browser
                      </p>
                      <Button variant="outline" size="sm" className="w-full">Launch Playground</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Integration Status */}
            <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold mb-1">API Status: Operational</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">All systems are functioning normally</p>
                </div>
                <Badge className="bg-green-500 text-white">99.99% Uptime</Badge>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                <Link href="#" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                  View detailed status
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}