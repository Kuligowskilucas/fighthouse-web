import { type LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger';
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
            variant === 'danger'
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-100 text-gray-700',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500">{label}</p>
          <p
            className={cn(
              'text-lg font-semibold',
              variant === 'danger' ? 'text-red-600' : 'text-gray-900',
            )}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}