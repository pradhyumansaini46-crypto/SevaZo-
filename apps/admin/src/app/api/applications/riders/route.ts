import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { getSharedStore, upsertRider, updateRiderStatus, deleteRider, SharedRiderApplication } from '@/lib/server/shared-storage';

export async function GET() {
  try {
    const store = getSharedStore();
    const localRiders = store.riders || [];

    // Query real PostgreSQL Cloud Database via Prisma
    let dbRiders: any[] = [];
    try {
      const records = await prisma.rider.findMany({
        orderBy: { updatedAt: 'desc' },
      });

      dbRiders = records.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email || `${r.name.toLowerCase().replace(/\s+/g, '.')}@rider.sevazo.com`,
        avatar: r.avatar || '',
        status: (r.status === 'ACTIVE' ? 'active' : 'inactive') as any,
        approvalStatus: (r.approvalStatus === 'APPROVED' ? 'APPROVED' : r.approvalStatus === 'REJECTED' ? 'REJECTED' : 'PENDING') as any,
        vehicleType: r.vehicleType?.toLowerCase() || 'bike',
        vehicleNumber: r.vehicleNumber || 'RJ 14 AB 1234',
        zone: 'Central Hub',
        deliveriesCount: r.deliveriesCount || 0,
        rating: Number(r.rating) || 5.0,
        totalEarnings: Number(r.totalEarnings) || 0,
        isOnline: r.isOnline,
        documents: [
          {
            id: `doc-${r.id}-dl`,
            type: 'driving_license',
            number: r.dlNumber || r.vehicleNumber ? `DL-${(r.dlNumber || r.vehicleNumber || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()}` : 'DL-VERIFIED',
            fileUrl: '/docs/dl.pdf',
            verified: true,
          },
        ],
        createdAt: r.createdAt.toISOString(),
        submittedAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (e) {
      console.warn('Database rider query notice:', e);
    }

    // Merge: Database records take priority, then non-duplicate local records
    const allRiders = [...dbRiders];
    for (const lr of localRiders) {
      const exists = allRiders.some(
        (r) => r.id === lr.id || (r.phone && lr.phone && r.phone.replace(/\D/g, '') === lr.phone.replace(/\D/g, ''))
      );
      if (!exists) {
        allRiders.push(lr);
      }
    }

    // Sort descending by timestamp
    const getTime = (r: any) => {
      const t = r.createdAt || r.submittedAt || r.updatedAt;
      return t ? new Date(t).getTime() : 0;
    };
    const sorted = allRiders.sort((a, b) => getTime(b) - getTime(a));

    return NextResponse.json({ success: true, data: sorted, total: sorted.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, vehicleType, vehicleNumber, zone, status, approvalStatus } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, message: 'Name and phone are required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const cleanPhone = phone.startsWith('+91') ? phone : `+91 ${phone.replace(/\D/g, '').slice(-10)}`;
    const riderId = body.id || `rdr-${Date.now().toString().slice(-6)}`;

    // 1. Save to PostgreSQL Cloud Database via Prisma
    let dbRiderId: string | null = null;
    try {
      const savedRider = await prisma.rider.upsert({
        where: { phone: cleanPhone },
        update: {
          name: name.trim(),
          email: email ? email.trim() : `${name.trim().toLowerCase().replace(/\s+/g, '.')}@rider.sevazo.com`,
          vehicleType: vehicleType === 'bike' ? 'BIKE' : 'SCOOTER',
          vehicleNumber: vehicleNumber ? vehicleNumber.trim() : 'RJ 14 AB 1234',
          status: status === 'active' ? 'ACTIVE' : 'INACTIVE',
          approvalStatus: approvalStatus === 'APPROVED' ? 'APPROVED' : 'PENDING',
        },
        create: {
          name: name.trim(),
          phone: cleanPhone,
          email: email ? email.trim() : `${name.trim().toLowerCase().replace(/\s+/g, '.')}@rider.sevazo.com`,
          vehicleType: vehicleType === 'bike' ? 'BIKE' : 'SCOOTER',
          vehicleNumber: vehicleNumber ? vehicleNumber.trim() : 'RJ 14 AB 1234',
          status: status === 'active' ? 'ACTIVE' : 'INACTIVE',
          approvalStatus: approvalStatus === 'APPROVED' ? 'APPROVED' : 'PENDING',
          isOnline: true,
        },
      });
      dbRiderId = savedRider.id;
    } catch (dbErr) {
      console.warn('Direct PostgreSQL rider save notice:', dbErr);
    }

    const riderData: SharedRiderApplication = {
      id: dbRiderId || riderId,
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : `${name.trim().toLowerCase().replace(/\s+/g, '.')}@rider.sevazo.com`,
      avatar: body.avatar || '',
      status: (status as any) || 'active',
      approvalStatus: (approvalStatus as any) || 'APPROVED',
      vehicleType: vehicleType || 'bike',
      vehicleNumber: vehicleNumber ? vehicleNumber.trim() : 'RJ 14 AB 1234',
      zone: zone ? zone.trim() : 'Central Hub',
      deliveriesCount: body.deliveriesCount || 0,
      rating: body.rating || 5.0,
      totalEarnings: body.totalEarnings || 0,
      isOnline: body.isOnline ?? true,
      documents: body.documents || [
        {
          id: `doc-${Date.now()}-dl`,
          type: 'driving_license',
          number: vehicleNumber ? `DL-${vehicleNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase()}` : 'DL-VERIFIED',
          fileUrl: '/docs/dl.pdf',
          verified: true,
        },
      ],
      createdAt: now,
      submittedAt: now,
      updatedAt: now,
      draftData: body.draftData || {
        personal: {
          firstName: name.trim().split(' ')[0],
          lastName: name.trim().split(' ').slice(1).join(' ') || '',
          phone: cleanPhone,
          email: email || '',
        },
        vehicle: {
          vehicleType: vehicleType || 'bike',
          registrationNumber: vehicleNumber || 'Pending',
        },
        serviceArea: {
          zoneName: zone || 'Central Hub',
        },
      },
    };

    // Save to shared store
    upsertRider(riderData);

    return NextResponse.json({ success: true, data: riderData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, approvalStatus, reason } = body;

    if (!id || !approvalStatus) {
      return NextResponse.json({ success: false, message: 'id and approvalStatus required' }, { status: 400 });
    }

    // 1. Update in PostgreSQL Cloud Database via Prisma
    try {
      const dbStatus = approvalStatus === 'APPROVED' ? 'APPROVED' : approvalStatus === 'REJECTED' ? 'REJECTED' : 'PENDING';
      const userStatus = approvalStatus === 'APPROVED' ? 'ACTIVE' : 'INACTIVE';
      await prisma.rider.updateMany({
        where: { id },
        data: {
          approvalStatus: dbStatus as any,
          status: userStatus as any,
          rejectionReason: reason || null,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma rider update notice:', dbErr);
    }

    const updated = updateRiderStatus(id, approvalStatus);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Rider ID required' }, { status: 400 });
    }

    try {
      await prisma.rider.deleteMany({ where: { id } });
    } catch (e) {}

    const deleted = deleteRider(id);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
