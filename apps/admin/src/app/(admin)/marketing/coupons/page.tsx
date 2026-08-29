import { TicketPercent } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Coupons" description="Create and manage discount coupons" />
      <EmptyState
        icon={TicketPercent}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
