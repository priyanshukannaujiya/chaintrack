import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none overflow-hidden';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    primary: [
      'bg-gradient-to-r from-primary to-secondary text-white',
      'shadow-[0_4px_20px_rgba(79,110,247,0.35)]',
      'hover:shadow-[0_6px_28px_rgba(79,110,247,0.5)]',
      'hover:-translate-y-0.5 active:translate-y-0',
      'before:absolute before:inset-0 before:bg-white/0 hover:before:bg-white/5 before:transition-colors before:duration-200',
    ].join(' '),
    secondary: [
      'bg-surface-2 border border-border text-textSub',
      'hover:border-border-light hover:text-textMain hover:bg-surface',
      'hover:-translate-y-0.5 active:translate-y-0',
    ].join(' '),
    ghost: [
      'text-textSub',
      'hover:bg-surface-2 hover:text-textMain',
    ].join(' '),
    danger: [
      'bg-danger/10 border border-danger/30 text-danger',
      'hover:bg-danger/20 hover:border-danger/50',
    ].join(' '),
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
