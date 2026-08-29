'use client';

import { useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Tag, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
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
import { Brand } from '@/types';
import { toast } from 'sonner';

interface BrandItem extends Brand {
  productsCount: number;
  category: string;
  createdAt: string;
}

const INITIAL_BRANDS: BrandItem[] = [
  { id: 'br-1', name: 'Apple', slug: 'apple', category: 'Electronics', productsCount: 42, status: 'active', createdAt: '2024-01-10' },
  { id: 'br-2', name: 'Samsung', slug: 'samsung', category: 'Electronics', productsCount: 68, status: 'active', createdAt: '2024-01-15' },
  { id: 'br-3', name: 'Amul', slug: 'amul', category: 'Dairy & Grocery', productsCount: 24, status: 'active', createdAt: '2024-02-01' },
  { id: 'br-4', name: 'Tata', slug: 'tata', category: 'Staples & FMCG', productsCount: 35, status: 'active', createdAt: '2024-02-12' },
  { id: 'br-5', name: 'Nike', slug: 'nike', category: 'Fashion & Footwear', productsCount: 56, status: 'active', createdAt: '2024-03-05' },
  { id: 'br-6', name: 'Cipla', slug: 'cipla', category: 'Pharmacy', productsCount: 110, status: 'active', createdAt: '2024-03-20' },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>(INITIAL_BRANDS);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
  });

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Please enter brand name');
      return;
    }

    const newBrand: BrandItem = {
      id: `br-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: formData.category || 'General',
      productsCount: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBrands([newBrand, ...brands]);
    setIsAddOpen(false);
    setFormData({ name: '', slug: '', category: '' });
    toast.success(`Brand "${newBrand.name}" registered successfully!`);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setBrands(brands.map((b) => (b.id === id ? { ...b, status: newStatus as any } : b)));
    toast.info(`Brand status set to ${newStatus}`);
  };

  const handleDelete = (id: string, name: string) => {
    setBrands(brands.filter((b) => b.id !== id));
    toast.success(`Brand "${name}" removed`);
  };

  const columns: ColumnDef<BrandItem>[] = [
    {
      accessorKey: 'name',
      header: 'Brand Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium text-primary">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{row.original.slug}</code>,
    },
    {
      accessorKey: 'category',
      header: 'Department / Category',
      cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
    },
    {
      accessorKey: 'productsCount',
      header: 'Linked Products',
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.productsCount} items</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.createdAt}</span>,
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
            <DropdownMenuItem onClick={() => handleToggleStatus(row.original.id, row.original.status)}>
              <AlertCircle className="mr-2 h-4 w-4 text-blue-600" />
              Toggle {row.original.status === 'active' ? 'Inactive' : 'Active'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDelete(row.original.id, row.original.name)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Brand
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Brands" description="Manage official product brands, manufacturers, and manufacturer links">
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4">
        <SearchInput placeholder="Search brands..." onSearch={handleSearch} className="max-w-sm" />
      </div>

      <DataTable columns={columns} data={brands} searchKey="name" searchValue={search} />

      {/* Add Brand Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" /> Create Product Brand
            </DialogTitle>
            <DialogDescription>
              Register a brand or trademark entity into the global product directory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBrand} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="brandName" className="text-xs font-semibold">Brand Name *</Label>
              <Input
                id="brandName"
                placeholder="e.g. Sony, Nestlé"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brandSlug" className="text-xs font-semibold">Brand Slug (URL friendly)</Label>
              <Input
                id="brandSlug"
                placeholder="e.g. sony"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brandCategory" className="text-xs font-semibold">Primary Industry Category</Label>
              <Input
                id="brandCategory"
                placeholder="e.g. Electronics, FMCG"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Brand
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
