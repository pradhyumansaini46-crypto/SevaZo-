'use client';

import * as React from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Check,
  Minus,
  Lock,
  Sparkles,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


interface RoleDefinition {
  name: string;
  slug: string;
  description: string;
  membersCount: number;
  badgeVariant: 'default' | 'secondary' | 'outline';
  badgeColor: string;
}

const ROLES: RoleDefinition[] = [
  {
    name: 'Super Admin',
    slug: 'SUPER_ADMIN',
    description: 'Unrestricted full system control. Manages administrative roles, staff access, and security.',
    membersCount: 1,
    badgeVariant: 'default',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  },
  {
    name: 'Admin',
    slug: 'ADMIN',
    description: 'General system administration across operations, catalog, commerce, and support.',
    membersCount: 2,
    badgeVariant: 'secondary',
    badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  {
    name: 'Operations Manager',
    slug: 'OPERATIONS_MANAGER',
    description: 'Oversees order fulfillment, vendor store operations, and dispatch logistics.',
    membersCount: 4,
    badgeVariant: 'secondary',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  {
    name: 'Catalog Manager',
    slug: 'CATALOG_MANAGER',
    description: 'Manages products, categories, brands, and vendor catalog review queues.',
    membersCount: 3,
    badgeVariant: 'secondary',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  {
    name: 'Finance Manager',
    slug: 'FINANCE_MANAGER',
    description: 'Manages payment reconciliations, customer refunds, vendor settlements, and commission ledger.',
    membersCount: 2,
    badgeVariant: 'secondary',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  },
  {
    name: 'Logistics Manager',
    slug: 'LOGISTICS_MANAGER',
    description: 'Monitors delivery fleet capacity, rider dispatch, and delivery zone coverage.',
    membersCount: 3,
    badgeVariant: 'secondary',
    badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  },
  {
    name: 'Support Agent',
    slug: 'SUPPORT_AGENT',
    description: 'Resolves customer support tickets, disputes, and handles rider support requests.',
    membersCount: 6,
    badgeVariant: 'secondary',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
];

interface MatrixRow {
  permission: string;
  description: string;
  superAdmin: boolean;
  admin: boolean;
  operations: boolean;
  catalog: boolean;
  finance: boolean;
  logistics: boolean;
  support: boolean;
}

const PERMISSION_MATRIX: MatrixRow[] = [
  {
    permission: 'View Users',
    description: 'Inspect customers, vendors, and delivery rider profiles',
    superAdmin: true,
    admin: true,
    operations: true,
    catalog: true,
    finance: false,
    logistics: true,
    support: true,
  },
  {
    permission: 'Suspend User',
    description: 'Block or suspend customer accounts or vendor stores',
    superAdmin: true,
    admin: true,
    operations: false,
    catalog: false,
    finance: false,
    logistics: false,
    support: false,
  },
  {
    permission: 'View Payments',
    description: 'View payment transactions, gateways, and settlements',
    superAdmin: true,
    admin: true,
    operations: false,
    catalog: false,
    finance: true,
    logistics: false,
    support: false,
  },
  {
    permission: 'Refund',
    description: 'Approve and trigger customer refunds and payout reversals',
    superAdmin: true,
    admin: true,
    operations: false,
    catalog: false,
    finance: true,
    logistics: false,
    support: false,
  },
  {
    permission: 'Manage Products',
    description: 'Create, edit, approve, or reject catalog products',
    superAdmin: true,
    admin: true,
    operations: true,
    catalog: true,
    finance: false,
    logistics: false,
    support: false,
  },
  {
    permission: 'Manage Riders',
    description: 'Approve riders, assign delivery zones, and manage fleet',
    superAdmin: true,
    admin: true,
    operations: true,
    catalog: false,
    finance: false,
    logistics: true,
    support: true,
  },
  {
    permission: 'Manage Roles',
    description: 'Create roles, assign staff, and modify permissions matrix',
    superAdmin: true,
    admin: false,
    operations: false,
    catalog: false,
    finance: false,
    logistics: false,
    support: false,
  },
];

export default function RolesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Roles & Permissions (RBAC)"
        description="Role-Based Access Control matrix. Strict least-privilege security principle enforced."
      />

      {/* Security Rule Alert */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Principle of Least Privilege</h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              Never make every admin a Super Admin. Restrict sensitive financial capabilities (Refunds, Settlements) and governance powers (Manage Roles, Suspend Users) strictly to designated roles.
            </p>
          </div>
        </div>
      </div>

      {/* Roles Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Platform Roles ({ROLES.length})
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ROLES.map((role) => (
            <Card key={role.slug} className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`font-mono text-xs ${role.badgeColor}`}>
                    {role.slug}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {role.membersCount}
                  </span>
                </div>
                <CardTitle className="text-base mt-2">{role.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground pt-2 border-t flex items-center justify-between">
                  <span>Status: Active</span>
                  {role.slug === 'SUPER_ADMIN' ? (
                    <span className="text-purple-600 font-medium flex items-center gap-1">
                      <Lock className="h-3 w-3" /> System Role
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium">Customizable</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Permission Access Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Role Permission Matrix
          </CardTitle>
          <CardDescription>
            Definitive access control matrix across all platform permissions and assigned roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px] font-semibold">Permission</TableHead>
                  <TableHead className="min-w-[180px]">Scope & Description</TableHead>
                  <TableHead className="text-center font-semibold text-purple-700 dark:text-purple-300">Super Admin</TableHead>
                  <TableHead className="text-center font-semibold text-blue-700 dark:text-blue-300">Admin</TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700 dark:text-emerald-300">Operations</TableHead>
                  <TableHead className="text-center font-semibold text-amber-700 dark:text-amber-300">Catalog</TableHead>
                  <TableHead className="text-center font-semibold text-indigo-700 dark:text-indigo-300">Finance</TableHead>
                  <TableHead className="text-center font-semibold text-cyan-700 dark:text-cyan-300">Logistics</TableHead>
                  <TableHead className="text-center font-semibold text-rose-700 dark:text-rose-300">Support</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_MATRIX.map((row) => (
                  <TableRow key={row.permission}>
                    <TableCell className="font-semibold text-sm">{row.permission}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.description}</TableCell>
                    
                    {/* Super Admin */}
                    <TableCell className="text-center">
                      {row.superAdmin ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold text-sm">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 font-mono">-</span>
                      )}
                    </TableCell>

                    {/* Admin */}
                    <TableCell className="text-center">
                      {row.admin ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-sm">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 font-mono">-</span>
                      )}
                    </TableCell>

                    {/* Operations */}
                    <TableCell className="text-center">
                      {row.operations ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 font-mono">-</span>
                      )}
                    </TableCell>

                    {/* Catalog */}
                    <TableCell className="text-center">
                      {row.catalog ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-sm">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 font-mono">-</span>
                      )}
                    </TableCell>

                    {/* Finance */}
                    <TableCell className="text-center">
                      {row.finance ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 font-mono">-</span>
                      )}
                    </TableCell>

                    {/* Logistics */}
                    <TableCell className="text-center">
                      {row.logistics ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold text-sm">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 font-mono">-</span>
                      )}
                    </TableCell>

                    {/* Support */}
                    <TableCell className="text-center">
                      {row.support ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold text-sm">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40 font-mono">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
