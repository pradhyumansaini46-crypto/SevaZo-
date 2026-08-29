import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Platform configuration and settings" />
      <EmptyState
        icon={Settings}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
