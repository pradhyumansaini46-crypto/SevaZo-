import { NextResponse } from 'next/server';
import { getSharedStore, updateVendorStatus } from '@/lib/server/shared-storage';

export async function GET() {
  try {
    const store = getSharedStore();
    const liveVendors = store.vendors || [];

    // Sort descending by timestamp: recently submitted vendors appear first
    const getTime = (v: any) => {
      const t = v.submittedAt || v.createdAt || v.updatedAt;
      return t ? new Date(t).getTime() : 0;
    };
    const sorted = [...liveVendors].sort((a, b) => getTime(b) - getTime(a));

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

    const updated = updateVendorStatus(id, approvalStatus, status);

    // Try forwarding to backend
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
