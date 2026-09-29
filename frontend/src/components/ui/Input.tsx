import React from 'react';
import { cn } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, hint, error, icon, className, id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-widest text-textMuted">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-surface-2 border rounded-xl px-4 py-3 text-sm text-textMain placeholder:text-textMuted',
            'focus:outline-none focus:ring-1 transition-all duration-200',
            'hover:border-border-light',
            error
              ? 'border-danger/50 focus:ring-danger/40 focus:border-danger/60'
              : 'border-border focus:ring-primary/40 focus:border-primary/60',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <span className="text-xs text-textMuted">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
};
