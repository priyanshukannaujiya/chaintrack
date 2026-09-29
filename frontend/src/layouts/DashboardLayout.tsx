import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import {
  LayoutDashboard, Package, Truck, LogOut, ChevronRight,
  Settings, Zap, Search, Bell, ShieldCheck,
  ChevronDown, Layers,
  X, Check
} from 'lucide-react';
import { cn } from '../components/ui/Button';

/* ── Live clock hook with high precision ── */
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/* ── Brand Logo with Enterprise Badge ── */
const Logo: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary-dark to-secondary flex items-center justify-center shadow-[0_4px_16px_rgba(79,110,247,0.45)] ring-1 ring-white/20">
      <Zap size={18} className="text-white fill-white" />
      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full ring-2 ring-surface" />
    </div>
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <span className="text-base font-bold tracking-tight text-textMain">Chain</span>
        <span className="text-base font-bold tracking-tight gradient-text">Track</span>
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20">
          PRO
        </span>
      </div>
      <span className="text-[10px] text-textMuted font-mono">v2.4.0 • Enterprise</span>
    </div>
  </div>
);

/* ── Precision Live Clock Widget ── */
const PrecisionLiveClock: React.FC = () => {
  const now = useLiveClock();

  // Full day name: e.g. "Tuesday"
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  // Date: e.g. "29 Sep 2026"
  const dateFormatted = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  
  // Ticking time parts
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const isPM = now.getHours() >= 12;
  const ampm = isPM ? 'PM' : 'AM';

  // Timezone short
  let tz = 'LOCAL';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace('_', ' ') || 'UTC';
  } catch {
    tz = 'UTC';
  }

  return (
    <div className="flex items-center gap-3 select-none bg-surface-2/60 border border-border/80 px-3.5 py-1.5 rounded-xl shadow-inner backdrop-blur-md">
      {/* Live Radar Pulse */}
      <div className="flex items-center gap-1.5 pr-2 border-r border-border/80">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="text-[10px] font-bold text-accent tracking-wider uppercase hidden md:inline">
          LIVE
        </span>
      </div>

      {/* Day Name & Calendar Date */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-textMain tracking-wide uppercase">
            {dayName}
          </span>
          <span className="text-[10px] text-textMuted font-medium">
            • {dateFormatted}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border hidden sm:block" />

      {/* Precision Digital Clock */}
      <div className="flex items-center gap-1 font-mono">
        <div className="bg-surface px-2 py-0.5 rounded-md border border-border/60 text-xs font-bold text-textMain tabular-nums tracking-wider shadow-sm">
          <span>{hours}</span>
          <span className="text-primary animate-pulse mx-0.5">:</span>
          <span>{minutes}</span>
          <span className="text-primary animate-pulse mx-0.5">:</span>
          <span className="text-accent">{seconds}</span>
        </div>
        <span className="text-[10px] font-bold text-textMuted px-1 uppercase tracking-tight">
          {ampm}
        </span>
        <span className="text-[9px] font-semibold text-textMuted/80 bg-surface/80 px-1 py-0.5 rounded border border-border/40 hidden lg:inline">
          {tz}
        </span>
      </div>
    </div>
  );
};

