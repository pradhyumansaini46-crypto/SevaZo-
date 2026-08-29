import { NextResponse } from 'next/server';
import { getSharedStore, upsertRider, updateRiderStatus, deleteRider, SharedRiderApplication } from '@/lib/server/shared-storage';

export async function GET() {
  try {
    const store = getSharedStore();
    const liveRiders = store.riders || [];

    // Sort descending by timestamp: recently added riders appear at the very top
    const getTime = (r: any) => {
      const t = r.createdAt || r.submittedAt || r.updatedAt;
      return t ? new Date(t).getTime() : 0;
    };
    const sorted = [...liveRiders].sort((a, b) => getTime(b) - getTime(a));

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

    const riderData: SharedRiderApplication = {
      id: riderId,
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

    // Save to shared store (unshift puts it at the very top)
    upsertRider(riderData);

    // Forward to NestJS backend if reachable
    try {
      await fetch('http://localhost:4000/api/v1/rider/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: riderData.id,
          personal: riderData.draftData.personal,
          vehicle: riderData.draftData.vehicle,
          serviceArea: riderData.draftData.serviceArea,
        }),
      });
    } catch (e) {}

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

    const updated = updateRiderStatus(id, approvalStatus);

    // Try forwarding to backend
    try {
      await fetch(`http://localhost:4000/api/v1/riders/${id}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus, reason }),
      });
    } catch (e) {}

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

    const deleted = deleteRider(id);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
