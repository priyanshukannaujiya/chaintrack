import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout } from '../services/auth';
import { LayoutDashboard, Box, Truck, LogOut } from 'lucide-react';
import { cn } from '../components/ui/Button';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-t-0 border-l-0 border-b-0 flex flex-col z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            ChainTrack
          </h1>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
          {[
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/products', icon: Box, label: 'Products' },
            { to: '/shipments', icon: Truck, label: 'Shipments' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-textMuted hover:bg-surface hover:text-textMain"
              )}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg font-medium text-textMuted hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Background decorations */}
        <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        
        <div className="p-8 max-w-7xl mx-auto z-10 relative animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
