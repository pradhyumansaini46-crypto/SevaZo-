import { Landmark } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function SettlementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settlements" description="Vendor payment settlements" />
      <EmptyState
        icon={Landmark}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
