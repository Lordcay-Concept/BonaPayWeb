'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { loyaltyService, LoyaltyPoints, LoyaltyTransaction, Reward } from '@/lib/loyalty/loyalty.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Gift, Star, Trophy, Award, Sparkles, TrendingUp, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

const TIER_ICONS = {
  bronze: <Star className="h-5 w-5 text-amber-600" />,
  silver: <Star className="h-5 w-5 text-slate-400" />,
  gold: <Trophy className="h-5 w-5 text-yellow-500" />,
  platinum: <Award className="h-5 w-5 text-purple-500" />,
}

const TIER_COLORS = {
  bronze: 'from-amber-600 to-amber-500',
  silver: 'from-slate-400 to-slate-300',
  gold: 'from-yellow-500 to-yellow-400',
  platinum: 'from-purple-500 to-purple-400',
}

export default function LoyaltyPage() {
  const router = useRouter()
  const [points, setPoints] = useState<LoyaltyPoints | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    fetchLoyaltyData()
  }, [])

  const fetchLoyaltyData = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const [pointsData, rewardsData, transactionsData] = await Promise.all([
      loyaltyService.getUserPoints(user.id),
      loyaltyService.getRewards(),
      loyaltyService.getLoyaltyTransactions(user.id),
    ])

    setPoints(pointsData)
    setRewards(rewardsData)
    setTransactions(transactionsData)
    setLoading(false)
  }

  const handleRedeem = async (reward: Reward) => {
    if (!points || points.points < reward.points_required) {
      toast.error('Insufficient points')
      return
    }

    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setRedeeming(true)
    try {
      const result = await loyaltyService.redeemPoints(user.id, reward.id, reward.points_required)
      if (result.success) {
        toast.success(`Successfully redeemed ${reward.name}!`)
        setSelectedReward(null)
        fetchLoyaltyData()
      } else {
        toast.error(result.error || 'Failed to redeem')
      }
    } catch (error) {
      toast.error('Failed to redeem')
    } finally {
      setRedeeming(false)
    }
  }

  const getNextTier = () => {
    if (!points) return null
    const tiers = [
      { name: 'Silver', threshold: 5000, current: points.total_points_earned },
      { name: 'Gold', threshold: 20000, current: points.total_points_earned },
      { name: 'Platinum', threshold: 50000, current: points.total_points_earned },
    ]
    
    for (const tier of tiers) {
      if (tier.current < tier.threshold) {
        return {
          name: tier.name,
          pointsNeeded: tier.threshold - tier.current,
          progress: (tier.current / tier.threshold) * 100,
        }
      }
    }
    return null
  }

  const nextTier = getNextTier()

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
          <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Earn points and redeem amazing rewards
          </p>
        </div>

        {/* Points Card */}
        <Card className={`bg-gradient-to-r ${points ? TIER_COLORS[points.tier] : 'from-blue-500 to-blue-600'} text-white`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm opacity-90">Your Points Balance</p>
                <p className="text-4xl font-bold mt-1">{points?.points || 0}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {points && TIER_ICONS[points.tier]}
                  <span className="font-semibold uppercase">{points?.tier || 'Bronze'}</span>
                </div>
                <p className="text-xs opacity-80 mt-1">Loyalty Tier</p>
              </div>
            </div>
            {nextTier && (
              <div className="mt-4">
                <p className="text-sm opacity-90 mb-2">
                  {nextTier.pointsNeeded} points to reach {nextTier.name}
                </p>
                <Progress value={nextTier.progress} className="h-2 bg-white/20" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Earn */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <p className="font-medium">Send Money</p>
                <p className="text-sm text-slate-500">1 point per ₦100 sent</p>
              </div>
              <div className="text-center p-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-medium">Pay Bills</p>
                <p className="text-sm text-slate-500">2 points per ₦100</p>
              </div>
              <div className="text-center p-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <p className="font-medium">Refer Friends</p>
                <p className="text-sm text-slate-500">500 points per referral</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                ✨ {points?.tier === 'platinum' ? '4x' : points?.tier === 'gold' ? '3x' : points?.tier === 'silver' ? '2x' : '1x'} points multiplier for your tier!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Store */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-500" />
              Rewards Store
            </CardTitle>
            <CardDescription>
              Redeem your points for exciting rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rewards.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No rewards available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward) => (
                  <Card key={reward.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{reward.name}</h3>
                          <p className="text-sm text-slate-500">{reward.description}</p>
                        </div>
                        <Badge className="bg-purple-500">
                          {reward.points_required} pts
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm font-medium">
                          {reward.type === 'cashback' && `₦${reward.value.toLocaleString()} Cashback`}
                          {reward.type === 'voucher' && `₦${reward.value.toLocaleString()} Voucher`}
                          {reward.type === 'fee_waiver' && 'Fee Waiver'}
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedReward(reward)}
                              disabled={!points || points.points < reward.points_required}
                            >
                              Redeem
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-xs text-slate-500">{formatDate(tx.created_at)}</p>
                    </div>
                    <span className={tx.type === 'earned' ? 'text-green-600' : 'text-red-600'}>
                      {tx.type === 'earned' ? '+' : '-'}{tx.points} points
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem {selectedReward?.name}?
            </DialogDescription>
          </DialogHeader>
          {selectedReward && points && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-slate-500">You will spend</p>
                <p className="text-2xl font-bold">{selectedReward.points_required} points</p>
                <p className="text-sm text-slate-500 mt-2">Remaining after redemption:</p>
                <p className="text-xl font-semibold">{points.points - selectedReward.points_required} points</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">You'll receive:</p>
                {selectedReward.type === 'cashback' && (
                  <p className="text-lg font-bold text-green-600">₦{selectedReward.value.toLocaleString()} Cashback</p>
                )}
                {selectedReward.type === 'voucher' && (
                  <p className="text-lg font-bold text-green-600">₦{selectedReward.value.toLocaleString()} Voucher</p>
                )}
                {selectedReward.type === 'fee_waiver' && (
                  <p className="text-lg font-bold text-green-600">Transaction Fee Waiver</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReward(null)}>
              Cancel
            </Button>
            <Button onClick={() => selectedReward && handleRedeem(selectedReward)} disabled={redeeming}>
              {redeeming ? 'Processing...' : 'Confirm Redemption'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}