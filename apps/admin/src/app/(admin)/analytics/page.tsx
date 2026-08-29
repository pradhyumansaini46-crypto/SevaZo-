import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Platform analytics and insights" />
      <EmptyState
        icon={BarChart3}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
