'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Search, CheckCircle, XCircle, Eye, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface KYCRequest {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  bvn?: string
  nin?: string
  address?: string
  id_document_url?: string
  selfie_url?: string
  status: 'pending' | 'verified' | 'rejected'
  submitted_at: string
  rejection_reason?: string
}

export default function AdminKYCPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<KYCRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    const supabase = getSupabaseClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, tier')
        .eq('id', user.id)
        .single()

      if (profile?.is_admin !== true && profile?.tier !== 3) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      await fetchKYCRequests()
    } catch (error) {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchKYCRequests = async () => {
    const supabase = getSupabaseClient()
    
    try {
      // Fetch all profiles with KYC status
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, bvn, nin, address, kyc_status, created_at, kyc_rejection_reason')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedRequests: KYCRequest[] = (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        bvn: profile.bvn,
        nin: profile.nin,
        address: profile.address,
        status: profile.kyc_status as 'pending' | 'verified' | 'rejected',
        submitted_at: profile.created_at,
        rejection_reason: profile.kyc_rejection_reason,
      }))

      setRequests(formattedRequests)
    } catch (error) {
      console.error('Failed to fetch KYC requests:', error)
      toast.error('Failed to load KYC requests')
    }
  }

  const handleApprove = async (request: KYCRequest) => {
    setProcessing(true)
    const supabase = getSupabaseClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          kyc_status: 'verified',
          tier: 2,
          kyc_rejection_reason: null
        })
        .eq('id', request.user_id)

      if (error) throw error

      // Create notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: request.user_id,
          title: 'KYC Approved! 🎉',
          message: 'Your identity verification has been approved. You now have access to all features.',
          type: 'system',
        })

      toast.success('KYC request approved')
      await fetchKYCRequests()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    
    setProcessing(true)
    const supabase = getSupabaseClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          kyc_status: 'rejected',
          kyc_rejection_reason: rejectionReason
        })
        .eq('id', selectedRequest.user_id)

      if (error) throw error

      // Create notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.user_id,
          title: 'KYC Update',
          message: `Your KYC verification was not approved. Reason: ${rejectionReason}. Please resubmit with correct documents.`,
          type: 'system',
        })

      toast.success('KYC request rejected')
      setShowRejectDialog(false)
      setRejectionReason('')
      setSelectedRequest(null)
      await fetchKYCRequests()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject')
    } finally {
      setProcessing(false)
    }
  }

  const filteredRequests = requests.filter(request =>
    (activeTab === 'all' || request.status === activeTab) &&
    (request.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     request.phone?.includes(searchTerm))
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Pending Review</Badge>
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

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
            <h1 className="text-3xl font-bold">KYC Verification</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Review and verify user identity documents
            </p>
          </div>
          <div className="text-sm text-slate-500">
            Pending: {requests.filter(r => r.status === 'pending').length}
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>BVN/NIN</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No KYC requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.full_name || 'N/A'}</p>
                                <p className="text-sm text-slate-500">{request.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{request.phone || 'N/A'}</p>
                              <p className="text-xs text-slate-500">{request.address?.substring(0, 50) || 'No address'}</p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-mono">{request.bvn || 'Not provided'}</p>
                              <p className="text-sm font-mono">{request.nin || 'Not provided'}</p>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(request.submitted_at)}
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {request.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600"
                                      onClick={() => handleApprove(request)}
                                      disabled={processing}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedRequest(request)
                                        setShowRejectDialog(true)
                                      }}
                                      disabled={processing}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedRequest && !showRejectDialog} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC Details - {selectedRequest?.full_name}</DialogTitle>
            <DialogDescription>
              Review user information and submitted documents
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Full Name</p>
                  <p className="mt-1">{selectedRequest.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-1">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Phone</p>
                  <p className="mt-1">{selectedRequest.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Submitted</p>
                  <p className="mt-1">{formatDate(selectedRequest.submitted_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">BVN</p>
                  <p className="mt-1 font-mono">{selectedRequest.bvn || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">NIN</p>
                  <p className="mt-1 font-mono">{selectedRequest.nin || 'Not provided'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-slate-500">Address</p>
                  <p className="mt-1">{selectedRequest.address || 'Not provided'}</p>
                </div>
              </div>

              {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-600">Rejection Reason</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {selectedRequest.rejection_reason}
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm font-medium">Document Status</p>
                <p className="text-sm text-slate-500 mt-1">
                  ID Document: {selectedRequest.id_document_url ? 'Uploaded' : 'Not uploaded'}
                </p>
                <p className="text-sm text-slate-500">
                  Selfie: {selectedRequest.selfie_url ? 'Uploaded' : 'Not uploaded'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(true)
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest)}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be sent to the user.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}