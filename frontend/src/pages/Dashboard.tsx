import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import {
  Package, Truck, CheckCircle2, TrendingUp,
  ShieldCheck, RefreshCw, Download, Search,
  Copy, Check, Radio,
  Thermometer, MapPin
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

/* ── Sample multi-range data ── */
const rangeData: Record<string, { area: any[]; bar: any[]; stats: any }> = {
  '7D': {
    area: [
      { day: 'Mon', shipments: 14, products: 38, events: 45 },
      { day: 'Tue', shipments: 22, products: 44, events: 58 },
      { day: 'Wed', shipments: 35, products: 62, events: 82 },
      { day: 'Thu', shipments: 28, products: 51, events: 69 },
      { day: 'Fri', shipments: 52, products: 84, events: 110 },
      { day: 'Sat', shipments: 40, products: 68, events: 90 },
      { day: 'Sun', shipments: 58, products: 96, events: 125 },
    ],
    bar: [
      { stage: 'Manufacturing', count: 320, color: '#4F6EF7' },
      { stage: 'Port Customs', count: 180, color: '#7C5CFC' },
      { stage: 'In Transit', count: 420, color: '#00D4AA' },
      { stage: 'Regional Hub', count: 210, color: '#38BDF8' },
      { stage: 'Delivered', count: 118, color: '#10B981' },
    ],
    stats: {
      products: '1,248',
      productsChange: '+14.2%',
      shipments: '45',
      shipmentsChange: '+6 active',
      proofs: '3,892',
      proofsChange: '+18.4%',
      tempIntegrity: '99.94%',
      tempChange: 'Nominal (+4.1°C)',
    },
  },
  '30D': {
    area: [
      { day: 'Week 1', shipments: 110, products: 280, events: 390 },
      { day: 'Week 2', shipments: 145, products: 340, events: 480 },
      { day: 'Week 3', shipments: 190, products: 430, events: 620 },
      { day: 'Week 4', shipments: 230, products: 520, events: 780 },
    ],
    bar: [
      { stage: 'Manufacturing', count: 1240, color: '#4F6EF7' },
      { stage: 'Port Customs', count: 780, color: '#7C5CFC' },
      { stage: 'In Transit', count: 1680, color: '#00D4AA' },
      { stage: 'Regional Hub', count: 910, color: '#38BDF8' },
      { stage: 'Delivered', count: 590, color: '#10B981' },
    ],
    stats: {
      products: '5,200',
      productsChange: '+28.1%',
      shipments: '184',
      shipmentsChange: '+22 active',
      proofs: '15,420',
      proofsChange: '+31.2%',
      tempIntegrity: '99.91%',
      tempChange: 'Nominal (+4.0°C)',
    },
  },
  'ALL': {
    area: [
      { day: 'May', shipments: 450, products: 1200, events: 1800 },
      { day: 'Jun', shipments: 580, products: 1450, events: 2100 },
      { day: 'Jul', shipments: 690, products: 1720, events: 2600 },
      { day: 'Aug', shipments: 840, products: 2100, events: 3200 },
      { day: 'Sep', shipments: 980, products: 2450, events: 3892 },
    ],
    bar: [
      { stage: 'Manufacturing', count: 4800, color: '#4F6EF7' },
      { stage: 'Port Customs', count: 3100, color: '#7C5CFC' },
      { stage: 'In Transit', count: 6400, color: '#00D4AA' },
      { stage: 'Regional Hub', count: 3900, color: '#38BDF8' },
      { stage: 'Delivered', count: 2800, color: '#10B981' },
    ],
    stats: {
      products: '21,000',
      productsChange: '+45.8%',
      shipments: '720',
      shipmentsChange: '+85 total',
      proofs: '64,800',
      proofsChange: '+42.5%',
      tempIntegrity: '99.96%',
      tempChange: 'Zero breaches',
    },
  },
};

/* ── Live Audit Trail Rows ── */
interface AuditEvent {
  id: string;
  batchId: string;
  productName: string;
  action: string;
  route: string;
  txHash: string;
  blockNumber: number;
  timeAgo: string;
  status: 'VERIFIED' | 'IN_TRANSIT' | 'CLEARED' | 'PENDING';
}

const auditTrailData: AuditEvent[] = [
  {
    id: 'EVT-9041',
    batchId: 'LOT-PHARMA-9912',
    productName: 'Cold-Chain Insulin R-100',
    action: 'Custody Handover & Temp Signoff',
    route: 'Frankfurt Hub → Rotterdam Depot',
    txHash: '0x8f2d4e8b91a7c3f56e012a9bc41d',
    blockNumber: 19482109,
    timeAgo: '2m ago',
    status: 'VERIFIED',
  },
  {
    id: 'EVT-9040',
    batchId: 'LOT-SEMI-0044',
    productName: '3nm Wafer Silicon Lot #4',
    action: 'Customs Clearance Verified',
    route: 'Tokyo Haneda → LAX Air Cargo',
    txHash: '0x3a9f7e1b4c8d2059a6fe402bc91e',
    blockNumber: 19482098,
    timeAgo: '9m ago',
    status: 'CLEARED',
  },
  {
    id: 'EVT-9039',
    batchId: 'LOT-AUTO-7721',
    productName: 'EV Battery Cells 800V',
    action: 'Intermodal Rail Dispatch',
    route: 'Stuttgart Factory → Antwerp Port',
    txHash: '0xb7c14a90de3814f923b7a50891d4',
    blockNumber: 19482071,
    timeAgo: '24m ago',
    status: 'IN_TRANSIT',
  },
  {
    id: 'EVT-9038',
    batchId: 'LOT-AGRI-1082',
    productName: 'Organic Fair-Trade Coffee',
    action: 'Origin Certification Minted',
    route: 'Medellín Coop → Hamburg Terminal',
    txHash: '0x45a90e3814f92b7c14adeb7a5089',
    blockNumber: 19482045,
    timeAgo: '41m ago',
    status: 'VERIFIED',
  },
  {
    id: 'EVT-9037',
    batchId: 'LOT-AERO-3390',
    productName: 'Titanium Fastener Spec-A',
    action: 'Quality Assurance Spectrometry',
    route: 'Toulouse Plant → Seattle Assembly',
    txHash: '0x18b7a50891d445a90e3814f92b7c',
    blockNumber: 19482012,
    timeAgo: '1h ago',
    status: 'VERIFIED',
  },
];

/* ── Custom chart tooltip ── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 border border-border shadow-xl text-xs min-w-[160px]">
      <p className="text-textMuted font-bold uppercase tracking-wider text-[10px] mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-textSub capitalize font-medium">{p.name}</span>
          </div>
          <span className="font-mono font-bold text-textMain">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<'7D' | '30D' | 'ALL'>('7D');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Live greeting based on actual hour of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Late-night operations';
  }, []);

  // Today's live date and day name
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentFullDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const activeData = rangeData[selectedRange];

  // Refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Copy hash helper
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1800);
  };

  // Export CSV helper
  const handleExportCSV = () => {
    const headers = ['Event ID', 'Batch ID', 'Product', 'Action', 'Route', 'Tx Hash', 'Block', 'Status'];
    const rows = auditTrailData.map((e) => [
      e.id,
      e.batchId,
      `"${e.productName}"`,
      `"${e.action}"`,
      `"${e.route}"`,
      e.txHash,
      e.blockNumber,
      e.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chaintrack_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered audit events
  const filteredEvents = useMemo(() => {
    if (!searchFilter.trim()) return auditTrailData;
    const q = searchFilter.toLowerCase();
    return auditTrailData.filter(
      (e) =>
        e.productName.toLowerCase().includes(q) ||
        e.batchId.toLowerCase().includes(q) ||
        e.route.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.txHash.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  return (
    <DashboardLayout>
      {/* ═══════════════ EXECUTIVE HEADER ═══════════════ */}
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
            Real-time cryptographic asset custody tracking across Polygon Mainnet.
          </p>
        </div>

        {/* Global Controls: Range Selector + Refresh + Export */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Range tabs */}
          <div className="flex items-center bg-surface-2/80 p-1 rounded-xl border border-border/80">
            {(['7D', '30D', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedRange === r
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-textMuted hover:text-textMain'
                }`}
              >
                {r === 'ALL' ? 'All Time' : r}
              </button>
            ))}
          </div>

          {/* Sync button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs font-semibold text-textSub hover:text-textMain hover:border-primary/40 transition-all disabled:opacity-50"
            title="Force refresh telemetry"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-primary' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold shadow-[0_2px_12px_rgba(79,110,247,0.3)] hover:shadow-[0_4px_18px_rgba(79,110,247,0.5)] transition-all"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ═══════════════ 4 ENTERPRISE KPI CARDS ═══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {/* Card 1: Tracked Products */}
        <Card className="relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Package size={20} />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
              <TrendingUp size={12} /> {activeData.stats.productsChange}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">Registered SKUs</p>
            <p className="text-2xl font-extrabold text-textMain mt-0.5 font-mono">{activeData.stats.products}</p>
            <p className="text-[11px] text-textSub mt-1">99.2% scanned within 24h</p>
          </div>
          <div className="mt-3 w-full bg-surface-2 h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[82%]" />
          </div>
        </Card>

        {/* Card 2: Active Shipments */}
        <Card className="relative overflow-hidden group hover:border-secondary/40 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
              <Truck size={20} />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
              <Radio size={12} className="animate-pulse" /> {activeData.stats.shipmentsChange}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">Custody In-Transit</p>
            <p className="text-2xl font-extrabold text-textMain mt-0.5 font-mono">{activeData.stats.shipments}</p>
            <p className="text-[11px] text-textSub mt-1">3 arriving at port today</p>
          </div>
          <div className="mt-3 w-full bg-surface-2 h-1 rounded-full overflow-hidden">
            <div className="bg-secondary h-full w-[65%]" />
          </div>
        </Card>

        {/* Card 3: Polygon Cryptographic Proofs */}
        <Card className="relative overflow-hidden group hover:border-accent/40 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
              <ShieldCheck size={20} />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
              100% Verified
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">On-Chain Proofs</p>
            <p className="text-2xl font-extrabold text-textMain mt-0.5 font-mono">{activeData.stats.proofs}</p>
            <p className="text-[11px] text-textSub mt-1">Zero cryptographic discrepancies</p>
          </div>
          <div className="mt-3 w-full bg-surface-2 h-1 rounded-full overflow-hidden">
            <div className="bg-accent h-full w-[100%]" />
          </div>
        </Card>

        {/* Card 4: Cold-Chain & SLA Integrity */}
        <Card className="relative overflow-hidden group hover:border-warning/40 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Thermometer size={20} />
            </div>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              ISO 22000
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">Cold-Chain SLA</p>
            <p className="text-2xl font-extrabold text-textMain mt-0.5 font-mono">{activeData.stats.tempIntegrity}</p>
            <p className="text-[11px] text-textSub mt-1">{activeData.stats.tempChange}</p>
          </div>
          <div className="mt-3 w-full bg-surface-2 h-1 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full w-[99%]" />
          </div>
        </Card>
      </div>

      {/* ═══════════════ CHARTS SECTION ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        {/* Area Chart: Custody Velocity & Ledger Events (2 cols) */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-textMain tracking-tight">Custody Transfer Velocity</h2>
              <p className="text-xs text-textMuted mt-0.5">Shipments moved vs on-chain verification events</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-textSub">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Shipments
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-textSub">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" /> Ledger Proofs
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData.area} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaShipments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F6EF7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F6EF7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="areaEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                <XAxis dataKey="day" stroke="#5C738A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5C738A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="shipments" stroke="#4F6EF7" strokeWidth={2.5} fill="url(#areaShipments)" dot={false} />
                <Area type="monotone" dataKey="events" stroke="#00D4AA" strokeWidth={2} fill="url(#areaEvents)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart: Custody by Stage (1 col) */}
        <Card>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-textMain tracking-tight">Active Custody Stages</h2>
            <p className="text-xs text-textMuted mt-0.5">Asset distribution by supply chain phase</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData.bar} layout="vertical" margin={{ top: 4, right: 12, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" horizontal={false} />
                <XAxis type="number" stroke="#5C738A" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="stage" stroke="#A8B8D8" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                  {activeData.bar.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ═══════════════ REAL-TIME BLOCKCHAIN AUDIT TRAIL ═══════════════ */}
      <Card className="p-0 overflow-hidden">
        {/* Table header bar */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-2/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-textMain tracking-tight">Real-Time Cryptographic Ledger</h2>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                Polygon Mainnet
              </span>
            </div>
            <p className="text-xs text-textMuted mt-0.5">
              Live audit stream of all batch custody events signed by verified smart contracts.
            </p>
          </div>

          {/* Table search filter */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Filter batch, route, tx..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-textMain placeholder-textMuted focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-2/20 text-textMuted uppercase tracking-wider font-semibold text-[10px]">
                <th className="px-5 py-3.5">Asset / Batch ID</th>
                <th className="px-5 py-3.5">Custody Event</th>
                <th className="px-5 py-3.5">Logistics Route</th>
                <th className="px-5 py-3.5">Polygon Tx Hash</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-surface-2/40 transition-colors group">
                  {/* Batch & Product */}
                  <td className="px-5 py-3.5">
                    <p className="font-mono font-semibold text-textMain text-xs group-hover:text-primary transition-colors">
                      {evt.batchId}
                    </p>
                    <p className="text-[11px] text-textMuted mt-0.5">{evt.productName}</p>
                  </td>

                  {/* Custody Action */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-textSub font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {evt.action}
                    </div>
                  </td>

                  {/* Route */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-textSub">
                      <MapPin size={12} className="text-textMuted shrink-0" />
                      <span className="truncate max-w-[200px]">{evt.route}</span>
                    </div>
                  </td>

                  {/* Tx Hash */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 text-[11px]">
                        {evt.txHash.slice(0, 8)}...{evt.txHash.slice(-4)}
                      </span>
                      <button
                        onClick={() => handleCopyHash(evt.txHash)}
                        className="text-textMuted hover:text-textMain p-1 rounded transition-colors"
                        title="Copy Tx Hash"
                      >
                        {copiedHash === evt.txHash ? (
                          <Check size={12} className="text-accent" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-5 py-3.5">
                    {evt.status === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/10 text-accent border border-accent/25">
                        <CheckCircle2 size={11} /> VERIFIED
                      </span>
                    )}
                    {evt.status === 'CLEARED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/25">
                        <ShieldCheck size={11} /> CLEARED
                      </span>
                    )}
                    {evt.status === 'IN_TRANSIT' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                        <Truck size={11} /> IN TRANSIT
                      </span>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="px-5 py-3.5 text-right font-mono text-[11px] text-textMuted whitespace-nowrap">
                    {evt.timeAgo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-textMuted bg-surface-2/20">
          <span>Showing {filteredEvents.length} cryptographic audit events</span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            Smart Contract: <span className="text-textSub font-semibold">ChainTrackRegistry.sol @ v2.4</span>
          </span>
        </div>
      </Card>
    </DashboardLayout>
  );
};
