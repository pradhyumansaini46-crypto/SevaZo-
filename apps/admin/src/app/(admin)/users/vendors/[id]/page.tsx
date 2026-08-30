import { notFound } from 'next/navigation';
import { prisma } from '@/lib/server/prisma';
import { getSharedStore } from '@/lib/server/shared-storage';
import { VendorDetailClient } from './vendor-detail-client';

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = getSharedStore();
  let vendor = store.vendors.find((v) => v.id === id);

  // If not found in shared storage, query directly from PostgreSQL database
  if (!vendor) {
    try {
      const dbVendor = await prisma.vendor.findFirst({
        where: {
          OR: [
            { id },
            { phone: id },
            { phone: id.startsWith('+') ? id : `+91 ${id}` },
          ],
        },
        include: {
          stores: true,
          documents: true,
          addresses: true,
          bankAccounts: true,
        },
      });

      if (dbVendor) {
        const dbStore = dbVendor.stores[0];
        const addr = dbVendor.addresses[0];
        const bank = dbVendor.bankAccounts[0];

        const statusMap: Record<string, string> = {
          SUBMITTED: 'pending',
          UNDER_REVIEW: 'pending',
          DRAFT: 'pending',
          APPROVED: 'active',
          REJECTED: 'rejected',
          SUSPENDED: 'suspended',
        };

        const approvalMap: Record<string, string> = {
          SUBMITTED: 'pending',
          UNDER_REVIEW: 'under_review',
          DRAFT: 'pending',
          APPROVED: 'approved',
          REJECTED: 'rejected',
          SUSPENDED: 'rejected',
        };

        vendor = {
          id: dbVendor.id,
          storeName: dbStore?.name || dbVendor.businessName || 'Partner Store',
          ownerName: dbVendor.ownerName || `${dbVendor.firstName || ''} ${dbVendor.lastName || ''}`.trim() || 'Store Owner',
          email: dbVendor.email,
          phone: dbVendor.phone,
          logo: dbStore?.logo || dbVendor.avatar || '',
          banner: dbStore?.banner || '',
          profilePhoto: dbVendor.profilePhoto || '',
          status: (statusMap[dbVendor.status] || 'pending') as any,
          approvalStatus: (approvalMap[dbVendor.status] || 'pending') as any,
          category: dbVendor.businessCategory || dbVendor.businessType || 'Grocery',
          businessType: dbVendor.businessType || 'RETAIL_STORE',
          legalEntityType: dbVendor.legalEntityType || 'PROPRIETORSHIP',
          panNumber: dbVendor.panNumber || '',
          gstin: dbVendor.gstin || '',
          fssaiNumber: dbVendor.fssaiNumber || '',
          address: {
            line1: addr?.line1 || 'Main Market Road',
            city: addr?.city || 'Jaipur',
            state: addr?.state || 'Rajasthan',
            pincode: addr?.pincode || '302020',
            latitude: addr?.latitude || 26.9124,
            longitude: addr?.longitude || 75.7873,
          },
          productsCount: dbVendor.ordersCount || 0,
          ordersCount: dbVendor.ordersCount || 0,
          rating: Number(dbVendor.rating) || 5.0,
          commissionRate: Number(dbVendor.commissionRate) || 10,
          totalRevenue: Number(dbVendor.totalRevenue) || 0,
          documents: dbVendor.documents.map((d) => ({
            id: d.id,
            type: d.type.toLowerCase(),
            number: d.documentNumber,
            fileUrl: d.fileUrl,
            verified: d.verified || d.status === 'VERIFIED',
          })),
          submittedAt: dbVendor.createdAt.toISOString(),
          updatedAt: dbVendor.updatedAt.toISOString(),
          draftData: {
            storeName: dbStore?.name || dbVendor.businessName,
            ownerName: dbVendor.ownerName,
            phone: dbVendor.phone,
            email: dbVendor.email,
            category: dbVendor.businessCategory || dbVendor.businessType,
            gstin: dbVendor.gstin,
            fssaiNumber: dbVendor.fssaiNumber,
            panNumber: dbVendor.panNumber,
            banking: bank ? {
              accountNumber: bank.accountNumber,
              ifscCode: bank.ifsc,
              bankName: bank.bankName,
            } : undefined,
            address: addr ? {
              line1: addr.line1,
              city: addr.city,
              state: addr.state,
              pincode: addr.pincode,
            } : undefined,
          },
        };
      }
    } catch (dbErr) {
      console.warn('Prisma vendor detail fetch notice:', dbErr);
    }
  }

  if (!vendor) {
    notFound();
  }

  return <VendorDetailClient initialVendor={vendor} />;
}
