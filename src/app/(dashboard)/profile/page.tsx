'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { profileSchema } from '@/lib/validations'
import { getSupabaseClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Phone, Mail, Shield, CheckCircle, XCircle, Upload } from 'lucide-react'

type ProfileFormData = {
  fullName: string
  phone: string
  bvn?: string
  nin?: string
}

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  bvn?: string
  nin?: string
  kyc_status: 'pending' | 'verified' | 'rejected'
  avatar_url?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      
      setProfile(data)
      reset({
        fullName: data.full_name,
        phone: data.phone,
        bvn: data.bvn || '',
        nin: data.nin || '',
      })
    } catch (error: any) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    const supabase = getSupabaseClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          bvn: data.bvn,
          nin: data.nin,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully')
      setIsEditing(false)
      fetchProfile()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    }
  }

  const handleKYCSubmit = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // In demo mode, we just mark as verified
      // In production, you'd integrate with SmileID or Dojah
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_status: 'verified' })
        .eq('id', user.id)

      if (error) throw error

      toast.success('KYC submitted successfully!')
      fetchProfile()
    } catch (error: any) {
      toast.error('Failed to submit KYC')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = getSupabaseClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      toast.success('Avatar updated successfully')
      fetchProfile()
    } catch (error: any) {
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
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
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your personal information and security settings
          </p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Avatar Section */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.full_name?.charAt(0).toUpperCase() || <User className="h-12 w-12" />}
                    </div>
                    <label className="absolute bottom-0 right-0 p-1 bg-white dark:bg-slate-800 rounded-full cursor-pointer shadow-md">
                      <Upload className="h-4 w-4 text-slate-600" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="fullName"
                        className="pl-10"
                        disabled={!isEditing}
                        {...register('fullName')}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-red-500">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        value={profile?.email}
                        disabled
                        className="pl-10 bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                    <p className="text-xs text-slate-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        className="pl-10"
                        disabled={!isEditing}
                        {...register('phone')}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button type="submit">Save Changes</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          reset({
                            fullName: profile?.full_name,
                            phone: profile?.phone,
                            bvn: profile?.bvn,
                            nin: profile?.nin,
                          })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification (KYC)</CardTitle>
                <CardDescription>
                  Verify your identity to unlock all features and higher transaction limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">Verification Status</p>
                      <p className="text-sm text-slate-500">
                        {profile?.kyc_status === 'verified' 
                          ? 'Your identity has been verified' 
                          : profile?.kyc_status === 'rejected'
                          ? 'Your verification was rejected'
                          : 'Complete verification to increase limits'}
                      </p>
                    </div>
                  </div>
                  <div>
                    {profile?.kyc_status === 'verified' ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    ) : profile?.kyc_status === 'rejected' ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Rejected</span>
                      </div>
                    ) : (
                      <Button onClick={handleKYCSubmit}>
                        Start Verification
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Required Documents</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div>
                        <p className="font-medium">BVN</p>
                        <p className="text-sm text-slate-500">Bank Verification Number</p>
                      </div>
                      <div className="relative">
                        <Input
                          placeholder="11 digits"
                          className="w-32 text-right"
                          {...register('bvn')}
                          disabled={profile?.kyc_status === 'verified'}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div>
                        <p className="font-medium">NIN</p>
                        <p className="text-sm text-slate-500">National Identification Number</p>
                      </div>
                      <Input
                        placeholder="11 digits"
                        className="w-32 text-right"
                        {...register('nin')}
                        disabled={profile?.kyc_status === 'verified'}
                      />
                    </div>
                  </div>
                  {profile?.kyc_status !== 'verified' && (
                    <Button onClick={handleKYCSubmit} className="w-full mt-4">
                      Submit for Verification
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}