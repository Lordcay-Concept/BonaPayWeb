'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Smartphone, Laptop, Tablet, Monitor, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Device {
  id: string
  user_id: string
  device_type: string
  device_name: string
  browser: string
  os: string
  ip_address: string
  location: string
  last_active: string
  is_current: boolean
  is_trusted: boolean
}

export default function DevicesPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Mock device data - in production, fetch from database
    const mockDevices: Device[] = [
      {
        id: '1',
        user_id: user.id,
        device_type: 'Desktop',
        device_name: 'Chrome on Windows',
        browser: 'Chrome',
        os: 'Windows 11',
        ip_address: '192.168.1.100',
        location: 'Lagos, Nigeria',
        last_active: new Date().toISOString(),
        is_current: true,
        is_trusted: true,
      },
      {
        id: '2',
        user_id: user.id,
        device_type: 'Mobile',
        device_name: 'Safari on iPhone',
        browser: 'Safari',
        os: 'iOS 17',
        ip_address: '192.168.1.101',
        location: 'Lagos, Nigeria',
        last_active: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        is_current: false,
        is_trusted: true,
      },
      {
        id: '3',
        user_id: user.id,
        device_type: 'Tablet',
        device_name: 'Chrome on iPad',
        browser: 'Chrome',
        os: 'iPadOS 17',
        ip_address: '192.168.1.102',
        location: 'Abuja, Nigeria',
        last_active: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_current: false,
        is_trusted: false,
      },
    ]

    setDevices(mockDevices)
    setLoading(false)
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Mobile':
        return <Smartphone className="h-5 w-5" />
      case 'Tablet':
        return <Tablet className="h-5 w-5" />
      case 'Desktop':
        return <Monitor className="h-5 w-5" />
      default:
        return <Laptop className="h-5 w-5" />
    }
  }

  const removeDevice = async (deviceId: string) => {
    toast.success('Device removed successfully')
    setDevices(devices.filter(d => d.id !== deviceId))
  }

  const logoutAllDevices = async () => {
    toast.success('Logged out from all other devices')
    setDevices(devices.filter(d => d.is_current))
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
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Device Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage devices where you're logged in
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Devices that have access to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {getDeviceIcon(device.device_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{device.device_name}</p>
                      {device.is_current && (
                        <Badge className="bg-green-500">Current</Badge>
                      )}
                      {device.is_trusted && (
                        <Badge variant="outline" className="text-blue-600">Trusted</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {device.browser} • {device.os}
                    </p>
                    <p className="text-xs text-slate-400">
                      IP: {device.ip_address} • {device.location}
                    </p>
                    <p className="text-xs text-slate-400">
                      Last active: {new Date(device.last_active).toLocaleDateString()} at {new Date(device.last_active).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {!device.is_current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDevice(device.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={logoutAllDevices}
              className="w-full"
            >
              Log Out All Other Devices
            </Button>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                For security reasons, you'll need to log in again on devices you log out from.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}