import { MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Disputes" description="Handle order disputes" />
      <EmptyState
        icon={MessageSquare}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
