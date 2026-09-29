import React from 'react';
import { cn } from './Button';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', dot = false }) => {
  const variants: Record<BadgeVariant, { wrapper: string; dot: string }> = {
    default:  { wrapper: 'bg-surface-2 text-textSub border border-border',                         dot: 'bg-textMuted' },
    success:  { wrapper: 'bg-success/10 text-success border border-success/20',                    dot: 'bg-success' },
    warning:  { wrapper: 'bg-warning/10 text-warning border border-warning/20',                    dot: 'bg-warning' },
    danger:   { wrapper: 'bg-danger/10 text-danger border border-danger/20',                       dot: 'bg-danger' },
    info:     { wrapper: 'bg-primary/10 text-primary border border-primary/20',                    dot: 'bg-primary' },
    purple:   { wrapper: 'bg-secondary/10 text-secondary border border-secondary/20',              dot: 'bg-secondary' },
  };

  const { wrapper, dot: dotColor } = variants[variant];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold', wrapper)}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', dotColor)} />
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dotColor)} />
        </span>
      )}
      {children}
    </span>
  );
};
