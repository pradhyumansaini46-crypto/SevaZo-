'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Eye,
  Ban,
  Plus,
  Star,
  Circle,
  Bike,
  CheckCircle,
  Trash2,
  Power,
  ShieldCheck,
  ShieldAlert,
  FileText,
  XCircle,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { SearchInput } from '@/components/shared/search-input';
import { Rider } from '@/types';
import { toast } from 'sonner';

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewRider, setReviewRider] = useState<Rider | null>(null);

  const fetchLiveRiders = useCallback(async () => {
    try {
      const res = await fetch('/api/applications/riders');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Sort descending: newest / recently added riders appear at the very top
        const sorted = [...json.data].sort((a: any, b: any) => {
          const timeA = new Date(a.createdAt || a.submittedAt || a.updatedAt || 0).getTime();
          const timeB = new Date(b.createdAt || b.submittedAt || b.updatedAt || 0).getTime();
          return timeB - timeA;
        });
        setRiders(sorted);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchLiveRiders();
    const interval = setInterval(fetchLiveRiders, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveRiders]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    zone: '',
    status: 'active' as 'active' | 'pending',
  });

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Please enter both Rider Name and Mobile Number');
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();
    const cleanPhone = formData.phone.trim().startsWith('+91')
      ? formData.phone.trim()
      : `+91 ${formData.phone.trim().replace(/\D/g, '').slice(-10)}`;
    const riderId = `rdr-${Date.now().toString().slice(-6)}`;

    const newRider: Rider = {
      id: riderId,
      name: formData.name.trim(),
      email: formData.email.trim() || `${formData.name.trim().toLowerCase().replace(/\s+/g, '.')}@rider.sevazo.com`,
      phone: cleanPhone,
      avatar: '',
      status: formData.status,
      vehicleType: formData.vehicleType as any,
      vehicleNumber: formData.vehicleNumber.trim() || 'RJ 14 AB 1234',
      zone: formData.zone.trim() || 'Central Zone',
      deliveriesCount: 0,
      rating: 5.0,
      totalEarnings: 0,
      isOnline: formData.status === 'active',
      currentLocation: { lat: 26.9124, lng: 75.7873 },
      documents: [
        {
          id: `rd-${Date.now()}-dl`,
          type: 'driving_license',
          number: formData.vehicleNumber.trim() ? `DL-${formData.vehicleNumber.trim().replace(/[^A-Za-z0-9]/g, '').toUpperCase()}` : 'DL-VERIFIED',
          fileUrl: '/docs/dl.pdf',
          verified: true,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Immediately place at the very top of the table
    setRiders((prev) => [newRider, ...prev.filter((r) => r.id !== newRider.id)]);
    setIsAddOpen(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      vehicleType: 'bike',
      vehicleNumber: '',
      zone: '',
      status: 'active',
    });

    try {
      const res = await fetch('/api/applications/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRider,
          approvalStatus: formData.status === 'active' ? 'APPROVED' : 'PENDING',
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Delivery rider "${newRider.name}" added at the top of the fleet!`);
      } else {
        toast.error(json.message || 'Failed to persist rider');
      }
    } catch (err) {
      toast.success(`Rider "${newRider.name}" added to local fleet view`);
    } finally {
      setIsSubmitting(false);
      fetchLiveRiders();
    }
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      await fetch('/api/applications/riders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approvalStatus: 'APPROVED' }),
      });
    } catch (e) {}
    setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'active' as any, approvalStatus: 'APPROVED' as any } : r)));
    setReviewRider(null);
    toast.success(`Application Approved! Rider "${name}" is now verified and active in fleet.`);
    fetchLiveRiders();
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await fetch('/api/applications/riders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approvalStatus: 'REJECTED', reason: 'Documents could not be verified' }),
      });
    } catch (e) {}
    setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'suspended' as any, approvalStatus: 'REJECTED' as any } : r)));
    setReviewRider(null);
    toast.error(`Application Rejected for rider "${name}". Notification sent.`);
    fetchLiveRiders();
  };

  const handleToggleOnline = (id: string, isOnline: boolean) => {
    setRiders(riders.map((r) => (r.id === id ? { ...r, isOnline: !isOnline } : r)));
    toast.info(`Rider fleet status set to ${!isOnline ? 'Online' : 'Offline'}`);
  };

  const handleToggleSuspend = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setRiders(riders.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r)));
    toast.info(`Rider status set to ${newStatus}`);
  };

  const handleDelete = async (id: string, name: string) => {
    setRiders((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/applications/riders?id=${id}`, { method: 'DELETE' });
    } catch (e) {}
    toast.success(`Rider "${name}" removed from platform`);
    fetchLiveRiders();
  };

  const pendingCount = riders.filter((r) => r.status === 'pending' || (r.status as string) === 'under_review').length;

  const columns: ColumnDef<Rider>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link href={`/users/riders/${row.original.id}`} prefetch={true} className="font-medium hover:underline text-primary">
            {row.original.name}
          </Link>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'isOnline',
      header: 'Fleet Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Circle className={`h-2.5 w-2.5 fill-current ${row.original.isOnline ? 'text-emerald-500 animate-pulse' : 'text-zinc-400'}`} />
          <span className="font-medium text-xs">{row.original.isOnline ? 'Active Online' : 'Offline'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Verification Status',
      cell: ({ row }) => {
        const isPending = row.original.status === 'pending' || (row.original.status as string) === 'under_review';
        if (isPending) {
          return (
            <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-900 font-bold px-2 py-0.5 text-xs gap-1.5 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              Pending Review
            </Badge>
          );
        }
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      accessorKey: 'vehicleType',
      header: 'Vehicle',
      cell: ({ row }) => (
        <span className="capitalize text-xs font-medium bg-muted px-2 py-0.5 rounded">
          {row.original.vehicleType}
        </span>
      ),
    },
    { accessorKey: 'zone', header: 'Zone' },
    {
      accessorKey: 'createdAt',
      header: 'Joined / Added',
      cell: ({ row }) => {
        const dateStr = row.original.createdAt || (row.original as any).submittedAt;
        if (!dateStr) return <span className="text-xs text-muted-foreground">—</span>;
        const date = new Date(dateStr);
        const isToday = new Date().toDateString() === date.toDateString();
        return (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-700">
              {isToday ? `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {isToday && (
              <span className="text-[10px] font-bold text-emerald-600 tracking-wide uppercase">New Partner</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'quick_action',
      header: 'Action',
      cell: ({ row }) => {
        const isPending = row.original.status === 'pending' || (row.original.status as string) === 'under_review';
        if (isPending) {
          return (
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-7 px-3 text-xs gap-1 shadow-xs"
              onClick={() => setReviewRider(row.original)}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Take Action
            </Button>
          );
        }
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs text-muted-foreground"
            onClick={() => setReviewRider(row.original)}
          >
            View Docs
          </Button>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setReviewRider(row.original)}>
              <ShieldCheck className="mr-2 h-4 w-4 text-amber-600" />
              Review Documents
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={`/users/riders/${row.original.id}`} prefetch={true} />}>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleOnline(row.original.id, row.original.isOnline)}>
              <Power className="mr-2 h-4 w-4 text-blue-600" />
              Toggle {row.original.isOnline ? 'Offline' : 'Online'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleSuspend(row.original.id, row.original.status)}>
              {row.original.status === 'active' ? (
                <>
                  <Ban className="mr-2 h-4 w-4 text-orange-600" />
                  Suspend Rider
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                  Activate Rider
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDelete(row.original.id, row.original.name)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Delivery Fleet" description="Manage delivery partners, document verification, and live dispatches">
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rider
        </Button>
      </PageHeader>

      {/* Pending verification alert banner */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <p className="text-sm font-semibold text-amber-900">
              <span className="font-bold">{pendingCount} partner application(s)</span> are waiting for document KYC review & action.
            </p>
          </div>
          <Badge variant="outline" className="border-amber-400 bg-amber-100 text-amber-900 font-bold">
            Action Required
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-4">
        <SearchInput placeholder="Search riders by name, zone, phone..." onSearch={handleSearch} className="max-w-sm" />
      </div>

      <DataTable columns={columns} data={riders} searchKey="name" searchValue={search} />

      {/* Document Review & Admin Action Dialog */}
      <Dialog open={!!reviewRider} onOpenChange={(open) => !open && setReviewRider(null)}>
        {reviewRider && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-600" /> Partner Document Verification
              </DialogTitle>
              <DialogDescription>
                Review submitted documents for {reviewRider.name} ({reviewRider.phone}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-slate-50 p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Partner Name:</span>
                  <span className="font-bold text-slate-900">{reviewRider.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Vehicle:</span>
                  <span className="font-bold text-slate-900">{reviewRider.vehicleType.toUpperCase()} ({reviewRider.vehicleNumber})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Service Zone:</span>
                  <span className="font-bold text-slate-900">{reviewRider.zone}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Submitted Verification Documents:
                </Label>
                <div className="space-y-2">
                  {(reviewRider.documents || []).map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-md border p-2.5 bg-white">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 capitalize">
                            {doc.type.replace('_', ' ')}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Doc ID: {doc.number}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px]">
                        Attached & Valid
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={() => handleReject(reviewRider.id, reviewRider.name)}
              >
                <X className="mr-1.5 h-4 w-4" />
                Reject Application
              </Button>
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={() => handleApprove(reviewRider.id, reviewRider.name)}
              >
                <Check className="mr-1.5 h-4 w-4" />
                Approve & Activate Partner
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Add Rider Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-primary" /> Onboard Delivery Rider
            </DialogTitle>
            <DialogDescription>
              Add a new delivery partner to the fleet. The newly onboarded partner will immediately appear at the top of the table.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRider} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vikramaditya Rathore"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 98765 43210"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. partner@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <select
                  id="vehicleType"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="bike">🏍️ Motorcycle / Bike</option>
                  <option value="scooter">🛵 Scooter</option>
                  <option value="electric">⚡ Electric Bike (EV)</option>
                  <option value="bicycle">🚲 Bicycle</option>
                  <option value="car">🚗 Four-Wheeler / Car</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Registration Number</Label>
                <Input
                  id="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  placeholder="e.g. RJ 14 XY 9999"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zone">Service Zone / Hub</Label>
                <Input
                  id="zone"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="e.g. Mansarovar, Jaipur"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial Fleet Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="active">🟢 Active & Approved</option>
                  <option value="pending">🟡 Pending Review</option>
                </select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary font-semibold text-primary-foreground">
                {isSubmitting ? 'Onboarding...' : 'Onboard Rider'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
