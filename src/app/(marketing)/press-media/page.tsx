'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Calendar, User, ArrowRight, FileText, Image, Video, Mic } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function PressMediaPage() {
  const pressReleases = [
    {
      date: "March 15, 2025",
      title: "BonaPay Reaches 100,000 Active Users Milestone",
      summary: "Nigerian fintech startup celebrates major achievement in less than two years of operation.",
      category: "Milestone",
      link: "#"
    },
    {
      date: "January 10, 2025",
      title: "BonaPay Launches Virtual Cards Feature",
      summary: "New feature enables secure online payments for thousands of customers.",
      category: "Product Launch",
      link: "#"
    },
    {
      date: "November 5, 2024",
      title: "BonaPay Secures ₦5 Billion in Series A Funding",
      summary: "Investment to accelerate growth and expand agent network across Nigeria.",
      category: "Funding",
      link: "#"
    },
    {
      date: "August 20, 2024",
      title: "BonaPay Partners with Major Telecoms for Airtime Purchase",
      summary: "Customers can now buy airtime directly from the app at discounted rates.",
      category: "Partnership",
      link: "#"
    }
  ]

  const mediaKits = [
    { name: "Brand Guidelines", icon: FileText, size: "2.5 MB" },
    { name: "Logo Package", icon: Image, size: "5.1 MB" },
    { name: "App Screenshots", icon: Image, size: "8.3 MB" },
    { name: "Executive Photos", icon: Image, size: "4.2 MB" },
    { name: "Product Demo Video", icon: Video, size: "15.6 MB" },
    { name: "Press Kit (Complete)", icon: Download, size: "25.4 MB" }
  ]

  const inTheNews = [
    {
      outlet: "TechCabal",
      title: "How BonaPay is Changing Digital Banking in Nigeria",
      date: "March 2025",
      link: "#"
    },
    {
      outlet: "Business Day",
      title: "Fintech Startup BonaPay Hits Profitability",
      date: "February 2025",
      link: "#"
    },
    {
      outlet: "Nairametrics",
      title: "BonaPay's Innovative Approach to Savings",
      date: "January 2025",
      link: "#"
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
            Press & Media
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Latest news, resources, and information for journalists and media professionals
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Press Releases */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Press Releases</h2>
          <div className="space-y-4">
            {pressReleases.map((release, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="text-blue-600">{release.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>{release.date}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{release.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{release.summary}</p>
                  <Link href={release.link} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    Read More <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Media Kit */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Media Kit</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaKits.map((kit, index) => {
              const Icon = kit.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{kit.name}</p>
                        <p className="text-xs text-slate-500">{kit.size}</p>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-slate-400" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.div>

        {/* In the News */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }} className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">In the News</h2>
          <div className="space-y-4">
            {inTheNews.map((news, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-blue-600 font-medium mb-1">{news.outlet}</p>
                      <h3 className="font-semibold mb-1">{news.title}</h3>
                      <p className="text-sm text-slate-500">{news.date}</p>
                    </div>
                    <Link href={news.link}>
                      <Button variant="outline" size="sm">Read Article</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Media Contact */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.3 }} className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Media Inquiries</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            For press inquiries, interview requests, or additional information, please contact our media relations team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button variant="outline">Contact Media Team</Button>
            </Link>
            <Link href="mailto:press@bonapay.com">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-500">
                press@bonapay.com
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}