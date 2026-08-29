import { HeadphonesIcon } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function SupportTicketsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" description="Customer support ticket management" />
      <EmptyState
        icon={HeadphonesIcon}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
