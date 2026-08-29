import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockCustomers } from '@/lib/mock-data';
import { ArrowLeft, Mail, Phone, MapPin, ShoppingCart, IndianRupee } from 'lucide-react';
import Link from 'next/link';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = mockCustomers.find((c) => c.id === id);

  if (!customer) {
    return <div className="p-6"><h1 className="text-xl font-bold">Customer not found</h1></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/users/customers"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <PageHeader title={customer.name} description={`Customer ID: ${customer.id}`}>
          <StatusBadge status={customer.status} />
        </PageHeader>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span>{customer.email}</span></div>
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{customer.phone}</span></div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Addresses</h4>
              {customer.addresses.map((addr) => (
                <div key={addr.id} className="flex items-start gap-3 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <Badge variant="outline" className="mb-1">{addr.label}</Badge>
                    <p className="text-sm">{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Activity Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><ShoppingCart className="h-4 w-4 text-muted-foreground" /><span>Total Orders</span></div>
              <span className="font-bold">{customer.ordersCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><IndianRupee className="h-4 w-4 text-muted-foreground" /><span>Total Spent</span></div>
              <span className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(customer.totalSpent)}</span>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p>Joined: {new Date(customer.createdAt).toLocaleDateString()}</p>
              <p>Last active: {new Date(customer.updatedAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
