import { Percent } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Commissions" description="Vendor commission management" />
      <EmptyState
        icon={Percent}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
