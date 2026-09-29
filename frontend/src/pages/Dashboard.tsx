import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Package, Truck, CheckCircle2, TrendingUp, ArrowUpRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

const areaData = [
  { day: 'Mon', shipments: 12, products: 34 },
  { day: 'Tue', shipments: 19, products: 28 },
  { day: 'Wed', shipments: 31, products: 55 },
  { day: 'Thu', shipments: 24, products: 41 },
  { day: 'Fri', shipments: 47, products: 70 },
  { day: 'Sat', shipments: 38, products: 60 },
  { day: 'Sun', shipments: 52, products: 82 },
];

const barData = [
  { month: 'Apr', value: 65 },
  { month: 'May', value: 80 },
  { month: 'Jun', value: 72 },
  { month: 'Jul', value: 90 },
  { month: 'Aug', value: 85 },
  { month: 'Sep', value: 95 },
];

const stats = [
  {
    label: 'Total Products',
    value: '1,248',
    change: '+12.4%',
    up: true,
    icon: Package,
    color: 'text-primary',
    bg: 'bg-primary/10',
    glow: 'shadow-[0_0_20px_rgba(79,110,247,0.15)]',
  },
  {
    label: 'Active Shipments',
    value: '45',
    change: '+3 today',
    up: true,
    icon: Truck,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    glow: 'shadow-[0_0_20px_rgba(124,92,252,0.15)]',
  },
  {
    label: 'Confirmed Events',
    value: '3,892',
    change: '+8.1%',
    up: true,
    icon: CheckCircle2,
    color: 'text-accent',
    bg: 'bg-accent/10',
    glow: 'shadow-[0_0_20px_rgba(0,212,170,0.15)]',
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 border border-border text-xs min-w-[130px]">
      <p className="text-textMuted font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span className="text-textSub capitalize">{p.name}</span>
          <span className="font-semibold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-textMuted text-sm mb-0.5">Good evening 👋</p>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Overview</h1>
        </div>
        <Badge variant="success" dot>All systems operational</Badge>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className={`flex items-center gap-4 ${s.glow}`}>
            <div className={`p-3 rounded-xl ${s.bg} ${s.color} shrink-0`}>
              <s.icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-textMuted font-medium mb-0.5">{s.label}</p>
              <p className="text-2xl font-bold text-textMain leading-none">{s.value}</p>
            </div>
            <div className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ${s.up ? 'text-accent' : 'text-danger'}`}>
              <TrendingUp size={13} />
              {s.change}
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart — 2/3 */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-textMain">Weekly Activity</h2>
              <p className="text-xs text-textMuted mt-0.5">Shipments vs products moved</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              View report <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gShipments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4F6EF7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F6EF7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProducts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D4AA" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                <XAxis dataKey="day" stroke="#5C738A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5C738A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="shipments" stroke="#4F6EF7" strokeWidth={2} fill="url(#gShipments)" dot={false} />
                <Area type="monotone" dataKey="products"  stroke="#00D4AA" strokeWidth={2} fill="url(#gProducts)"  dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-5 mt-3">
            {[{ color: '#4F6EF7', label: 'Shipments' }, { color: '#00D4AA', label: 'Products' }].map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-xs text-textMuted">
                <div className="w-5 h-0.5 rounded" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </Card>

        {/* Bar chart — 1/3 */}
        <Card>
          <div className="mb-5">
            <h2 className="text-base font-semibold text-textMain">Monthly Volume</h2>
            <p className="text-xs text-textMuted mt-0.5">Last 6 months</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                <XAxis dataKey="month" stroke="#5C738A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5C738A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#4F6EF7" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
