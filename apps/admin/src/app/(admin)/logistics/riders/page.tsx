import { Bike } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function RiderManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Rider Management" description="Monitor and manage rider operations" />
      <EmptyState
        icon={Bike}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
