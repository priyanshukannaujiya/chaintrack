import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Box, Truck, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 30 },
  { name: 'Wed', value: 55 },
  { name: 'Thu', value: 45 },
  { name: 'Fri', value: 70 },
  { name: 'Sat', value: 65 },
  { name: 'Sun', value: 90 },
];

export const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textMain">Dashboard</h1>
          <p className="text-textMuted mt-1">Welcome to ChainTrack</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Products', value: '1,248', icon: Box, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Shipments', value: '45', icon: Truck, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Confirmed Events', value: '3,892', icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((stat, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-sm text-textMuted font-medium">{stat.label}</div>
              <div className="text-2xl font-bold text-textMain">{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-xl font-bold text-textMain mb-4">Weekly Shipment Volume</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#F8FAFC' }}
              />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </DashboardLayout>
  );
};
