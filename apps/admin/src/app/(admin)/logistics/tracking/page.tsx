import { Radio } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function LiveTrackingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Live Tracking" description="Real-time delivery tracking" />
      <EmptyState
        icon={Radio}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
