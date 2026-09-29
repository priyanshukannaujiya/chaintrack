import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import {
  LayoutDashboard, Package, Truck, LogOut, ChevronRight,
  Bell, Settings, Zap
} from 'lucide-react';
import { cn } from '../components/ui/Button';

const Logo: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_4px_14px_rgba(79,110,247,0.45)]">
      <Zap size={18} className="text-white fill-white" />
    </div>
    <div>
      <span className="text-base font-bold tracking-tight text-textMain">Chain</span>
      <span className="text-base font-bold tracking-tight gradient-text">Track</span>
    </div>
  </div>
);

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/products',  icon: Package,         label: 'Products' },
  { to: '/shipments', icon: Truck,            label: 'Shipments' },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 300);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-border bg-surface/40 backdrop-blur-xl relative z-20">
        {/* Top accent */}
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-primary/20 via-secondary/10 to-transparent pointer-events-none" />

        {/* Logo area */}
        <div className="px-5 py-5 border-b border-border">
          <Logo />
          <div className="mt-3 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-[10px] font-medium text-accent tracking-wider uppercase">Live</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-textMuted">
            Workspace
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'nav-active'
                    : 'text-textMuted hover:text-textSub hover:bg-surface-2'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={cn(
                      'shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-textMuted group-hover:text-textSub'
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-primary/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user area */}
        <div className="px-3 py-4 border-t border-border space-y-0.5">
          <button className="group flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-textMuted hover:text-textSub hover:bg-surface-2 transition-all duration-150">
            <Settings size={17} className="shrink-0" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-textMuted hover:text-danger hover:bg-danger/8 transition-all duration-150"
          >
            <LogOut size={17} className="shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 flex items-center justify-end px-6 border-b border-border bg-surface/20 backdrop-blur-sm gap-3">
          <button className="p-2 rounded-xl text-textMuted hover:text-textMain hover:bg-surface-2 transition-all">
            <Bell size={17} />
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-[0_2px_10px_rgba(79,110,247,0.4)]">
            P
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto relative">
          {/* Ambient blobs */}
          <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] -translate-y-1/3 translate-x-1/3" />
          <div className="pointer-events-none fixed bottom-0 left-64 w-[400px] h-[400px] rounded-full bg-secondary/4 blur-[100px] translate-y-1/3" />

          <div className="relative z-10 px-8 py-8 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
