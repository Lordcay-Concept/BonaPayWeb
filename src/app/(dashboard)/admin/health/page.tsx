'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { healthService, HealthCheck, SystemMetrics } from '@/lib/health/health.service'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RefreshCw, Activity, Database, Shield, Server, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
}

const STATUS_ICONS = {
  healthy: <CheckCircle className="h-5 w-5 text-green-500" />,
  degraded: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  down: <XCircle className="h-5 w-5 text-red-500" />,
}

export default function SystemHealthPage() {
  const router = useRouter()
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profile?.is_admin !== true) {
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    await fetchHealthData()
  }

  const fetchHealthData = async () => {
    const [checks, metricsData] = await Promise.all([
      healthService.runHealthCheck(),
      healthService.getSystemMetrics(),
    ])

    setHealthChecks(checks)
    setMetrics(metricsData)
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHealthData()
    setRefreshing(false)
    toast.success('Health check refreshed')
  }

  const getOverallStatus = () => {
    if (healthChecks.some(h => h.status === 'down')) return 'down'
    if (healthChecks.some(h => h.status === 'degraded')) return 'degraded'
    return 'healthy'
  }

  const overallStatus = getOverallStatus()

  if (!isAdmin) return null

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">System Health</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor platform health and performance
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Overall Status Card */}
        <Card className={`border-2 ${overallStatus === 'healthy' ? 'border-green-500' : overallStatus === 'degraded' ? 'border-yellow-500' : 'border-red-500'}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">System Status</p>
                <p className="text-2xl font-bold capitalize">{overallStatus}</p>
                <p className="text-sm text-slate-500 mt-1">
                  All systems are operational
                </p>
              </div>
              <div className={`p-3 rounded-full ${STATUS_COLORS[overallStatus]} bg-opacity-20`}>
                {STATUS_ICONS[overallStatus]}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Health Checks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthChecks.map((check) => (
            <Card key={check.service}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {check.service === 'Database' && <Database className="h-5 w-5" />}
                    {check.service === 'Authentication' && <Shield className="h-5 w-5" />}
                    {check.service === 'API' && <Server className="h-5 w-5" />}
                    <h3 className="font-semibold">{check.service}</h3>
                  </div>
                  <Badge className={STATUS_COLORS[check.status]}>
                    {check.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Response Time</span>
                    <span>{check.response_time}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Last Checked</span>
                    <span>{new Date(check.last_checked).toLocaleTimeString()}</span>
                  </div>
                  {check.message && (
                    <p className="text-sm text-red-500 mt-2">{check.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Metrics */}
        {metrics && (
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
              <CardDescription>Real-time platform performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>{metrics.cpu_usage}%</span>
                    </div>
                    <Progress value={metrics.cpu_usage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>{metrics.memory_usage}%</span>
                    </div>
                    <Progress value={metrics.memory_usage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Disk Usage</span>
                      <span>{metrics.disk_usage}%</span>
                    </div>
                    <Progress value={metrics.disk_usage} className="h-2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm font-medium">Active Users</span>
                    </div>
                    <p className="text-2xl font-bold">{metrics.active_users}</p>
                    <p className="text-xs text-slate-500">Last 5 minutes</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Requests per Minute</span>
                    </div>
                    <p className="text-2xl font-bold">{metrics.requests_per_minute}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Error Rate</span>
                    </div>
                    <p className="text-2xl font-bold">{metrics.error_rate.toFixed(2)}%</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm font-medium">Uptime</span>
                    </div>
                    <p className="text-2xl font-bold">{metrics.uptime}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}