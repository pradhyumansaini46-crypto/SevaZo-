import { notFound } from 'next/navigation';
import { getSharedStore } from '@/lib/server/shared-storage';
import { VendorDetailClient } from './vendor-detail-client';

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = getSharedStore();
  const vendor = store.vendors.find((v) => v.id === id);

  if (!vendor) {
    notFound();
  }

  return <VendorDetailClient initialVendor={vendor} />;
}
