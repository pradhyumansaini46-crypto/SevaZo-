import { Map } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function DeliveryZonesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Delivery Zones" description="Configure delivery zones and coverage" />
      <EmptyState
        icon={Map}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
