'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Send,
  History,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  CreditCard,
  Zap,
  PiggyBank,
  TrendingUp,
  QrCode,
  Clock,
  Gift,
  MessageCircle,
  Users,
  FileText,
  Wallet,
  Activity,
  Sparkles,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Key,
  Smartphone,
  AlertTriangle,
  Settings,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Navigation for regular users
const userNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, key: 'user-dashboard' },
  { name: 'Transfer', href: '/transfer', icon: Send, key: 'user-transfer' },
  { name: 'QR Payment', href: '/qr-payment', icon: QrCode, key: 'user-qr' },
  { name: 'Scheduled', href: '/scheduled', icon: Clock, key: 'user-scheduled' },
  { name: 'Beneficiaries', href: '/beneficiaries', icon: Users, key: 'user-beneficiaries' },
  { name: 'Statements', href: '/statements', icon: FileText, key: 'user-statements' },
  { name: 'Cards', href: '/cards', icon: CreditCard, key: 'user-cards' },
  { name: 'Bills', href: '/bills', icon: Zap, key: 'user-bills' },
  { name: 'Savings', href: '/savings', icon: PiggyBank, key: 'user-savings' },
  { name: 'Investments', href: '/invest', icon: TrendingUp, key: 'user-invest' },
  { name: 'Loyalty', href: '/loyalty', icon: Sparkles, key: 'user-loyalty' },
  { name: 'Budget', href: '/budget', icon: Wallet, key: 'user-budget' },
  { name: 'Insights', href: '/insights', icon: BarChart3, key: 'user-insights' },
  { name: 'Transactions', href: '/transactions', icon: History, key: 'user-transactions' },
  { name: 'Refer & Earn', href: '/referral', icon: Gift, key: 'user-referral' },
  { name: 'Security', href: '/security', icon: Shield, key: 'user-security' },
  { name: 'Profile', href: '/profile', icon: User, key: 'user-profile' },
  { name: 'Support', href: '/support', icon: MessageCircle, key: 'user-support' },
  { name: 'Transaction PIN', href: '/security/pin', icon: Key, key: 'user-transaction-pin' },
  { name: 'Batch Transfer', href: '/batch-transfer', icon: Send, key: 'user-batch' },
  { name: 'Spending Limits', href: '/spending-limits', icon: Wallet, key: 'user-spending-limits' },
  { name: 'Devices', href: '/devices', icon: Smartphone, key: 'user-devices' },
]

// Navigation for admin users 
const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, key: 'admin-dashboard' },
  { name: 'Users', href: '/admin/users', icon: Users, key: 'admin-users' },
  { name: 'KYC', href: '/admin/kyc', icon: Shield, key: 'admin-kyc' },
  { name: 'Transactions', href: '/admin/transactions', icon: History, key: 'admin-transactions' },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, key: 'admin-analytics' },
  { name: 'Health', href: '/admin/health', icon: Activity, key: 'admin-health' },
   { name: 'Fraud Monitoring', href: '/admin/fraud', icon: AlertTriangle, key: 'admin-fraud' },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText, key: 'admin-audit-logs' },
  { name: 'Support Tickets', href: '/admin/support', icon: MessageCircle, key: 'admin-support' },
  { name: 'System Settings', href: '/admin/settings', icon: Settings, key: 'admin-settings' },
  { name: 'Approve Emails', href: '/admin/approve-emails', icon: Mail, key: 'admin-approve-emails' },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true) 
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen')
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true')
    }
  }, [])

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen))
  }, [sidebarOpen])

  useEffect(() => {
    const supabase = getSupabaseClient()
    
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        
        setUser(user)
        
        // Fetch user profile to check if admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        const adminStatus = profile?.is_admin === true
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
  }, [router])

  // Redirect admin from regular dashboard to admin dashboard
  useEffect(() => {
    if (!loading && isAdmin && pathname === '/dashboard') {
      router.push('/admin')
    }
  }, [loading, isAdmin, pathname, router])

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const navigation = isAdmin ? adminNavigation : userNavigation

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-72' : 'w-20'
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          'flex h-16 items-center border-b dark:border-slate-700 transition-all',
          sidebarOpen ? 'justify-between px-6' : 'justify-center px-4'
        )}>
          {sidebarOpen ? (
            <>
              <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {isAdmin ? "Admin" : "BonaPay"}
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-slate-500" />
              </button>
            </>
          ) : (
            <>
              <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {isAdmin ? "A" : "F"}
              </Link>
              <button
                onClick={toggleSidebar}
                className="absolute right-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Links - Scrollable Area */}
        <nav className={cn(
          'flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-600',
          sidebarOpen ? 'px-4' : 'px-2'
        )}>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
                    sidebarOpen ? 'px-4 py-3' : 'justify-center px-2 py-3'
                  )}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Upgrade Banner (Regular Users Only) */}
        {!isAdmin && sidebarOpen && (
          <div className="mx-4 mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <p className="text-xs text-white font-medium">✨ Upgrade to Premium</p>
              <p className="text-xs text-blue-100 mt-1">Get higher limits & more features</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full mt-2 text-xs bg-white/20 hover:bg-white/30 text-white"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* User Info & Logout */}
        <div className={cn(
          'border-t dark:border-slate-700 bg-white dark:bg-slate-800',
          sidebarOpen ? 'p-4' : 'p-2'
        )}>
          {sidebarOpen ? (
            <div className="mb-3 px-2">
              <p className="font-medium truncate">{user?.user_metadata?.full_name || user?.email}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              {isAdmin && (
                <p className="text-xs text-blue-600 mt-1 font-medium">Administrator</p>
              )}
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">
                  {(user?.user_metadata?.full_name?.[0] || user?.email?.[0])?.toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors w-full',
              sidebarOpen ? 'px-4 py-3' : 'justify-center px-2 py-3'
            )}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
      )}>
        {/* Header with Hamburger Menu (visible on all screens) */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b dark:border-slate-700">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Hamburger menu - always visible */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="font-medium">
                  {isAdmin ? 'Admin Dashboard' : (user?.user_metadata?.full_name || user?.email)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAdmin ? 'System Overview' : 'Welcome back!'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      </div>
  )
}