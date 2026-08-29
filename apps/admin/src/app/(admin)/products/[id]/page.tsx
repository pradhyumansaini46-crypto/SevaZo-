import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockProducts } from '@/lib/mock-data';
import { ArrowLeft, Star, Package, Store, Tag } from 'lucide-react';
import Link from 'next/link';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return <div className="p-6"><h1 className="text-xl font-bold">Product not found</h1></div>;
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/products"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title={product.name} description={`SKU: ${product.sku}`}>
          <StatusBadge status={product.status} />
          <StatusBadge status={product.approvalStatus} />
        </PageHeader>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{product.description}</p>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Price</p><p className="font-bold text-lg">{formatCurrency(product.price)}</p></div>
              {product.compareAtPrice && <div><p className="text-sm text-muted-foreground">Compare At</p><p className="font-bold text-lg line-through text-muted-foreground">{formatCurrency(product.compareAtPrice)}</p></div>}
              <div><p className="text-sm text-muted-foreground">Stock</p><p className={`font-bold text-lg ${product.stock === 0 ? 'text-destructive' : ''}`}>{product.stock} {product.unit}</p></div>
              <div><p className="text-sm text-muted-foreground">Rating</p><p className="font-bold text-lg flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{product.rating} ({product.reviewsCount})</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3"><Tag className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Category:</span><Badge variant="outline">{product.category.name}</Badge></div>
            <div className="flex items-center gap-3"><Store className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Vendor:</span><span className="font-medium">{product.vendor.storeName}</span></div>
            <div className="flex items-center gap-3"><Package className="h-4 w-4 text-muted-foreground" /><span className="text-sm">SKU:</span><span className="font-mono">{product.sku}</span></div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">{product.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
