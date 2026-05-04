'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { loginSchema } from '@/lib/validations'
import { authService } from '@/lib/auth/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'

type LoginFormData = {
  email: string
  password: string
  twoFactorCode?: string
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [tempSession, setTempSession] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const twoFactorCode = watch('twoFactorCode')

  const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true)

  try {
    const result = await authService.login({
      email: data.email,
      password: data.password,
      twoFactorCode: data.twoFactorCode,
    })

    if (result.success) {
      if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true)
        setTempSession(result.data)
        toast.success('Please enter your 2FA code')
      } else {
        // Check if user has admin role
        const supabase = getSupabaseClient()
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', result.data?.user?.id)
          .single()
        
        if (profile?.role !== 'admin') {
          // Regular user trying to login on web - sign them out and show error
          await authService.logout()
          toast.error('Web access is only for administrators. Please use the mobile app.')
          setIsLoading(false)
          return
        }
        
        toast.success('Welcome back!')
        
        // Redirect admin to admin dashboard or regular dashboard
        if (profile?.role === 'admin') {
          const redirectTo = searchParams.get('redirectedFrom') || '/dashboard'
          router.push(redirectTo)
        }
      }
    } else {
      toast.error(result.error || 'Invalid email or password')
    }
  } catch (error: any) {
    toast.error(error.message || 'An error occurred')
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            {requiresTwoFactor ? 'Two-Factor Authentication' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {requiresTwoFactor
              ? 'Enter the 6-digit code from your authenticator app'
              : 'Sign in to your BonaPay account'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {!requiresTwoFactor ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      className="pl-10 pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">Authentication Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="twoFactorCode"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      className="pl-10 text-center text-2xl tracking-widest"
                      {...register('twoFactorCode')}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Enter the 6-digit code from Google Authenticator or Authy
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Lost your device? Use one of your recovery codes to sign in.
                  </p>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {requiresTwoFactor ? 'Verifying...' : 'Signing In...'}
                </div>
              ) : (
                <>
                  {requiresTwoFactor ? 'Verify & Sign In' : 'Sign In'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {!requiresTwoFactor && (
              <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
                  Sign up
                </Link>
              </p>
            )}

            {requiresTwoFactor && (
              <button
                type="button"
                onClick={() => {
                  setRequiresTwoFactor(false)
                  setValue('twoFactorCode', '')
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Back to login
              </button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}