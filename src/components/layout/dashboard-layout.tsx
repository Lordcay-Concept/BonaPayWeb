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
  Settings,
  Users,
  Zap,
  PiggyBank,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transfer', href: '/transfer', icon: Send },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Admin', href: '/admin', icon: Shield, adminOnly: true },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Cards', href: '/cards', icon: CreditCard },
  { name: 'Bills', href: '/bills', icon: Zap },
  { name: 'Savings', href: '/savings', icon: PiggyBank },



]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseClient()
    
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: SupabaseUser | null } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        // Check if user is admin (you can implement admin logic later)
        setIsAdmin(user.email === 'admin@fintechflow.com')
      }
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || isAdmin
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-slate-800 shadow-lg transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b dark:border-slate-700">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            FintechFlow
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b dark:border-slate-700">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium">{user?.user_metadata?.full_name || user?.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back!</p>
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