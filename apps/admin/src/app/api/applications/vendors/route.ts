import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getSharedStore, updateVendorStatus } from '@/lib/server/shared-storage';

export async function GET() {
  try {
    const store = getSharedStore();
    const localVendors = store.vendors || [];

    // Query real PostgreSQL Cloud Database via Prisma
    let dbVendors: any[] = [];
    try {
      const records = await prisma.vendor.findMany({
        include: {
          stores: true,
          documents: true,
          addresses: true,
          bankAccounts: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      dbVendors = records.map((v) => {
        const store = v.stores[0];
        const addr = v.addresses[0];
        const bank = v.bankAccounts[0];

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

        return {
          id: v.id,
          storeName: store?.name || v.businessName || 'Partner Store',
          ownerName: v.ownerName || `${v.firstName || ''} ${v.lastName || ''}`.trim() || 'Store Owner',
          email: v.email,
          phone: v.phone,
          logo: store?.logo || v.avatar || '',
          banner: store?.banner || '',
          profilePhoto: v.profilePhoto || '',
          status: statusMap[v.status] || 'pending',
          approvalStatus: approvalMap[v.status] || 'pending',
          category: v.businessCategory || v.businessType || 'Grocery',
          businessType: v.businessType || 'RETAIL_STORE',
          legalEntityType: v.legalEntityType || 'PROPRIETORSHIP',
          panNumber: v.panNumber || '',
          gstin: v.gstin || '',
          fssaiNumber: v.fssaiNumber || '',
          address: {
            line1: addr?.line1 || 'Main Market Road',
            city: addr?.city || 'Jaipur',
            state: addr?.state || 'Rajasthan',
            pincode: addr?.pincode || '302020',
            latitude: addr?.latitude || 26.9124,
            longitude: addr?.longitude || 75.7873,
          },
          productsCount: v.ordersCount || 0,
          ordersCount: v.ordersCount || 0,
          rating: Number(v.rating) || 5.0,
          commissionRate: Number(v.commissionRate) || 10,
          totalRevenue: Number(v.totalRevenue) || 0,
          documents: v.documents.map((d) => ({
            id: d.id,
            type: d.type.toLowerCase(),
            number: d.documentNumber,
            fileUrl: d.fileUrl,
            verified: d.verified || d.status === 'VERIFIED',
          })),
          submittedAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
          draftData: {
            storeName: store?.name || v.businessName,
            ownerName: v.ownerName,
            phone: v.phone,
            email: v.email,
            category: v.businessCategory || v.businessType,
            gstin: v.gstin,
            fssaiNumber: v.fssaiNumber,
            panNumber: v.panNumber,
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
      });
    } catch (e) {
      console.warn('Database query notice:', e);
    }

    // Merge: Database records take priority, then any non-duplicate local records
    const allVendors = [...dbVendors];
    for (const lv of localVendors) {
      const exists = allVendors.some(
        (v) => v.id === lv.id || (v.phone && lv.phone && v.phone.replace(/\D/g, '') === lv.phone.replace(/\D/g, ''))
      );
      if (!exists) {
        allVendors.push(lv);
      }
    }

    // Sort descending by timestamp
    const getTime = (v: any) => {
      const t = v.submittedAt || v.createdAt || v.updatedAt;
      return t ? new Date(t).getTime() : 0;
    };
    const sorted = allVendors.sort((a, b) => getTime(b) - getTime(a));

    return NextResponse.json({ success: true, data: sorted, total: sorted.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, approvalStatus, status, reason } = body;

    if (!id || !approvalStatus) {
      return NextResponse.json({ success: false, message: 'id and approvalStatus required' }, { status: 400 });
    }

    // 1. Update PostgreSQL Cloud Database via Prisma
    try {
      const dbStatus =
        approvalStatus === 'approved'
          ? 'APPROVED'
          : approvalStatus === 'rejected'
          ? 'REJECTED'
          : 'UNDER_REVIEW';

      await prisma.vendor.updateMany({
        where: { id },
        data: {
          status: dbStatus as any,
          rejectionReason: reason || null,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma vendor update notice:', dbErr);
    }

    // 2. Update local shared store
    const updated = updateVendorStatus(id, approvalStatus, status);

    // 3. Try forwarding to backend if reachable
    try {
      await fetch(`http://localhost:4000/api/v1/vendors/${id}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: approvalStatus.toUpperCase(), reason }),
      });
    } catch (e) {}

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
