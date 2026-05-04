'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Filter, RefreshCw, Search } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

export default function AuditLogsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    entityType: '',
  });
  const [actions, setActions] = useState<string[]>([]);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadLogs();
      loadActions();
    }
  }, [filters, isAdmin]);

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

  const loadLogs = async () => {
    setLoading(true);
    
    let query = supabase
      .from('audit_logs')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading audit logs:', error);
    } else {
      setLogs(data || []);
    }
    
    setLoading(false);
  };

  const loadActions = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('action')
      .order('action');
    
    const uniqueActions = [...new Set(data?.map(log => log.action))];
    setActions(uniqueActions);
  };

  const exportToExcel = () => {
    const exportData = logs.map(log => ({
      'Timestamp': format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      'User': log.profiles?.full_name || 'System',
      'Email': log.profiles?.email || 'N/A',
      'Action': log.action,
      'Entity Type': log.entity_type,
      'Entity ID': log.entity_id,
      'IP Address': log.ip_address,
      'User Agent': log.user_agent,
      'Metadata': JSON.stringify(log.metadata),
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs');
    XLSX.writeFile(wb, `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      login: 'bg-purple-100 text-purple-700',
      logout: 'bg-gray-100 text-gray-700',
      view: 'bg-indigo-100 text-indigo-700',
      approve: 'bg-emerald-100 text-emerald-700',
      reject: 'bg-rose-100 text-rose-700',
    };
    
    const color = Object.entries(colors).find(([key]) => action.includes(key))?.[1] || 'bg-gray-100 text-gray-700';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {action}
      </span>
    );
  };

  if (!isAdmin) return null;

  if (loading && logs.length === 0) {
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
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track all administrative actions and system events
            </p>
          </div>
          <FileText className="h-12 w-12 text-primary" />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter audit logs by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Action Type</Label>
                <Select
                  value={filters.action}
                  onValueChange={(value) => setFilters({ ...filters, action: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All actions</SelectItem>
                    {actions.map(action => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>User ID</Label>
                <Input
                  placeholder="Filter by user ID"
                  value={filters.userId}
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Entity Type</Label>
                <Input
                  placeholder="e.g., user, transaction, card"
                  value={filters.entityType}
                  onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Date Range</Label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value ? new Date(e.target.value) : null })}
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value ? new Date(e.target.value) : null })}
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={loadLogs}>
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    action: '',
                    userId: '',
                    startDate: null,
                    endDate: null,
                    entityType: '',
                  });
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={exportToExcel}
                disabled={logs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>
              Showing {logs.length} log entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Metadata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.profiles?.full_name || 'System'}</p>
                            <p className="text-xs text-muted-foreground">{log.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <code className="text-xs">{log.entity_type}</code>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{log.entity_id || '-'}</code>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{log.ip_address || '-'}</code>
                        </TableCell>
                        <TableCell>
                          {log.metadata && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                alert(JSON.stringify(log.metadata, null, 2));
                              }}
                            >
                              <Search className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}