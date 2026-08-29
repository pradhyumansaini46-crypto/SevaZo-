import { Image } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function BannersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Banners" description="Manage app banners and carousels" />
      <EmptyState
        icon={Image}
        title="Coming Soon"
        description="This module is under development and will be available shortly."
      />
    </div>
  );
}
