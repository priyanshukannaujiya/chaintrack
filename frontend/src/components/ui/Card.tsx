import React from 'react';
import { cn } from './Button';

export const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
  <div className={cn("glass-panel rounded-xl p-6", className)}>
    {children}
  </div>
);
