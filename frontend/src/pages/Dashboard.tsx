import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Package, Truck, CheckCircle2,
  RefreshCw, Download, Search,
  Plus, Layers, AlertCircle, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  PieChart, Pie
} from 'recharts';
import { fetchProducts } from '../services/products';
import { fetchShipments } from '../services/shipments';

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#10B981',
  IN_TRANSIT: '#4F6EF7',
  PENDING: '#F59E0B',
};

const statusVariant = (status: string) => {
  switch (status) {
    case 'DELIVERED': return 'success';
    case 'IN_TRANSIT': return 'info';
    case 'PENDING':    return 'warning';
    default:           return 'default';
  }
};

/* ── Custom chart tooltip ── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 border border-border shadow-xl text-xs min-w-[150px]">
      <p className="text-textMuted font-bold uppercase tracking-wider text-[10px] mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-textSub capitalize font-medium">{p.name || 'Value'}:</span>
          <span className="font-mono font-bold text-textMain">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch real database records
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
    isFetching: productsFetching
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const {
    data: shipments = [],
    isLoading: shipmentsLoading,
    error: shipmentsError,
    refetch: refetchShipments,
    isFetching: shipmentsFetching
  } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments,
  });

  const isSyncing = productsFetching || shipmentsFetching;

  // Real-time calculated KPIs from actual database data
  const totalProducts = products.length;
  const totalUnits = useMemo(() => {
    return products.reduce((acc: number, p: any) => acc + (Number(p.quantity) || 0), 0);
  }, [products]);

  const activeShipments = useMemo(() => {
    return shipments.filter((s: any) => s.status === 'IN_TRANSIT' || s.status === 'PENDING').length;
  }, [shipments]);

  const deliveredShipments = useMemo(() => {
    return shipments.filter((s: any) => s.status === 'DELIVERED').length;
  }, [shipments]);

  // Product inventory chart data (real products from DB)
  const productChartData = useMemo(() => {
    return products.slice(0, 7).map((p: any) => ({
      name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
      fullName: p.name,
      quantity: Number(p.quantity) || 0,
    }));
  }, [products]);

  // Shipment status distribution chart data (real shipments from DB)
  const shipmentStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      DELIVERED: 0,
      IN_TRANSIT: 0,
      PENDING: 0,
    };
    shipments.forEach((s: any) => {
      const status = s.status || 'PENDING';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: status.replace('_', ' '),
      value,
      color: STATUS_COLORS[status] || '#A8B8D8',
    }));
  }, [shipments]);

  // Real filtered shipments table
  const filteredShipments = useMemo(() => {
    if (!searchFilter.trim()) return shipments;
    const q = searchFilter.toLowerCase();
    return shipments.filter((s: any) =>
      (s.id && s.id.toLowerCase().includes(q)) ||
      (s.product_id && s.product_id.toLowerCase().includes(q)) ||
      (s.status && s.status.toLowerCase().includes(q)) ||
      (s.to_company_id && s.to_company_id.toLowerCase().includes(q))
    );
  }, [shipments, searchFilter]);

  // Live greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Late-night operations';
  }, []);

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentFullDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  // Handle manual data refresh
  const handleRefresh = () => {
    refetchProducts();
    refetchShipments();
  };

  // Export actual database data to CSV
  const handleExportCSV = () => {
    if (!shipments.length && !products.length) {
      alert('No data available in database to export.');
      return;
    }

    const headers = ['Type', 'ID', 'Name / Product ID', 'Quantity', 'Status', 'Target / Description'];
    const productRows = products.map((p: any) => [
      'PRODUCT',
      p.id || '',
      `"${p.name || ''}"`,
      p.quantity || 0,
      p.status || 'ACTIVE',
      `"${p.description || ''}"`,
    ]);
    const shipmentRows = shipments.map((s: any) => [
      'SHIPMENT',
      s.id || '',
      s.product_id || '',
      s.quantity || 1,
      s.status || 'PENDING',
      s.to_company_id || '',
    ]);

    const allRows = [...productRows, ...shipmentRows];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...allRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chaintrack_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      {/* ═══════════════ OPERATIONAL HEADER ═══════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-textMuted text-xs font-semibold uppercase tracking-wider">
              {greeting} • {currentDayName}, {currentFullDate}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-textMain tracking-tight">
            Supply Chain Command Center
          </h1>
          <p className="text-xs text-textSub mt-0.5">
            Real-time telemetry and inventory tracking connected to your database.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs font-semibold text-textSub hover:text-textMain hover:border-primary/40 transition-all disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin text-primary' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs font-semibold text-textSub hover:text-textMain hover:border-primary/40 transition-all"
            title="Export live database records to CSV"
          >
            <Download size={13} className="text-primary" />
            <span>Export Data</span>
          </button>

          {/* Quick Action: New Shipment */}
          <Button size="sm" onClick={() => navigate('/shipments')}>
            <Plus size={14} />
            New Shipment
          </Button>
        </div>
      </div>

      {/* Error state if backend unreachable */}
      {(productsError || shipmentsError) && (
        <div className="mb-6 p-4 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-between text-danger text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>Unable to retrieve live database records. Please ensure your backend service is running and authenticated.</span>
          </div>
          <button onClick={handleRefresh} className="underline font-semibold hover:opacity-80">
            Retry
          </button>
        </div>
      )}

      {/* ═══════════════ REAL METRIC CARDS ═══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {/* Card 1: Registered Products */}
        <Card className="relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Package size={20} />
            </div>
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider bg-surface px-2 py-0.5 rounded border border-border">
              Catalog
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">Registered SKUs</p>
            <p className="text-2xl font-extrabold text-textMain mt-0.5 font-mono">
              {productsLoading ? '...' : totalProducts.toLocaleString()}
            </p>
            <p className="text-[11px] text-textSub mt-1">Unique catalog product items</p>
          </div>
        </Card>

        {/* Card 2: Total Units In Stock */}
        <Card className="relative overflow-hidden group hover:border-secondary/40 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
              <Layers size={20} />
            </div>
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider bg-surface px-2 py-0.5 rounded border border-border">
              Inventory
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">Total Stock Units</p>
            <p className="text-2xl font-extrabold text-textMain mt-0.5 font-mono">
              {productsLoading ? '...' : totalUnits.toLocaleString()}
            </p>
            <p className="text-[11px] text-textSub mt-1">Aggregated across all registered SKUs</p>
          </div>
        </Card>

        {/* Card 3: Active Shipments */}
        <Card className="relative overflow-hidden group hover:border-accent/40 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
              <Truck size={20} />
            </div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              In Motion
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">Active Shipments</p>
            <p className="text-2xl font-extrabold text-textMain mt-0.5 font-mono">
              {shipmentsLoading ? '...' : activeShipments.toLocaleString()}
            </p>
            <p className="text-[11px] text-textSub mt-1">In-transit or pending transfers</p>
          </div>
        </Card>

        {/* Card 4: Delivered Shipments */}
        <Card className="relative overflow-hidden group hover:border-success/40 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-success/10 text-success border border-success/20">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] font-bold text-success uppercase tracking-wider bg-success/10 px-2 py-0.5 rounded border border-success/20">
              Completed
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">Delivered</p>
            <p className="text-2xl font-extrabold text-textMain mt-0.5 font-mono">
              {shipmentsLoading ? '...' : deliveredShipments.toLocaleString()}
            </p>
            <p className="text-[11px] text-textSub mt-1">Successfully fulfilled consignments</p>
          </div>
        </Card>
      </div>

      {/* ═══════════════ REAL CHARTS SECTION ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        {/* Product Inventory Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-textMain tracking-tight">Inventory Distribution by Product</h2>
              <p className="text-xs text-textMuted mt-0.5">Real unit volume registered per catalog item</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              Manage Products <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="h-64 flex items-center justify-center">
            {productsLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-xs text-textMuted font-mono">Loading inventory metrics...</p>
              </div>
            ) : productChartData.length === 0 ? (
              <div className="text-center py-8">
                <Package size={36} className="text-textMuted/40 mx-auto mb-2" />
                <p className="text-xs font-semibold text-textMain">No product inventory registered</p>
                <p className="text-[11px] text-textMuted mt-1">Import a CSV or add products manually to visualize your catalog.</p>
                <Button size="sm" className="mt-3" onClick={() => navigate('/products')}>
                  <Plus size={13} /> Register Product
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productChartData} margin={{ top: 8, right: 12, left: -16, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                  <XAxis dataKey="name" stroke="#5C738A" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#5C738A" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantity" fill="#4F6EF7" radius={[4, 4, 0, 0]} barSize={28}>
                    {productChartData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F6EF7' : '#7C5CFC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Shipment Status Distribution (1 col) */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-textMain tracking-tight">Shipment Status</h2>
              <p className="text-xs text-textMuted mt-0.5">Live status breakdown of all transfers</p>
            </div>
            <button
              onClick={() => navigate('/shipments')}
              className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View All <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="h-64 flex flex-col justify-center">
            {shipmentsLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-xs text-textMuted font-mono">Loading shipments...</p>
              </div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-8">
                <Truck size={36} className="text-textMuted/40 mx-auto mb-2" />
                <p className="text-xs font-semibold text-textMain">No shipments recorded</p>
                <p className="text-[11px] text-textMuted mt-1">Create your first shipment transfer to start tracking status.</p>
                <Button size="sm" className="mt-3" onClick={() => navigate('/shipments')}>
                  <Plus size={13} /> New Shipment
                </Button>
              </div>
            ) : (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={shipmentStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {shipmentStatusData.map((entry, index) => (
                          <Cell key={`slice-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-2">
                  {shipmentStatusData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs text-textMuted">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-[11px]">{entry.name}: <strong className="text-textMain">{entry.value}</strong></span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* ═══════════════ REAL RECENT SHIPMENTS TABLE ═══════════════ */}
      <Card className="p-0 overflow-hidden">
        {/* Table header bar */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-2/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-textMain tracking-tight">Recent Shipment Movements</h2>
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                Database Records
              </span>
            </div>
            <p className="text-xs text-textMuted mt-0.5">
              Live records of dispatched transfers from your organization.
            </p>
          </div>

          {/* Table search filter */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search shipment ID, status..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-textMain placeholder-textMuted focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {shipmentsLoading ? (
            <div className="py-14 text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-textMuted font-mono">Retrieving shipments from database...</p>
            </div>
          ) : shipments.length === 0 ? (
            <div className="py-16 text-center text-textMuted">
              <Truck size={36} className="text-textMuted/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-textMain">No shipments in database yet</p>
              <p className="text-xs text-textMuted mt-0.5">When you dispatch shipments, they will appear in this live table.</p>
              <Button size="sm" className="mt-3" onClick={() => navigate('/shipments')}>
                <Plus size={13} /> Create First Shipment
              </Button>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="py-12 text-center text-textMuted text-xs">
              No shipments matching "{searchFilter}"
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-2/20 text-textMuted uppercase tracking-wider font-semibold text-[10px]">
                  <th className="px-5 py-3.5">Shipment ID</th>
                  <th className="px-5 py-3.5">Product ID</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Destination Company</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredShipments.slice(0, 8).map((s: any) => (
                  <tr key={s.id} className="hover:bg-surface-2/40 transition-colors group">
                    <td className="px-5 py-3.5 font-mono font-semibold text-textMain">
                      #{s.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-textMuted">
                      {s.product_id ? `${s.product_id.slice(0, 8)}…` : '—'}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-textMain">
                      {s.quantity || 1}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-textMuted">
                      {s.to_company_id ? `${s.to_company_id.slice(0, 8)}…` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusVariant(s.status)} dot>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/shipments')}
                        className="text-xs py-1 px-2.5 h-auto"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table footer */}
        {shipments.length > 0 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-textMuted bg-surface-2/20">
            <span>Showing {Math.min(filteredShipments.length, 8)} of {shipments.length} total shipments</span>
            <button
              onClick={() => navigate('/shipments')}
              className="text-primary hover:underline font-semibold"
            >
              View All in Shipments →
            </button>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};
