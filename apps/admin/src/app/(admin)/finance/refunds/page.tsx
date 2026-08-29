import { Receipt } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function RefundsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Refunds" description="Process and track refunds" />
      <EmptyState
        icon={Receipt}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
