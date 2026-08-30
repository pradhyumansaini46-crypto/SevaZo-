import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { upsertVendor, SharedVendorApplication, SharedDocument } from '@/lib/server/shared-storage';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const storeName = payload.storeDisplayName || payload.storeName || payload.store?.storeName || payload.businessName || 'Partner Store';
    const ownerName = payload.ownerName || (payload.firstName ? `${payload.firstName} ${payload.lastName || ''}`.trim() : 'Store Owner');
    const email = payload.email || payload.storeEmail || `vendor.${Date.now()}@sevazo.com`;
    const phone = payload.phone || payload.storePhone || '+91 9988776655';
    const category = payload.businessCategory || payload.category || payload.business?.category || 'General Store';

    const addr = {
      line1: payload.address?.line1 || payload.line1 || payload.addressLine1 || 'Main Market Road',
      area: payload.address?.area || payload.area || '',
      city: payload.address?.city || payload.city || 'Jaipur',
      state: payload.address?.state || payload.state || 'Rajasthan',
      pincode: payload.address?.pincode || payload.pincode || '302020',
      latitude: Number(payload.address?.latitude || payload.latitude) || 26.9124,
      longitude: Number(payload.address?.longitude || payload.longitude) || 75.7873,
    };

    const docs: SharedDocument[] = [];

    // If explicit documentsList or documents array is provided
    const rawDocs = payload.documentsList || payload.documents;
    if (Array.isArray(rawDocs) && rawDocs.length > 0) {
      rawDocs.forEach((d: any) => {
        docs.push({
          id: d.id || `doc-${Date.now()}-${d.type || 'kyc'}`,
          type: (d.type || 'document').toLowerCase(),
          number: d.documentNumber || d.number || d.name || 'SUBMITTED',
          fileUrl: d.fileUrl || d.url || (d.type === 'gst' ? '/docs/gst.pdf' : d.type === 'pan' ? '/docs/pan.pdf' : d.type === 'fssai' ? '/docs/fssai.pdf' : '/docs/cheque.pdf'),
          verified: d.status === 'UPLOADED' || d.verified === true,
        });
      });
    }

    // Complement with individual fields if not in array
    const gstin = payload.gstin || payload.business?.gstin || payload.kyc?.gstin;
    if (gstin && !docs.some(d => d.type === 'gst' || d.type === 'gstin')) {
      docs.push({
        id: `doc-${Date.now()}-gst`,
        type: 'gst',
        number: gstin,
        fileUrl: payload.gstCertificateUrl || '/docs/gst.pdf',
        verified: true,
      });
    }

    const fssai = payload.fssaiNumber || payload.business?.fssai || payload.kyc?.fssai;
    if (fssai && !docs.some(d => d.type === 'fssai')) {
      docs.push({
        id: `doc-${Date.now()}-fssai`,
        type: 'fssai',
        number: fssai,
        fileUrl: payload.fssaiCertificateUrl || '/docs/fssai.pdf',
        verified: true,
      });
    }

    const pan = payload.panNumber || payload.business?.pan || payload.kyc?.pan;
    if (pan && !docs.some(d => d.type === 'pan')) {
      docs.push({
        id: `doc-${Date.now()}-pan`,
        type: 'pan',
        number: pan,
        fileUrl: payload.panCardUrl || '/docs/pan.pdf',
        verified: true,
      });
    }

    const bankAcc = payload.banking?.accountNumber || payload.bankAccount?.accountNumber;
    if (bankAcc && !docs.some(d => d.type === 'bank_cheque' || d.type === 'cheque')) {
      docs.push({
        id: `doc-${Date.now()}-bank`,
        type: 'bank_cheque',
        number: bankAcc,
        fileUrl: payload.cancelledChequeUrl || '/docs/cheque.pdf',
        verified: true,
      });
    }

    // 1. Save directly into PostgreSQL Cloud Database via Prisma
    let dbVendorId: string | null = null;
    try {
      const savedVendor = await prisma.vendor.upsert({
        where: { phone },
        update: {
          ownerName,
          email,
          businessName: storeName,
          businessCategory: category,
          businessType: payload.businessType || 'RETAIL_STORE',
          legalEntityType: payload.legalEntityType || 'PROPRIETORSHIP',
          panNumber: pan || '',
          gstin: gstin || '',
          fssaiNumber: fssai || '',
          status: 'SUBMITTED',
          currentOnboardingStep: 13,
          completionPercentage: 100,
          agreedAt: new Date(),
        },
        create: {
          phone,
          ownerName,
          email,
          businessName: storeName,
          businessCategory: category,
          businessType: payload.businessType || 'RETAIL_STORE',
          legalEntityType: payload.legalEntityType || 'PROPRIETORSHIP',
          panNumber: pan || '',
          gstin: gstin || '',
          fssaiNumber: fssai || '',
          status: 'SUBMITTED',
          currentOnboardingStep: 13,
          completionPercentage: 100,
          agreedAt: new Date(),
        },
      });
      dbVendorId = savedVendor.id;

      // Save Address in DB
      await prisma.vendorAddress.upsert({
        where: { id: `addr-${savedVendor.id}` },
        update: {
          line1: addr.line1,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          latitude: addr.latitude,
          longitude: addr.longitude,
        },
        create: {
          id: `addr-${savedVendor.id}`,
          vendorId: savedVendor.id,
          label: 'Storefront',
          line1: addr.line1,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          latitude: addr.latitude,
          longitude: addr.longitude,
          isDefault: true,
        },
      });

      // Save Documents in DB
      for (const d of docs) {
        await prisma.vendorDocument.upsert({
          where: { id: `doc-${savedVendor.id}-${d.type}` },
          update: {
            documentNumber: d.number,
            fileUrl: d.fileUrl,
            status: 'UPLOADED',
          },
          create: {
            id: `doc-${savedVendor.id}-${d.type}`,
            vendorId: savedVendor.id,
            type: d.type.toUpperCase(),
            documentNumber: d.number,
            fileUrl: d.fileUrl,
            status: 'UPLOADED',
          },
        });
      }

      // Save Store in DB
      await prisma.store.upsert({
        where: { slug: `store-${phone.replace(/\D/g, '').slice(-6)}` },
        update: {
          name: storeName,
          vendorId: savedVendor.id,
          isOpen: true,
          isAcceptingOrders: false,
        },
        create: {
          slug: `store-${phone.replace(/\D/g, '').slice(-6)}`,
          name: storeName,
          vendorId: savedVendor.id,
          isOpen: true,
          isAcceptingOrders: false,
        },
      });
    } catch (dbErr) {
      console.warn('Direct PostgreSQL sync notice:', dbErr);
    }

    const vendorId = dbVendorId || payload.vendorId || `vnd-${phone.replace(/\D/g, '').slice(-6) || Math.floor(100000 + Math.random() * 900000)}`;

    const sharedVendor: SharedVendorApplication = {
      id: vendorId,
      storeName,
      ownerName,
      email,
      phone,
      logo: payload.storeLogo || payload.logo || '',
      banner: payload.storeBanner || payload.banner || '',
      profilePhoto: payload.profilePhoto || payload.avatar || '',
      status: 'pending',
      approvalStatus: 'pending',
      category,
      businessType: payload.businessType || 'RETAIL_STORE',
      legalEntityType: payload.legalEntityType || 'PROPRIETORSHIP',
      panNumber: pan || '',
      gstin: gstin || '',
      fssaiNumber: fssai || '',
      address: addr,
      shopPhotos: Array.isArray(payload.shopPhotos) ? payload.shopPhotos : (Array.isArray(payload.photos) ? payload.photos : []),
      productsCount: 0,
      ordersCount: 0,
      rating: 5.0,
      commissionRate: 10,
      totalRevenue: 0,
      documents: docs.length > 0 ? docs : [
        { id: `doc-${vendorId}-reg`, type: 'store_license', number: 'Submitted', fileUrl: '/docs/license.pdf', verified: false }
      ],
      schedules: payload.schedules || [],
      banking: payload.banking || payload.bankAccount || { payoutPreference: 'BANK_ACCOUNT' },
      consent: payload.consent || {
        signatoryRole: payload.signatoryRole || 'Proprietor',
        signatoryName: payload.signatoryName || ownerName,
        escalationContactName: payload.escalationContactName || '',
        escalationContactPhone: payload.escalationContactPhone || '',
        escalationContactEmail: payload.escalationContactEmail || '',
        taxComplianceType: payload.taxComplianceType || 'Regular GST Registered',
        consentedAt: payload.consentedAt || new Date().toISOString(),
        agreementVersion: payload.agreementVersion || 'v2.4',
      },
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draftData: payload,
    };

    upsertVendor(sharedVendor);

    return NextResponse.json({
      success: true,
      message: 'Vendor application received and recorded in verification queue.',
      data: sharedVendor,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
