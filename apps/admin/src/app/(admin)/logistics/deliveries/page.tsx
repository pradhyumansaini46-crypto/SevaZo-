import { Truck } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function DeliveriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Deliveries" description="Track and manage deliveries" />
      <EmptyState
        icon={Truck}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
