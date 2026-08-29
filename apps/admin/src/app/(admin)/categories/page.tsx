'use client';

import * as React from 'react';
import { ChevronRight, FolderTree, Plus, Pencil, Trash2, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockCategories } from '@/lib/mock-data';
import { Category } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

function CategoryItem({
  category,
  depth = 0,
  onDelete,
}: {
  category: Category;
  depth?: number;
  onDelete: (id: string, name: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="flex items-center justify-between py-3 px-4 hover:bg-muted/40 rounded-lg transition-colors border-b last:border-b-0"
        style={{ paddingLeft: `${depth * 28 + 16}px` }}
      >
        <div className="flex items-center gap-3">
          {category.children && category.children.length > 0 ? (
            <CollapsibleTrigger
              render={
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md">
                  <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
                </Button>
              }
            />
          ) : (
            <div className="w-7" />
          )}
          <FolderTree className="h-4 w-4 text-primary/70" />
          <span className="font-medium text-sm">{category.name}</span>
          <StatusBadge status={category.status} />
          <Badge variant="outline" className="text-xs font-mono">
            {category.productsCount} products
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(category.id, category.name)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {category.children && (
        <CollapsibleContent>
          {category.children.map((child) => (
            <CategoryItem key={child.id} category={child} depth={depth + 1} onDelete={onDelete} />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>(mockCategories);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    parentCategory: 'root',
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Please enter category name');
      return;
    }

    const generatedSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newCategory: Category = {
      id: `cat-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      slug: generatedSlug,
      description: formData.description,
      parentId: formData.parentCategory === 'root' ? undefined : formData.parentCategory,
      productsCount: 0,
      status: 'active',
      sortOrder: categories.length + 1,
      createdAt: new Date().toISOString(),
    };

    if (formData.parentCategory === 'root') {
      setCategories([...categories, newCategory]);
    } else {
      // Add child to chosen parent category
      setCategories(
        categories.map((cat) => {
          if (cat.id === formData.parentCategory) {
            return {
              ...cat,
              children: [...(cat.children || []), newCategory],
            };
          }
          return cat;
        }),
      );
    }

    setIsAddOpen(false);
    setFormData({ name: '', slug: '', description: '', parentCategory: 'root' });
    toast.success(`Category "${newCategory.name}" added successfully!`);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    // Delete from top-level or children
    setCategories(
      categories
        .filter((c) => c.id !== id)
        .map((c) => ({
          ...c,
          children: c.children ? c.children.filter((ch) => ch.id !== id) : [],
        })),
    );
    toast.success(`Category "${name}" removed`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Organize multi-level taxonomy, root departments, and sub-categories">
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Hierarchical Category Tree</CardTitle>
          <CardDescription>Click dropdown arrows to expand child category groupings</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {categories.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No product categories created yet. Click &quot;Add Category&quot; above to create your first root category.
              </div>
            ) : (
              categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onDelete={handleDeleteCategory}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-primary" /> Create New Category
            </DialogTitle>
            <DialogDescription>
              Define a new category or sub-category to structure the catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCategory} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catName" className="text-xs font-semibold">Category Name *</Label>
              <Input
                id="catName"
                placeholder="e.g. Organic Dairy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catSlug" className="text-xs font-semibold">Slug (URL friendly)</Label>
              <Input
                id="catSlug"
                placeholder="e.g. organic-dairy"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parentCategory" className="text-xs font-semibold">Parent Category</Label>
              <select
                id="parentCategory"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.parentCategory}
                onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
              >
                <option value="root">None (Top-Level Root Department)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    Under &quot;{cat.name}&quot;
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc" className="text-xs font-semibold">Description</Label>
              <Input
                id="catDesc"
                placeholder="e.g. Farm-fresh milk, butter, and cheese"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
