import React from 'react';
import { cn } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-textMuted">{label}</label>}
      <input 
        className={cn(
          "w-full bg-background border rounded-lg px-4 py-2 text-textMain focus:outline-none focus:ring-2 transition-all",
          error ? "border-red-500 focus:ring-red-500/50" : "border-border focus:ring-primary focus:border-primary",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
