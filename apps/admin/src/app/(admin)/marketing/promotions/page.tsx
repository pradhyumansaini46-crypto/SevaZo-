import { Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Promotions" description="Manage promotional campaigns" />
      <EmptyState
        icon={Megaphone}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
