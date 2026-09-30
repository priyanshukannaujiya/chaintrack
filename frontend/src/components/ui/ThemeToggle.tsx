import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, type Theme } from '../../context/ThemeContext';
import { cn } from './Button';

interface ThemeToggleProps {
  className?: string;
  showDropdown?: boolean;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  showDropdown = false,
  size = 'md',
}) => {
  const { theme, resolvedTheme, isDark, setTheme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const buttonSize = size === 'sm' ? 'p-1.5' : 'p-2';
  const iconSize = size === 'sm' ? 14 : 16;

  if (!showDropdown) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={cn(
          'relative rounded-xl text-textMuted hover:text-textMain hover:bg-surface-2 border border-border/60 hover:border-border transition-all duration-200 select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
          buttonSize,
          className
        )}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          <Sun
            size={iconSize}
            className={cn(
              'absolute text-amber-500 transition-all duration-300 transform',
              isDark
                ? 'opacity-0 rotate-90 scale-50 pointer-events-none'
                : 'opacity-100 rotate-0 scale-100'
            )}
          />
          <Moon
            size={iconSize}
            className={cn(
              'absolute text-primary transition-all duration-300 transform',
              isDark
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
            )}
          />
        </div>
      </button>
    );
  }

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Theme settings"
        title="Theme preferences"
        className={cn(
          'flex items-center gap-2 rounded-xl text-textMuted hover:text-textMain hover:bg-surface-2 border border-border/80 hover:border-border transition-all select-none',
          buttonSize,
          className
        )}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {resolvedTheme === 'dark' ? (
            <Moon size={iconSize} className="text-primary" />
          ) : (
            <Sun size={iconSize} className="text-amber-500" />
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 glass-strong border border-border rounded-xl shadow-xl py-1.5 z-50 animate-slide-up text-left">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-textMuted">
            Theme
          </div>
          {options.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors',
                theme === value
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-textSub hover:text-textMain hover:bg-surface-2'
              )}
            >
              <div className="flex items-center gap-2">
                <Icon size={13} />
                <span>{label}</span>
              </div>
              {theme === value && <Check size={12} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
