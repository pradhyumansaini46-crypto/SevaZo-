import { CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="View all payment transactions" />
      <EmptyState
        icon={CreditCard}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
