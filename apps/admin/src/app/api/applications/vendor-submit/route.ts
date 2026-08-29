import { NextResponse } from 'next/server';
import { upsertVendor, SharedVendorApplication, SharedDocument } from '@/lib/server/shared-storage';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const storeName = payload.storeDisplayName || payload.storeName || payload.store?.storeName || payload.businessName || 'Partner Store';
    const ownerName = payload.ownerName || (payload.firstName ? `${payload.firstName} ${payload.lastName || ''}`.trim() : 'Store Owner');
    const email = payload.email || payload.storeEmail || 'vendor@example.com';
    const phone = payload.phone || payload.storePhone || '+91 9988776655';
    const category = payload.businessCategory || payload.category || payload.business?.category || 'General Store';

    const addr = {
      line1: payload.address?.line1 || payload.line1 || payload.addressLine1 || 'Main Market Road',
      area: payload.address?.area || payload.area || '',
      city: payload.address?.city || payload.city || 'Jaipur',
      state: payload.address?.state || payload.state || 'Rajasthan',
      pincode: payload.address?.pincode || payload.pincode || '302020',
      latitude: payload.address?.latitude || payload.latitude || 26.9124,
      longitude: payload.address?.longitude || payload.longitude || 75.7873,
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

    const vendorId = payload.vendorId || `vnd-${phone.replace(/\D/g, '').slice(-6) || Math.floor(100000 + Math.random() * 900000)}`;

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
