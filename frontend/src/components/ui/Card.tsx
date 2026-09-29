import React from 'react';
import { cn } from './Button';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false, glow = false }) => (
  <div
    className={cn(
      'glass rounded-2xl p-6 relative overflow-hidden',
      hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:border-border-light hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] cursor-pointer',
      glow && 'glow-primary',
      className
    )}
  >
    {/* Subtle gradient sheen on top */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />
    {children}
  </div>
);
