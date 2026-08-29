'use client';

import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { mockProducts } from '@/lib/mock-data';
import Link from 'next/link';

export default function ProductApprovalPage() {
  const pendingProducts = mockProducts.filter((p) => p.approvalStatus === 'pending');

  return (
    <div className="space-y-6">
      <PageHeader title="Product Approval" description="Review and approve vendor-submitted products">
        <Badge variant="outline">{pendingProducts.length} pending</Badge>
      </PageHeader>

      {pendingProducts.length === 0 ? (
        <EmptyState icon={CheckCircle} title="All caught up!" description="No products pending approval" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="text-base">{product.name}</CardTitle>
                <CardDescription>by {product.vendor.storeName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{product.category.name}</Badge>
                  <span className="text-sm font-medium">₹{product.price}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" className="flex-1"><CheckCircle className="mr-1 h-3 w-3" />Approve</Button>
                  <Button size="sm" variant="destructive" className="flex-1"><XCircle className="mr-1 h-3 w-3" />Reject</Button>
                  <Button size="sm" variant="outline" asChild><Link href={`/products/${product.id}`}><Eye className="h-3 w-3" /></Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
