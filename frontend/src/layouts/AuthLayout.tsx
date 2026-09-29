import React from 'react';
import { Zap } from 'lucide-react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex overflow-hidden bg-background relative">
      {/* ── Left panel (branding) — hidden on mobile ── */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden bg-surface/30 border-r border-border">
        {/* Gradient blobs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[80px] pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_4px_20px_rgba(79,110,247,0.5)]">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-textMain">Chain</span>
            <span className="text-xl font-bold gradient-text">Track</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-textMain leading-tight tracking-tight">
            Supply chain
            <br />
            <span className="gradient-text">reimagined</span>
          </h2>
          <p className="text-textSub text-base leading-relaxed max-w-xs">
            Real-time visibility across your entire supply chain. Track every product, every shipment, every event — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3 pt-2">
            {[
              { label: 'End-to-end shipment tracking' },
              { label: 'Blockchain-verified events' },
              { label: 'Multi-company collaboration' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 text-sm text-textSub">
                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs text-textMuted border border-border">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            All systems operational
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[120px] pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};