/* ── Global Search Modal / Bar ── */
const TopSearchBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-2/50 border border-border/80 text-textMuted hover:text-textSub hover:border-primary/40 transition-all text-xs w-64 text-left group"
      >
        <Search size={14} className="text-textMuted group-hover:text-primary transition-colors" />
        <span className="flex-1 truncate">Search assets, custody, tx...</span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-textMuted bg-surface rounded border border-border">
          ⌘K
        </kbd>
      </button>

      {/* Quick Search Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 animate-fade-in">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg glass-strong rounded-2xl border border-border shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <Search size={18} className="text-primary" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, shipment tracking ID, or Polygon Tx hash..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-textMain placeholder-textMuted focus:outline-none"
              />
              <button onClick={() => setOpen(false)} className="text-textMuted hover:text-textMain p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-3 text-xs text-textMuted space-y-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-textMuted">Suggested queries</p>
              <div className="px-3 py-2 rounded-lg hover:bg-surface-2 cursor-pointer flex items-center justify-between text-textSub">
                <span>View all in-transit shipments</span>
                <span className="text-[10px] text-primary">Jump ↵</span>
              </div>
              <div className="px-3 py-2 rounded-lg hover:bg-surface-2 cursor-pointer flex items-center justify-between text-textSub">
                <span>Verify Polygon smart contract ledger proofs</span>
                <span className="text-[10px] text-primary">Jump ↵</span>
              </div>
              <div className="px-3 py-2 rounded-lg hover:bg-surface-2 cursor-pointer flex items-center justify-between text-textSub">
                <span>Download cold-chain compliance report</span>
                <span className="text-[10px] text-primary">Jump ↵</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ── Activity / Notifications Popover ── */
const NotificationsMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-textMuted hover:text-textMain hover:bg-surface-2 border border-transparent hover:border-border transition-all"
        title="Ledger activity & alerts"
      >
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 glass-strong border border-border rounded-2xl shadow-2xl py-2 z-50 animate-slide-up text-left">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold text-textMain tracking-wide uppercase">System Notifications</span>
            <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
              Active
            </span>
          </div>
          <div className="p-4 text-xs text-textMuted text-center">
            <Check size={20} className="text-accent mx-auto mb-1.5" />
            <p className="font-semibold text-textMain text-xs">All Systems Operational</p>
            <p className="text-[11px] text-textMuted mt-0.5">Database and API services are online. No alerts at this time.</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── User Profile Dropdown ── */
const UserMenu: React.FC<{ onLogout: () => void; loggingOut: boolean }> = ({ onLogout, loggingOut }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const userEmail = localStorage.getItem('user_email') || 'priyanshu@chaintrack.io';
  const displayName = userEmail.split('@')[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-surface-2 border border-transparent hover:border-border transition-all select-none"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-[0_2px_10px_rgba(79,110,247,0.35)] ring-1 ring-white/20">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden lg:block">
          <p className="text-xs font-semibold text-textMain capitalize leading-tight">{displayName}</p>
          <p className="text-[10px] text-textMuted leading-tight">Supply Chain Lead</p>
        </div>
        <ChevronDown size={13} className="text-textMuted hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 glass-strong border border-border rounded-2xl shadow-2xl py-2 z-50 animate-slide-up text-left">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-xs font-semibold text-textMain capitalize">{displayName}</p>
            <p className="text-[11px] text-textMuted truncate">{userEmail}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-[10px] font-semibold text-accent">
              <ShieldCheck size={11} /> Enterprise Tier Active
            </div>
          </div>
          <div className="p-1">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-textSub hover:text-textMain hover:bg-surface-2 rounded-xl transition-colors">
              <Settings size={14} /> Workspace Preferences
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-textSub hover:text-textMain hover:bg-surface-2 rounded-xl transition-colors">
              <Layers size={14} /> Smart Contract Keys
            </button>
            <div className="my-1 border-t border-border" />
            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10 rounded-xl transition-colors disabled:opacity-50"
            >
              <LogOut size={14} /> Sign out of ChainTrack
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/products',  icon: Package,         label: 'Products & SKUs' },
  { to: '/shipments', icon: Truck,            label: 'Shipment Custody' },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate  = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => { logout(); navigate('/login'); }, 200);
  };

  return (
    <div className="flex h-screen bg-background text-textMain overflow-hidden font-sans antialiased">

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-surface/50 backdrop-blur-2xl relative z-30 select-none">

        {/* Top Header: Brand Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-border/80">
          <Logo />
        </div>

        {/* Workspace Selector Pill */}
        <div className="px-4 py-3 border-b border-border/60">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-2/60 border border-border/80 text-xs">
            <div className="flex items-center gap-2 truncate">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <div className="truncate">
                <p className="font-semibold text-textMain text-[11px] truncate">Supply Chain Workspace</p>
                <p className="text-[9px] text-textMuted">Enterprise Node</p>
              </div>
            </div>
            <ShieldCheck size={14} className="text-primary shrink-0" />
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-textMuted">
            Operations & Registry
          </p>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150',
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary border border-primary/30 shadow-[0_0_16px_rgba(79,110,247,0.15)]'
                    : 'text-textSub hover:text-textMain hover:bg-surface-2/70'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={cn(
                      'shrink-0 transition-colors duration-150',
                      isActive ? 'text-primary' : 'text-textMuted group-hover:text-textSub'
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={13} className="text-primary/70 shrink-0" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System Connection Status Panel */}
        <div className="px-4 py-3 mx-3 mb-3 rounded-2xl bg-surface-2/40 border border-border/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Service Status</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Online
            </span>
          </div>
          <div className="space-y-1 text-[10px] text-textSub font-mono">
            <div className="flex justify-between">
              <span className="text-textMuted">Database:</span>
              <span className="text-textMain font-semibold">PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-textMuted">API Auth:</span>
              <span className="text-accent font-semibold">Active</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 py-3 border-t border-border flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-textMuted hover:text-textMain hover:bg-surface-2 rounded-xl transition-all"
          >
            <Settings size={15} />
            Config
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-danger/80 hover:text-danger hover:bg-danger/10 rounded-xl transition-all disabled:opacity-50"
          >
            <LogOut size={15} />
            Exit
          </button>
        </div>
      </aside>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Topbar: Live Date/Time/Day Header + Global Utilities */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-border/80 bg-surface/30 backdrop-blur-xl relative z-20">
          {/* Left: Precision Live Clock (Day name, Date, Seconds digital clock) */}
          <div className="flex items-center gap-4">
            <PrecisionLiveClock />
          </div>

          {/* Center: Search */}
          <div className="hidden md:block">
            <TopSearchBar />
          </div>

          {/* Right: Actions, Notifications, and User Menu */}
          <div className="flex items-center gap-3">
            <NotificationsMenu />
            <div className="w-px h-6 bg-border" />
            <UserMenu onLogout={handleLogout} loggingOut={loggingOut} />
          </div>
        </header>

        {/* Main Work Area */}
        <main className="flex-1 overflow-auto relative">
          {/* Subtle Ambient Background Gradients */}
          <div className="pointer-events-none fixed top-0 right-0 w-[550px] h-[550px] rounded-full bg-primary/4 blur-[140px] -translate-y-1/3 translate-x-1/3" />
          <div className="pointer-events-none fixed bottom-0 left-64 w-[450px] h-[450px] rounded-full bg-secondary/3 blur-[120px] translate-y-1/2" />

          <div className="relative z-10 px-8 py-7 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
