import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('bg-white/90 backdrop-blur-md border border-white/90 shadow-[0_4px_20px_rgba(227,253,245,0.25)] hover:shadow-[0_6px_28px_rgba(255,230,250,0.35)] hover:border-white transition-all duration-200', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
        <CardTitle className="text-sm font-medium text-slate-600 tracking-normal">{title}</CardTitle>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#E3FDF5] to-[#FFE6FA] border border-white/80 flex items-center justify-center shadow-2xs">
            <Icon className="h-4 w-4 text-teal-800" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{value}</div>
        {(description || trend) && (
          <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5 flex-wrap">
            {trend && (
              <span className={cn('font-semibold text-sm', trend.isPositive ? 'text-teal-700' : 'text-rose-600')}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            {description && (
              <span className="text-slate-500 font-medium text-sm">{description}</span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
