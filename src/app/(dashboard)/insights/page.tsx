'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { insightsService, SpendingInsight, SpendingSummary } from '@/lib/insights/insights.service'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, TrendingDown, AlertCircle, Lightbulb, 
  BarChart3, Calendar, DollarSign, ArrowUp, ArrowDown 
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const INSIGHT_ICONS = {
  trend: <TrendingUp className="h-5 w-5" />,
  anomaly: <AlertCircle className="h-5 w-5" />,
  saving_opportunity: <Lightbulb className="h-5 w-5" />,
  spending_pattern: <BarChart3 className="h-5 w-5" />,
}

const IMPACT_COLORS = {
  positive: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  negative: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  neutral: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
}

const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function InsightsPage() {
  const router = useRouter()
  const [insights, setInsights] = useState<SpendingInsight[]>([])
  const [summary, setSummary] = useState<SpendingSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Generate fresh insights
    await insightsService.generateInsights(user.id)

    const [insightsData, summaryData] = await Promise.all([
      insightsService.getUserInsights(user.id),
      insightsService.getSpendingSummary(user.id),
    ])

    setInsights(insightsData)
    setSummary(summaryData)
    setLoading(false)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
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
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Spending Insights</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered analysis of your spending habits
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500">Total Spent</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_spent)}</p>
                  </div>
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500">Total Received</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_received)}</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500">Net Flow</p>
                    <p className={`text-2xl font-bold ${summary.net_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(summary.net_flow)}
                    </p>
                  </div>
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500">vs Last Month</p>
                    <p className={`text-2xl font-bold ${summary.compared_to_last_month <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(summary.compared_to_last_month)}
                    </p>
                  </div>
                  {summary.compared_to_last_month <= 0 ? <ArrowDown className="h-5 w-5 text-green-500" /> : <ArrowUp className="h-5 w-5 text-red-500" />}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            {insights.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Lightbulb className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
                  <p className="text-slate-500 mb-4">Make some transactions to get personalized insights</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card key={insight.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={`p-2 rounded-full ${IMPACT_COLORS[insight.impact]}`}>
                          {INSIGHT_ICONS[insight.type]}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg">{insight.title}</h3>
                            <Badge className={insight.impact === 'positive' ? 'bg-green-500' : insight.impact === 'negative' ? 'bg-red-500' : 'bg-blue-500'}>
                              {insight.impact.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">{insight.description}</p>
                          {insight.amount && (
                            <p className="text-sm font-medium mt-2 text-slate-500">
                              Amount: {formatCurrency(insight.amount)}
                            </p>
                          )}
                          {insight.category && (
                            <p className="text-sm font-medium mt-1 text-slate-500">
                              Category: {insight.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {summary && (
              <>
                {/* Top Categories Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                    <CardDescription>Where your money goes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={summary.top_categories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="amount"
                            label={({ name }) => name}
                          >
                            {summary.top_categories.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {summary.top_categories.map((cat, idx) => (
                        <div key={cat.category} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx] }} />
                            <span>{cat.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(cat.amount)}</p>
                            <p className="text-xs text-slate-500">{cat.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Average */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm text-slate-500">Daily Average</p>
                      <p className="text-xl font-bold">{formatCurrency(summary.daily_average)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm text-slate-500">Weekly Average</p>
                      <p className="text-xl font-bold">{formatCurrency(summary.weekly_average)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-sm text-slate-500">Biggest Spending Day</p>
                      <p className="text-xl font-bold">{summary.biggest_spending_day.day}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(summary.biggest_spending_day.amount)}</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}