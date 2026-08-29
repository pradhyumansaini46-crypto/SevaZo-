import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { getSharedStore } from '@/lib/server/shared-storage';
import { ArrowLeft, Mail, Phone, Bike, MapPin, Truck, Star, IndianRupee, FileCheck, Circle } from 'lucide-react';
import Link from 'next/link';

export default async function RiderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getSharedStore();
  const rider = store.riders.find((r) => r.id === id);

  if (!rider) {
    return <div className="p-6"><h1 className="text-xl font-bold">Rider not found</h1></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/users/riders"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title={rider.name} description={`Rider ID: ${rider.id}`}>
          <div className="flex items-center gap-2">
            <Circle className={`h-2 w-2 fill-current ${rider.isOnline ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm">{rider.isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <StatusBadge status={rider.status} />
        </PageHeader>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span>{rider.email}</span></div>
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{rider.phone}</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span>Zone: {rider.zone}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vehicle & Stats</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="flex items-center gap-2"><Bike className="h-4 w-4 text-muted-foreground" />Vehicle</span><span className="font-medium capitalize">{rider.vehicleType} ({rider.vehicleNumber})</span></div>
            <div className="flex justify-between"><span className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" />Deliveries</span><span className="font-bold">{rider.deliveriesCount}</span></div>
            <div className="flex justify-between"><span className="flex items-center gap-2"><Star className="h-4 w-4 text-muted-foreground" />Rating</span><span className="font-bold">{rider.rating}/5</span></div>
            <div className="flex justify-between"><span className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-muted-foreground" />Total Earnings</span><span className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(rider.totalEarnings)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {rider.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-muted-foreground" /><span className="text-sm uppercase">{doc.type.replace(/_/g, ' ')}</span></div>
                <Badge variant={doc.verified ? 'default' : 'secondary'}>{doc.verified ? 'Verified' : 'Pending'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
