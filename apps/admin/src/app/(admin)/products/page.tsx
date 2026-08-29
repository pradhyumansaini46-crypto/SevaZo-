'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Trash2, Plus, Star, PackagePlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Product } from '@/types';
import { toast } from 'sonner';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryName: '',
    vendorName: '',
    price: '' as string | number,
    compareAtPrice: '' as string | number,
    stock: '' as string | number,
    sku: '',
    unit: '',
    description: '',
  });

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.sku) {
      toast.error('Please fill in all required product fields');
      return;
    }

    const newProduct: Product = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formData.description as string,
      images: ['/products/default.jpg'],
      category: { id: `cat-${Date.now()}`, name: (formData.categoryName as string) || 'General' },
      vendor: { id: `vnd-${Date.now()}`, storeName: (formData.vendorName as string) || 'Direct Marketplace' },
      price: Number(formData.price),
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
      sku: formData.sku as string,
      stock: Number(formData.stock) || 0,
      unit: (formData.unit as string) || 'piece',
      status: 'active',
      approvalStatus: 'approved',
      rating: 5.0,
      reviewsCount: 0,
      tags: ['catalog', 'featured'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts([newProduct, ...products]);
    setIsAddOpen(false);
    setFormData({
      name: '',
      categoryName: '',
      vendorName: '',
      price: '',
      compareAtPrice: '',
      stock: '',
      sku: '',
      unit: '',
      description: '',
    });
    toast.success(`Product "${newProduct.name}" created and added to catalog!`);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setProducts(products.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p)));
    toast.info(`Product visibility updated to ${newStatus}`);
  };

  const handleDelete = (id: string, name: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success(`Product "${name}" deleted from catalog`);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <Link href={`/products/${row.original.id}`} prefetch={true} className="font-medium hover:underline max-w-[220px] truncate block text-primary">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="outline">{row.original.category.name}</Badge>,
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor Store',
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.vendor.storeName}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.price)}</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => (
        <span className={`text-sm font-medium ${row.original.stock === 0 ? 'text-destructive font-semibold' : 'text-foreground'}`}>
          {row.original.stock === 0 ? 'Out of Stock' : `${row.original.stock} ${row.original.unit}`}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-sm">{row.original.rating || '-'}</span>
        </div>
      ),
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
            <DropdownMenuItem render={<Link href={`/products/${row.original.id}`} prefetch={true} />}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(row.original.id, row.original.status)}>
              <AlertCircle className="mr-2 h-4 w-4 text-blue-600" />
              Set {row.original.status === 'active' ? 'Inactive' : 'Active'}
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
      <PageHeader title="Products" description="Manage marketplace product inventory, prices, and catalog status">
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4">
        <SearchInput placeholder="Search products by title or SKU..." onSearch={handleSearch} className="max-w-sm" />
      </div>

      <DataTable columns={columns} data={products} searchKey="name" searchValue={search} />

      {/* Add Product Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" /> Create Catalog Product
            </DialogTitle>
            <DialogDescription>
              Add a new SKU to the Sevazo catalog with real-time stock allocation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProduct} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="productName" className="text-xs font-semibold">Product Title *</Label>
              <Input
                id="productName"
                placeholder="e.g. Organic Brown Rice 5kg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="categorySelect" className="text-xs font-semibold">Category *</Label>
                <Input
                  id="categorySelect"
                  placeholder="e.g. Staples, Mobiles, Dairy"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vendorSelect" className="text-xs font-semibold">Vendor Store *</Label>
                <Input
                  id="vendorSelect"
                  placeholder="e.g. Fresh Mart"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="productPrice" className="text-xs font-semibold">Selling Price (₹) *</Label>
                <Input
                  id="productPrice"
                  type="number"
                  placeholder="e.g. 499"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comparePrice" className="text-xs font-semibold">Compare Price (₹)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  placeholder="e.g. 599"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stockQty" className="text-xs font-semibold">Stock Quantity *</Label>
                <Input
                  id="stockQty"
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-xs font-semibold">SKU Identifier *</Label>
                <Input
                  id="sku"
                  placeholder="e.g. FM-RICE-002"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-xs font-semibold">Unit Type</Label>
                <Input
                  id="unit"
                  placeholder="kg / piece / g"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add to Catalog
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
