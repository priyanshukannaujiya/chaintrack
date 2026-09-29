import React from 'react';
import { cn } from './Button';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const variants = {
    default: "bg-surface text-textMuted border border-border",
    success: "bg-accent/10 text-accent border border-accent/20",
    warning: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
    error: "bg-red-500/10 text-red-500 border border-red-500/20",
    info: "bg-primary/10 text-primary border border-primary/20",
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant])}>
      {children}
    </span>
  );
};
