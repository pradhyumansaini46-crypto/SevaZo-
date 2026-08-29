'use client';

import * as React from 'react';
import {
  UserCog,
  Plus,
  MoreHorizontal,
  Shield,
  Ban,
  KeyRound,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { SearchInput } from '@/components/shared/search-input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface AdminStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: {
    name: string;
    slug: string;
    badgeColor: string;
  };
  status: 'active' | 'suspended' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

const ROLE_PRESETS: Record<string, { name: string; badgeColor: string }> = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  },
  ADMIN: {
    name: 'Admin',
    badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  OPERATIONS_MANAGER: {
    name: 'Operations Manager',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  CATALOG_MANAGER: {
    name: 'Catalog Manager',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  FINANCE_MANAGER: {
    name: 'Finance Manager',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  },
  LOGISTICS_MANAGER: {
    name: 'Logistics Manager',
    badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  },
  SUPPORT_AGENT: {
    name: 'Support Agent',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
};

const INITIAL_ADMIN_STAFF: AdminStaff[] = [
  {
    id: 'adm-001',
    name: 'Pradhyuman Saini',
    email: 'admin@sevazo.com',
    phone: '+91 95492 82219',
    role: {
      name: 'Owner & Super Admin',
      slug: 'SUPER_ADMIN',
      badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    status: 'active',
    lastLogin: 'Active session',
    createdAt: '2026-08-28',
  },
];

export default function AdminUsersPage() {
  const [staffList, setStaffList] = React.useState<AdminStaff[]>(INITIAL_ADMIN_STAFF);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('ALL');
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    roleSlug: 'OPERATIONS_MANAGER',
  });

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(search.toLowerCase()) ||
      staff.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || staff.role.slug === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Please enter name and email');
      return;
    }

    const preset = ROLE_PRESETS[formData.roleSlug] || ROLE_PRESETS.OPERATIONS_MANAGER;

    const newStaff: AdminStaff = {
      id: `adm-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      role: {
        name: preset.name,
        slug: formData.roleSlug,
        badgeColor: preset.badgeColor,
      },
      status: 'active',
      lastLogin: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setStaffList([newStaff, ...staffList]);
    setIsAddOpen(false);
    setFormData({ name: '', email: '', phone: '', roleSlug: 'OPERATIONS_MANAGER' });
    toast.success(`Staff account for ${newStaff.name} created!`);
  };

  const handleToggleSuspend = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setStaffList(staffList.map((s) => (s.id === id ? { ...s, status: newStatus as any } : s)));
    toast.info(`Staff account status updated to ${newStatus}`);
  };

  const handleResetPassword = (email: string) => {
    toast.success(`Password reset link sent to ${email}`);
  };

  const handleDelete = (id: string, name: string) => {
    setStaffList(staffList.filter((s) => s.id !== id));
    toast.success(`Admin account "${name}" removed`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Staff Management"
        description="Manage administrative accounts, role assignments, and access security."
      >
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Admin User
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <SearchInput
          placeholder="Search admin staff by name or email..."
          onSearch={setSearch}
          className="max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground mr-1">Filter Role:</span>
          {['ALL', 'SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'CATALOG_MANAGER', 'FINANCE_MANAGER', 'LOGISTICS_MANAGER', 'SUPPORT_AGENT'].map(
            (slug) => (
              <Button
                key={slug}
                variant={roleFilter === slug ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setRoleFilter(slug)}
              >
                {slug === 'ALL' ? 'All Roles' : slug.replace(/_/g, ' ')}
              </Button>
            ),
          )}
        </div>
      </div>

      <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Assigned Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{staff.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Mail className="h-3 w-3" /> {staff.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-mono text-xs ${staff.role.badgeColor}`}>
                      {staff.role.slug}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={staff.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {staff.lastLogin}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {staff.createdAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Manage Access</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleResetPassword(staff.email)}>
                          <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                        {staff.role.slug !== 'SUPER_ADMIN' && (
                          <DropdownMenuItem onClick={() => handleToggleSuspend(staff.id, staff.status)}>
                            <Ban className="mr-2 h-4 w-4 text-orange-600" />
                            {staff.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          </DropdownMenuItem>
                        )}
                        {staff.role.slug !== 'SUPER_ADMIN' && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(staff.id, staff.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Admin User Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Create Staff Admin Account
            </DialogTitle>
            <DialogDescription>
              Assign role privileges and invite a staff member to the Admin Command Center.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStaff} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="staffName" className="text-xs font-semibold">Full Name *</Label>
              <Input
                id="staffName"
                placeholder="e.g. John Wick"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staffEmail" className="text-xs font-semibold">Staff Email *</Label>
              <Input
                id="staffEmail"
                type="email"
                placeholder="john@sevazo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staffPhone" className="text-xs font-semibold">Phone Number</Label>
              <Input
                id="staffPhone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staffRole" className="text-xs font-semibold">Assign Role (RBAC) *</Label>
              <select
                id="staffRole"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.roleSlug}
                onChange={(e) => setFormData({ ...formData, roleSlug: e.target.value })}
              >
                <option value="OPERATIONS_MANAGER">Operations Manager</option>
                <option value="CATALOG_MANAGER">Catalog Manager</option>
                <option value="FINANCE_MANAGER">Finance Manager</option>
                <option value="LOGISTICS_MANAGER">Logistics Manager</option>
                <option value="SUPPORT_AGENT">Support Agent</option>
                <option value="ADMIN">Admin (General)</option>
                <option value="SUPER_ADMIN">Super Admin (Unrestricted)</option>
              </select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
