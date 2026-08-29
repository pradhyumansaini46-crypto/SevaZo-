import { ApprovalStatus, Status } from './common';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productsCount: number;
  status: Status;
  sortOrder: number;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  status: Status;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: { id: string; name: string };
  brand?: { id: string; name: string };
  vendor: { id: string; storeName: string };
  price: number;
  compareAtPrice?: number;
  sku: string;
  stock: number;
  unit: string;
  status: Status;
  approvalStatus: ApprovalStatus;
  rating: number;
  reviewsCount: number;
  variants?: ProductVariant[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  attributes: Record<string, string>;
}
