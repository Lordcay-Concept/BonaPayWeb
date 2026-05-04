'use client'

import Link from 'next/link'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MessageCircle, Ticket, Headphones, Mail, ArrowRight } from 'lucide-react'

export default function SupportHubPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            How can we help you today?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Chat Card - Links to your existing chat page */}
          <Link href="/support/chat">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>
                  Chat with our support team in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-3">
                  Get instant help from our support agents. Average response time: &lt; 2 minutes.
                </p>
                <div className="flex items-center text-sm text-blue-600 group-hover:gap-2 transition-all">
                  Start Chat <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Support Tickets Card - Links to your existing tickets page */}
          <Link href="/support/tickets">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Ticket className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>
                  Create and track support tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-3">
                  For complex issues that require detailed investigation. We'll respond within 24 hours.
                </p>
                <div className="flex items-center text-sm text-purple-600 group-hover:gap-2 transition-all">
                  View Tickets <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* FAQ Card - Coming Soon */}
          <Card className="cursor-default">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                <Headphones className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>FAQ & Help Center</CardTitle>
              <CardDescription>
                Find answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Browse our knowledge base for quick answers to common questions.
              </p>
              <p className="text-xs text-slate-400 mt-3">Coming soon</p>
            </CardContent>
          </Card>

          {/* Email Support Card */}
          <Card className="cursor-default">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Email Support</CardTitle>
              <CardDescription>
                support@BonaPay.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                For non-urgent inquiries, email us and we'll respond within 24-48 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}