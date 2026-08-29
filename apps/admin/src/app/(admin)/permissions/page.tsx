'use client';

import * as React from 'react';
import { Key, Shield, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SystemPermission {
  module: string;
  action: string;
  code: string;
  description: string;
  isSensitive: boolean;
}

const PERMISSIONS_LIST: SystemPermission[] = [
  { module: 'Users', action: 'read', code: 'users:read', description: 'View customer, vendor, and rider user records', isSensitive: false },
  { module: 'Users', action: 'suspend', code: 'users:suspend', description: 'Suspend or block customer or vendor accounts', isSensitive: true },
  { module: 'Roles', action: 'read', code: 'roles:read', description: 'View RBAC roles and permissions matrix', isSensitive: false },
  { module: 'Roles', action: 'write', code: 'roles:write', description: 'Create, modify roles and assign permissions', isSensitive: true },
  { module: 'Admins', action: 'read', code: 'admins:read', description: 'View staff admin accounts and activity', isSensitive: false },
  { module: 'Admins', action: 'write', code: 'admins:write', description: 'Create admin accounts and assign staff roles', isSensitive: true },
  { module: 'Catalog', action: 'read', code: 'catalog:read', description: 'View products, categories, brands', isSensitive: false },
  { module: 'Catalog', action: 'write', code: 'catalog:write', description: 'Approve vendor products and modify categories', isSensitive: false },
  { module: 'Orders', action: 'read', code: 'orders:read', description: 'View orders, order items, and delivery status', isSensitive: false },
  { module: 'Orders', action: 'write', code: 'orders:write', description: 'Cancel orders and modify order state transitions', isSensitive: true },
  { module: 'Logistics', action: 'read', code: 'logistics:read', description: 'View live rider tracking and delivery dispatches', isSensitive: false },
  { module: 'Logistics', action: 'write', code: 'logistics:write', description: 'Assign riders and configure delivery zone boundaries', isSensitive: false },
  { module: 'Finance', action: 'read', code: 'finance:read', description: 'View payment transactions and commission ledgers', isSensitive: false },
  { module: 'Finance', action: 'write', code: 'finance:write', description: 'Approve customer refunds and trigger vendor settlements', isSensitive: true },
  { module: 'Marketing', action: 'read', code: 'marketing:read', description: 'View active discount coupons and banners', isSensitive: false },
  { module: 'Marketing', action: 'write', code: 'marketing:write', description: 'Create promotional coupons and upload app banners', isSensitive: false },
  { module: 'Support', action: 'read', code: 'support:read', description: 'View customer support tickets and disputes', isSensitive: false },
  { module: 'Support', action: 'write', code: 'support:write', description: 'Reply to customer tickets and resolve order disputes', isSensitive: false },
  { module: 'Analytics', action: 'read', code: 'analytics:read', description: 'View executive revenue and platform growth metrics', isSensitive: false },
  { module: 'Settings', action: 'read', code: 'settings:read', description: 'View global platform parameters and taxes', isSensitive: false },
  { module: 'Settings', action: 'write', code: 'settings:write', description: 'Modify global platform commission and fees', isSensitive: true },
];

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions Registry"
        description="System-wide granular permissions enforcing Role-Based Access Control."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" /> Active Permissions ({PERMISSIONS_LIST.length})
          </CardTitle>
          <CardDescription>
            Individual capability codes checked by `@RequirePermissions(...)` decorators and `PermissionsGuard`.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Module</TableHead>
                <TableHead>Permission Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Classification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSIONS_LIST.map((perm) => (
                <TableRow key={perm.code}>
                  <TableCell className="font-semibold text-sm">
                    <Badge variant="outline">{perm.module}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-primary font-semibold">
                      {perm.code}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {perm.description}
                  </TableCell>
                  <TableCell className="text-right">
                    {perm.isSensitive ? (
                      <Badge variant="destructive" className="text-xs">
                        High Privilege
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Standard
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
