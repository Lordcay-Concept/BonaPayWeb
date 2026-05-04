'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fraudDetectionService } from '@/lib/fraud/fraud.service';

export default function FraudMonitoringPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [filterStatus, filterSeverity, isAdmin]);

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profile?.is_admin !== true) {
      router.push('/dashboard');
      return;
    }

    setIsAdmin(true);
  };

  const loadData = async () => {
    setLoading(true);
    
    const status = filterStatus !== 'all' ? filterStatus : undefined;
    const severity = filterSeverity !== 'all' ? filterSeverity : undefined;
    
    const [alertsData, statsData] = await Promise.all([
      fraudDetectionService.getFraudAlerts(status, severity),
      fraudDetectionService.getFraudStats(),
    ]);
    
    setAlerts(alertsData);
    setStats(statsData);
    setLoading(false);
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await fraudDetectionService.updateAlertStatus(
      selectedAlert.id,
      selectedStatus as any,
      user.id,
      resolutionNotes
    );
    
    setDialogOpen(false);
    setSelectedAlert(null);
    setResolutionNotes('');
    loadData();
  };

  const handleViewAlert = (alert: any) => {
    setSelectedAlert(alert);
    setSelectedStatus(alert.status);
    setResolutionNotes(alert.resolution_notes || '');
    setDialogOpen(true);
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { bg: string; text: string; icon: any }> = {
      low: { bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertTriangle },
      critical: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
    };
    
    const variant = variants[severity] || variants.low;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.bg} ${variant.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      reviewing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Eye },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      false_positive: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
    };
    
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.bg} ${variant.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (!isAdmin) return null;

  if (loading && alerts.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Fraud Monitoring</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor and manage fraud alerts
            </p>
          </div>
          <Shield className="h-12 w-12 text-primary" />
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.last_24h} in last 24h
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.by_severity?.critical || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires immediate attention
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.by_status?.pending || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.by_status?.reviewing || 0} currently reviewing
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.by_status?.resolved || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.by_status?.false_positive || 0} false positives
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Fraud Alerts</CardTitle>
            <CardDescription>
              Review and manage suspicious activity alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => loadData()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No fraud alerts found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {alert.alert_type?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {alert.description}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{alert.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.profiles?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAlert(alert)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Fraud Alert</DialogTitle>
              <DialogDescription>
                Review and resolve the suspicious activity
              </DialogDescription>
            </DialogHeader>
            
            {selectedAlert && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Alert Type</Label>
                    <p className="text-sm mt-1">{selectedAlert.alert_type?.replace('_', ' ') || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <div className="mt-1">{getSeverityBadge(selectedAlert.severity)}</div>
                  </div>
                  <div>
                    <Label>User</Label>
                    <p className="text-sm mt-1">{selectedAlert.profiles?.full_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm mt-1">{selectedAlert.profiles?.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <p className="text-sm mt-1 text-muted-foreground">{selectedAlert.description}</p>
                </div>
                
                <div>
                  <Label>Metadata</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-60">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="false_positive">False Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Resolution Notes</Label>
                  <Textarea
                    className="mt-2"
                    placeholder="Add notes about how this alert was resolved..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResolveAlert}>
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}