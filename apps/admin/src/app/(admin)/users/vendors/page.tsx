'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Plus,
  Star,
  Store,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Vendor } from '@/types';
import { toast } from 'sonner';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchLiveVendors = useCallback(async () => {
    try {
      const res = await fetch('/api/applications/vendors');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVendors(json.data);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchLiveVendors();
    const interval = setInterval(fetchLiveVendors, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveVendors]);

  // Form State
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    category: '',
    commissionRate: '' as string | number,
    city: '',
    state: '',
    pincode: '',
    line1: '',
  });

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.storeName || !formData.ownerName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newVendor: Vendor = {
      id: `vnd-${Date.now().toString().slice(-4)}`,
      storeName: formData.storeName,
      ownerName: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      logo: '',
      status: 'active',
      approvalStatus: 'approved',
      category: formData.category || 'General',
      commissionRate: Number(formData.commissionRate) || 10,
      address: {
        id: `va-${Date.now()}`,
        label: 'Store',
        line1: formData.line1 || '',
        city: formData.city || 'Bangalore',
        state: formData.state || 'Karnataka',
        pincode: formData.pincode || '560001',
      },
      productsCount: 0,
      ordersCount: 0,
      rating: 5.0,
      totalRevenue: 0,
      documents: [
        {
          id: `doc-${Date.now()}`,
          type: 'gst',
          number: '29AAACH2233M1Z8',
          fileUrl: '/docs/gst.pdf',
          verified: true,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setVendors([newVendor, ...vendors]);
    setIsAddOpen(false);
    setFormData({
      storeName: '',
      ownerName: '',
      email: '',
      phone: '',
      category: 'Grocery',
      commissionRate: 12,
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      line1: '12, Commercial Street',
    });
    toast.success(`Merchant store "${newVendor.storeName}" onboarded successfully!`);
  };

  const handleUpdateApproval = async (id: string, approvalStatus: 'approved' | 'rejected') => {
    try {
      await fetch('/api/applications/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approvalStatus }),
      });
    } catch (e) {}

    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              approvalStatus,
              status: approvalStatus === 'approved' ? 'active' : 'inactive',
            }
          : v,
      ),
    );
    if (approvalStatus === 'approved') {
      toast.success('Vendor store approved for selling!');
    } else {
      toast.error('Vendor application rejected');
    }
    fetchLiveVendors();
  };

  const handleDelete = (id: string, storeName: string) => {
    setVendors(vendors.filter((v) => v.id !== id));
    toast.success(`Vendor "${storeName}" deleted`);
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const pendingVendors = vendors.filter(
    (v) =>
      v.approvalStatus === 'pending' ||
      (v.approvalStatus as string) === 'under_review' ||
      v.status === 'pending',
  );
  const pendingCount = pendingVendors.length;

  const filteredVendors = vendors.filter((v) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') {
      return (
        v.approvalStatus === 'pending' ||
        (v.approvalStatus as string) === 'under_review' ||
        v.status === 'pending'
      );
    }
    if (statusFilter === 'approved') {
      return (
        v.approvalStatus === 'approved' ||
        v.status === 'active' ||
        (v.status as string) === 'approved'
      );
    }
    if (statusFilter === 'rejected') {
      return v.approvalStatus === 'rejected' || v.status === 'rejected';
    }
    return true;
  });

  const columns: ColumnDef<Vendor>[] = [
    {
      accessorKey: 'storeName',
      header: 'Store Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link href={`/users/vendors/${row.original.id}`} prefetch={true} className="font-medium hover:underline text-primary">
            {row.original.storeName}
          </Link>
          <span className="text-xs text-muted-foreground">{row.original.ownerName}</span>
        </div>
      ),
    },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isApproved =
          (row.original.status as string) === 'approved' ||
          row.original.status === 'active' ||
          row.original.approvalStatus === 'approved';
        if (isApproved) {
          return (
            <Badge className="border-0 bg-green-100 text-green-800 font-semibold px-2.5 py-0.5 text-xs">
              Approved
            </Badge>
          );
        }
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      accessorKey: 'approvalStatus',
      header: 'Approval',
      cell: ({ row }) => {
        const isApproved =
          (row.original.status as string) === 'approved' ||
          row.original.approvalStatus === 'approved';
        if (isApproved) {
          return (
            <Badge className="border-0 bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 text-xs">
              Active
            </Badge>
          );
        }
        const isPending =
          row.original.approvalStatus === 'pending' ||
          (row.original.approvalStatus as string) === 'under_review' ||
          row.original.status === 'pending';
        if (isPending) {
          return (
            <Link href={`/users/vendors/${row.original.id}`} prefetch={true}>
              <Badge
                variant="outline"
                className="border-amber-400 bg-amber-50 text-amber-900 font-bold px-2 py-0.5 text-xs gap-1.5 animate-pulse cursor-pointer hover:bg-amber-100"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                Pending Review
              </Badge>
            </Link>
          );
        }
        return <StatusBadge status={row.original.approvalStatus} />;
      },
    },
    {
      id: 'verification',
      header: 'KYC Action',
      cell: ({ row }) => {
        const isPending =
          row.original.approvalStatus === 'pending' ||
          (row.original.approvalStatus as string) === 'under_review';
        if (isPending) {
          return (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-amber-500 text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold"
              asChild
            >
              <Link href={`/users/vendors/${row.original.id}`} prefetch={true}>
                <ShieldCheck className="h-3.5 w-3.5 mr-1 text-amber-700" /> Review Docs
              </Link>
            </Button>
          );
        }
        return (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground hover:text-slate-900 font-medium"
            asChild
          >
            <Link href={`/users/vendors/${row.original.id}`} prefetch={true}>
              View Store
            </Link>
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
            <DropdownMenuItem render={<Link href={`/users/vendors/${row.original.id}`} prefetch={true} />}>
              <Eye className="mr-2 h-4 w-4" />
              View Store
            </DropdownMenuItem>
            {(row.original.approvalStatus === 'pending' || (row.original.approvalStatus as string) === 'under_review') && (
              <DropdownMenuItem render={<Link href={`/users/vendors/${row.original.id}`} prefetch={true} />}>
                <ShieldCheck className="mr-2 h-4 w-4 text-amber-600" />
                Review Documents
              </DropdownMenuItem>
            )}
            {row.original.approvalStatus !== 'approved' && (
              <DropdownMenuItem onClick={() => handleUpdateApproval(row.original.id, 'approved')}>
                <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                Approve Store
              </DropdownMenuItem>
            )}
            {row.original.approvalStatus !== 'rejected' && (
              <DropdownMenuItem onClick={() => handleUpdateApproval(row.original.id, 'rejected')}>
                <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                Reject Store
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDelete(row.original.id, row.original.storeName)}
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
    <div className="w-full m-0 p-0 space-y-6">
      <PageHeader title="Vendors" description="Manage merchant stores, KYC onboarding, and commission rates">
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </PageHeader>

      {/* Action Required Banner for Pending Vendor Approvals */}
      {pendingCount > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="font-bold text-sm text-amber-950">
                Action Required: {pendingCount} merchant store application(s) are waiting for KYC review & verification.
              </p>
              <p className="text-xs text-amber-800">
                Review submitted business registration, GSTIN, FSSAI, and banking details to activate store.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 self-end sm:self-center shadow-xs"
            asChild
          >
            <Link href={`/users/vendors/${pendingVendors[0].id}`} prefetch={true}>
              Review Submitted Application
            </Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <SearchInput placeholder="Search vendors by store or owner..." onSearch={handleSearch} className="max-w-sm" />
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border text-xs">
          <Button
            size="sm"
            variant={statusFilter === 'all' ? 'default' : 'ghost'}
            className="h-7 text-xs px-3"
            onClick={() => setStatusFilter('all')}
          >
            All ({vendors.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'pending' ? 'default' : 'ghost'}
            className="h-7 text-xs px-3"
            onClick={() => setStatusFilter('pending')}
          >
            Pending Review ({pendingCount})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'approved' ? 'default' : 'ghost'}
            className="h-7 text-xs px-3"
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'rejected' ? 'default' : 'ghost'}
            className="h-7 text-xs px-3"
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={filteredVendors} searchKey="storeName" searchValue={search} />

      {/* Add Vendor Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> Onboard Merchant Store
            </DialogTitle>
            <DialogDescription>
              Register a new vendor store onto the Sevazo marketplace with instant catalog activation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateVendor} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="storeName" className="text-xs font-semibold">Store / Business Name *</Label>
                <Input
                  id="storeName"
                  placeholder="e.g. Royal Mart"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ownerName" className="text-xs font-semibold">Primary Contact / Owner *</Label>
                <Input
                  id="ownerName"
                  placeholder="e.g. Anand Mahindra"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vendorEmail" className="text-xs font-semibold">Business Email *</Label>
                <Input
                  id="vendorEmail"
                  type="email"
                  placeholder="store@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vendorPhone" className="text-xs font-semibold">Phone Number *</Label>
                <Input
                  id="vendorPhone"
                  placeholder="+91 99887 76655"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">Primary Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Grocery, Electronics"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commissionRate" className="text-xs font-semibold">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  placeholder="e.g. 10"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storeAddress" className="text-xs font-semibold">Store Address</Label>
              <Input
                id="storeAddress"
                placeholder="e.g. 12, Commercial Street"
                value={formData.line1}
                onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Onboard Store
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
