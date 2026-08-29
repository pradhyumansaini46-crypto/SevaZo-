'use client';

import * as React from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
  Laptop,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getStoredAuditLogs } from '@/services/audit-service';
import { AuditLogEntry } from '@/types/audit';

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState('ALL');
  const [selectedEntry, setSelectedEntry] = React.useState<AuditLogEntry | null>(null);

  React.useEffect(() => {
    setLogs(getStoredAuditLogs());
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.requestId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  function handleExportLogs() {
    const json = JSON.stringify(logs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sevazo-audit-trail-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 pb-12 w-full min-w-0">
      <PageHeader
        title="Security Action Audit Trail"
        description="Immutable record of administrative actions, role changes, policy approvals, and security events."
      >
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLogs(getStoredAuditLogs())}
            className="text-xs bg-white border-slate-200"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh Trail
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleExportLogs}
            className="text-xs bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1" /> Export Audit Log
          </Button>
        </div>
      </PageHeader>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 backdrop-blur-md border border-white/90 p-3 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search admin, action, request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white text-xs h-9 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'SYSTEM_ACTIVATED', 'COMMISSION_CHANGED', 'SECURITY_MFA_RESET', 'VENDOR_APPROVED'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActionFilter(filter)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                actionFilter === filter
                  ? 'bg-gradient-to-r from-[#E3FDF5] to-[#FFE6FA] text-teal-950 border border-white/90 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              {filter.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* AUDIT LOGS TABLE */}
      <Card className="bg-white/90 backdrop-blur-md border border-white/90 shadow-xs overflow-hidden min-w-0">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-teal-700" /> Recorded Audit Events
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Showing {filteredLogs.length} verified administrative operations
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono border-teal-200 text-teal-800 bg-teal-50">
              Audit Compliance Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/60">
                <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap">Timestamp & Request ID</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap">Admin User</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap">Action Type</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap">Target Resource</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap">IP & Client</TableHead>
                <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-slate-100 hover:bg-slate-50/80">
                    <TableCell className="whitespace-nowrap">
                      <p className="text-xs font-medium text-slate-900">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">{log.requestId}</p>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                          {log.adminName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 leading-tight">{log.adminName}</p>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-200 text-slate-500 font-mono">
                            {log.adminRole}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold font-mono">
                        {log.action}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      {log.resource}
                      {log.resourceId && <span className="text-slate-400 font-mono text-[10px] block">{log.resourceId}</span>}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <p className="text-xs font-mono text-slate-700">{log.ipAddress}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{log.userAgent}</p>
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEntry(log)}
                        className="text-xs text-teal-800 hover:text-teal-950 hover:bg-teal-50 font-semibold h-7"
                      >
                        Inspect Diff
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    No matching audit records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* INSPECT DIFF MODAL */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white/98 backdrop-blur-xl border border-white/90 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-teal-700" /> Audit Log Event Detail
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs text-slate-500">
                  {selectedEntry.requestId}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Action: <span className="font-bold text-teal-900">{selectedEntry.action}</span> on <span className="font-bold text-slate-800">{selectedEntry.resource}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Initiated By</p>
                  <p className="font-bold text-slate-900">{selectedEntry.adminName} ({selectedEntry.adminRole})</p>
                  <p className="text-slate-500 font-mono text-[11px]">{selectedEntry.adminEmail}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Origin & Time</p>
                  <p className="font-mono text-slate-900">{selectedEntry.ipAddress}</p>
                  <p className="text-slate-500 text-[11px]">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
                </div>
              </div>

              {/* Diff View */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-700">State Transformation Diff:</p>
                <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold uppercase text-rose-800">Previous Value</p>
                    <pre className="text-rose-900 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(selectedEntry.oldValue || { status: 'none' }, null, 2)}
                    </pre>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold uppercase text-emerald-800">New Value</p>
                    <pre className="text-emerald-900 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(selectedEntry.newValue || { status: 'active' }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEntry(null)}
                  className="text-xs bg-white border-slate-200"
                >
                  Close Inspection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
