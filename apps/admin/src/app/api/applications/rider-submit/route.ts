import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { upsertRider, SharedRiderApplication, SharedDocument } from '@/lib/server/shared-storage';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const draft = payload.draftData || payload;

    const personal = draft.personal || draft.personalInfo || {};
    const vehicle = draft.vehicle || {};
    const identity = draft.identity || {};
    const dl = draft.drivingLicence || draft.drivingLicense || draft.driving_license || {};
    const vehicleDocs = draft.vehicleDocuments || draft.vehicle_documents || {};
    const serviceArea = draft.serviceArea || draft.service_area || {};
    const address = draft.address || {};
    const emergency = draft.emergencyContact || draft.emergency_contact || {};
    const banking = draft.banking || {};

    const firstName = personal.firstName || '';
    const lastName = personal.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || personal.name || 'Delivery Partner';
    const phone = personal.phone || payload.phone || '+91 9876543210';
    const email = personal.email || payload.email || 'partner@example.com';
    const vType = vehicle.vehicleType || 'MOTORCYCLE';
    const vNumber = vehicle.registrationNumber || vehicle.vehicleNumber || 'RJ 14 AB 1234';
    const zoneName = serviceArea.zoneName || serviceArea.primaryZone || serviceArea.city || 'Central Hub';

    const docs: SharedDocument[] = [];
    if (identity.idNumber || identity.aadhaarNumber) {
      docs.push({
        id: `doc-${Date.now()}-aadhaar`,
        type: (identity.idType || 'aadhaar').toLowerCase(),
        number: identity.idNumber || identity.aadhaarNumber,
        fileUrl: identity.frontImage || '/docs/aadhaar.pdf',
        verified: false,
      });
    }
    if (identity.panNumber || draft.pan?.panNumber) {
      docs.push({
        id: `doc-${Date.now()}-pan`,
        type: 'pan',
        number: identity.panNumber || draft.pan?.panNumber,
        fileUrl: identity.panImage || '/docs/pan.pdf',
        verified: false,
      });
    }
    if (dl.licenseNumber || dl.number) {
      docs.push({
        id: `doc-${Date.now()}-dl`,
        type: 'driving_license',
        number: dl.licenseNumber || dl.number,
        fileUrl: dl.frontImage || '/docs/dl.pdf',
        verified: false,
        expiry: dl.expiryDate,
      });
    }
    if (vehicleDocs.rcNumber || vehicleDocs.number) {
      docs.push({
        id: `doc-${Date.now()}-rc`,
        type: 'vehicle_rc',
        number: vehicleDocs.rcNumber || vehicleDocs.number,
        fileUrl: vehicleDocs.rcImage || '/docs/rc.pdf',
        verified: false,
      });
    }
    if (vehicleDocs.insuranceNumber) {
      docs.push({
        id: `doc-${Date.now()}-insurance`,
        type: 'insurance',
        number: vehicleDocs.insuranceNumber,
        fileUrl: vehicleDocs.insuranceImage || '/docs/insurance.pdf',
        verified: false,
        expiry: vehicleDocs.insuranceExpiry,
      });
    }

    // 1. Direct PostgreSQL Cloud Database Sync via Prisma
    let dbRiderId: string | null = null;
    try {
      const cleanPhone = phone.startsWith('+91') ? phone : `+91 ${phone.replace(/\D/g, '').slice(-10)}`;
      const savedRider = await prisma.rider.upsert({
        where: { phone: cleanPhone },
        update: {
          name: fullName,
          email,
          vehicleType: vType.toLowerCase().includes('scooter') ? 'SCOOTER' : 'BIKE',
          vehicleNumber: vNumber,
          status: 'INACTIVE',
          approvalStatus: 'PENDING',
          dlNumber: dl.licenseNumber || dl.number || null,
        },
        create: {
          name: fullName,
          phone: cleanPhone,
          email,
          vehicleType: vType.toLowerCase().includes('scooter') ? 'SCOOTER' : 'BIKE',
          vehicleNumber: vNumber,
          status: 'INACTIVE',
          approvalStatus: 'PENDING',
          dlNumber: dl.licenseNumber || dl.number || null,
          isOnline: false,
        },
      });
      dbRiderId = savedRider.id;
    } catch (dbErr) {
      console.warn('Direct PostgreSQL rider submission notice:', dbErr);
    }

    const riderId = dbRiderId || payload.riderId || `rdr-${phone.replace(/\D/g, '').slice(-6) || Math.floor(100000 + Math.random() * 900000)}`;

    const sharedApp: SharedRiderApplication = {
      id: riderId,
      name: fullName,
      email,
      phone,
      avatar: personal.profilePhoto || personal.avatar || '',
      status: 'pending',
      approvalStatus: 'PENDING',
      vehicleType: vType.toLowerCase(),
      vehicleNumber: vNumber,
      zone: zoneName,
      deliveriesCount: 0,
      rating: 5.0,
      totalEarnings: 0,
      isOnline: false,
      address: address.addressLine1 ? `${address.addressLine1}, ${address.city || ''} ${address.postalCode || ''}` : undefined,
      emergencyContact: (emergency.fullName || emergency.emergencyContactName) ? {
        name: emergency.fullName || emergency.emergencyContactName,
        phone: emergency.mobileNumber || emergency.emergencyContactPhone,
        relation: emergency.relationship || emergency.emergencyContactRelation,
      } : undefined,
      banking: banking.accountNumber ? {
        accountNumber: banking.accountNumber,
        ifscCode: banking.ifscCode,
        bankName: banking.bankName,
      } : undefined,
      documents: docs.length > 0 ? docs : [
        { id: `doc-${riderId}-kyc`, type: 'identity_proof', number: 'Submitted', fileUrl: '/docs/kyc.pdf', verified: false }
      ],
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draftData: draft,
    };

    upsertRider(sharedApp);

    return NextResponse.json({
      success: true,
      message: 'Rider application received and recorded in verification queue.',
      data: sharedApp,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
