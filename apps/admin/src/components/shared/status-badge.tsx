import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusVariants: Record<string, string> = {
  active: 'bg-green-100 text-green-800 hover:bg-green-100',
  inactive: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  blocked: 'bg-red-100 text-red-800 hover:bg-red-100',
  deleted: 'bg-red-100 text-red-800 hover:bg-red-100',
  suspended: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  under_review: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  approved: 'bg-green-100 text-green-800 hover:bg-green-100',
  rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
  confirmed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  preparing: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
  ready: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  picked_up: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
  in_transit: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  delivered: 'bg-green-100 text-green-800 hover:bg-green-100',
  cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
  returned: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  paid: 'bg-green-100 text-green-800 hover:bg-green-100',
  failed: 'bg-red-100 text-red-800 hover:bg-red-100',
  refunded: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  blocked: 'Blocked',
  deleted: 'Deleted',
  suspended: 'Suspended',
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'border-0 font-medium',
        statusVariants[status] || 'bg-gray-100 text-gray-800',
        className
      )}
    >
      {statusLabels[status] || status}
    </Badge>
  );
}
