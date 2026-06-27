import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const statusStyles: Record<StatusType, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  error: 'bg-red-500/10 text-red-600 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  neutral: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border', statusStyles[status], className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', {
        'bg-emerald-500': status === 'success',
        'bg-amber-500': status === 'warning',
        'bg-red-500': status === 'error',
        'bg-blue-500': status === 'info',
        'bg-gray-500': status === 'neutral',
      })} />
      {label}
    </span>
  );
}
