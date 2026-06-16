import type { AlertPriority } from '@/types';
import { cn } from '@/lib/utils';

interface AlertBadgeProps {
  priority: AlertPriority;
  size?: 'sm' | 'md' | 'lg';
  withAnimation?: boolean;
  showLabel?: boolean;
  className?: string;
}

const priorityConfig: Record<AlertPriority, { bg: string; text: string; label: string; dot: string; border: string }> = {
  high: {
    bg: 'bg-alert-high/15',
    border: 'border-alert-high/40',
    text: 'text-alert-high',
    label: '紧急',
    dot: 'bg-alert-high',
  },
  medium: {
    bg: 'bg-alert-medium/15',
    border: 'border-alert-medium/40',
    text: 'text-alert-medium',
    label: '重要',
    dot: 'bg-alert-medium',
  },
  low: {
    bg: 'bg-alert-low/15',
    border: 'border-alert-low/40',
    text: 'text-alert-low',
    label: '一般',
    dot: 'bg-alert-low',
  },
};

export default function AlertBadge({
  priority,
  size = 'md',
  withAnimation = true,
  showLabel = true,
  className,
}: AlertBadgeProps) {
  const config = priorityConfig[priority];
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : size === 'lg' ? 'px-3 py-1' : 'px-2 py-0.5';
  const fontSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      config.bg,
      config.border,
      config.text,
      padding,
      fontSize,
      className,
    )}>
      <span className={cn(
        dotSize,
        'rounded-full',
        config.dot,
        withAnimation && priority === 'high' && 'animate-blink',
        withAnimation && priority === 'medium' && 'animate-pulse',
      )} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
