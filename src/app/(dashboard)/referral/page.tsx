'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { referralService, ReferralStats } from '@/lib/referral/referral.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Users, TrendingUp, Gift, Share2, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReferralPage() {
  const router = useRouter()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referredUsers, setReferredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [referralLink, setReferralLink] = useState('')

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const statsData = await referralService.getReferralStats(user.id)
    const referredData = await referralService.getReferredUsers(user.id)
    
    setStats(statsData)
    setReferredUsers(referredData)
    setReferralLink(`${window.location.origin}/signup?ref=${statsData.referral_code}`)
    setLoading(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Referral link copied!')
  }

  const shareOnWhatsApp = () => {
    const text = `Join BonaPay using my referral link and get ₦1,000 bonus! ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareOnTwitter = () => {
    const text = `Join BonaPay using my referral link and get ₦1,000 bonus! ${referralLink}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Refer & Earn</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Invite friends and earn ₦1,000 for each friend who joins
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_referrals || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <UserPlus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.completed_referrals || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pending_referrals || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <Gift className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats?.total_earned || 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Your Referral Link</CardTitle>
            <CardDescription className="text-blue-100">
              Share this link with friends and earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="bg-white/20 border-white/30 text-white placeholder:text-blue-200"
              />
              <Button
                variant="secondary"
                onClick={copyToClipboard}
                className="bg-white text-blue-600 hover:bg-white/90"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white"
                onClick={shareOnWhatsApp}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share on WhatsApp
              </Button>
              <Button
                variant="secondary"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white"
                onClick={shareOnTwitter}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share on Twitter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Earn rewards by inviting friends to BonaPay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">1. Share Your Link</h3>
                <p className="text-sm text-slate-500">Share your unique referral link with friends</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">2. Friend Signs Up</h3>
                <p className="text-sm text-slate-500">Your friend signs up using your link</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">3. Get Rewarded</h3>
                <p className="text-sm text-slate-500">You earn ₦1,000 when they make their first transaction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referred Users List */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Referrals</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm text-slate-500">
                        <th className="p-4">User</th>
                        <th className="p-4">Joined</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Reward</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-slate-500">
                            No referrals yet. Share your link to get started!
                          </td>
                        </tr>
                      ) : (
                        referredUsers.map((ref) => (
                          <tr key={ref.id} className="border-b">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{ref.referred?.full_name || 'Anonymous'}</p>
                                <p className="text-sm text-slate-500">{ref.referred?.email}</p>
                              </div>
                            </td>
                            <td className="p-4">{formatDate(ref.created_at)}</td>
                            <td className="p-4">
                              {ref.status === 'completed' ? (
                                <Badge className="bg-green-500">Completed</Badge>
                              ) : (
                                <Badge className="bg-yellow-500">Pending</Badge>
                              )}
                            </td>
                            <td className="p-4">
                              {ref.status === 'completed' ? (
                                <span className="text-green-600">{formatCurrency(ref.reward_amount)}</span>
                              ) : (
                                <span className="text-slate-400">Pending first transaction</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}