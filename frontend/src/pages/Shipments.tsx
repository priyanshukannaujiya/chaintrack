import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Truck, Plus, Activity, MapPin, Calendar, Hash } from 'lucide-react';
import { fetchShipments, fetchTracking, createShipment } from '../services/shipments';
import { fetchProducts } from '../services/products';

const statusVariant = (status: string) => {
  switch (status) {
    case 'DELIVERED': return 'success';
    case 'IN_TRANSIT': return 'info';
    case 'PENDING':    return 'warning';
    default:           return 'default';
  }
};

export const Shipments: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: shipments, isLoading, error } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments,
  });
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ product_id: '', to_company_id: '', quantity: 1 });
  const [createError, setCreateError] = useState('');

  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['tracking', selectedShipment],
    queryFn: () => fetchTracking(selectedShipment!),
    enabled: !!selectedShipment,
  });

  const createMutation = useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      setIsCreateOpen(false);
      setFormData({ product_id: '', to_company_id: '', quantity: 1 });
      setCreateError('');
    },
    onError: (err: any) => setCreateError(err.response?.data?.detail || 'Failed to create shipment'),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.to_company_id) {
      setCreateError('Please fill in all required fields');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Shipments</h1>
          <p className="text-textMuted text-sm mt-1">Track and manage product movements</p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus size={15} />
          New Shipment
        </Button>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-14 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-textMuted">Loading shipments…</p>
          </div>
        ) : error ? (
          <div className="py-14 text-center">
            <p className="text-sm text-danger">Failed to load shipments.</p>
          </div>
        ) : !shipments?.length ? (
          <div className="py-16 flex flex-col items-center gap-3 text-textMuted">
            <Truck size={40} className="opacity-30" />
            <p className="text-sm">No shipments yet</p>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} /> Create first shipment
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  {['Shipment ID', 'Product', 'Destination', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-textMuted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map((s: any) => (
                  <tr key={s.id} className="tr-hover border-b border-border last:border-0">
                    <td className="px-5 py-3.5">
                      <code className="text-xs text-textSub font-mono bg-surface-2 px-2 py-0.5 rounded-md">
                        #{s.id.slice(0, 8)}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-textMuted font-mono">{s.product_id.slice(0, 8)}…</td>
                    <td className="px-5 py-3.5 text-xs text-textMuted font-mono">{s.to_company_id.slice(0, 8)}…</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusVariant(s.status)} dot>{s.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedShipment(s.id)}
                        className="text-xs gap-1.5"
                      >
                        <Activity size={13} />
                        Track
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Tracking Modal */}
      <Modal
        isOpen={!!selectedShipment}
        onClose={() => setSelectedShipment(null)}
        title="Live Tracking"
        subtitle="Real-time shipment information"
      >
        {trackingLoading ? (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-textMuted">Contacting carrier API…</p>
          </div>
        ) : trackingData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
              <div>
                <p className="text-xs text-textMuted mb-1">Tracking Number</p>
                <p className="font-bold text-primary font-mono">{trackingData.tracking_number}</p>
              </div>
              <Badge variant="info">{trackingData.carrier}</Badge>
            </div>

            <div className="p-4 bg-surface-2 rounded-xl border border-border flex items-center gap-3">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
              </div>
              <div>
                <p className="text-xs text-textMuted">Current Status</p>
                <p className="text-sm font-semibold text-textMain mt-0.5">{trackingData.current_status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-2 rounded-xl border border-border">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Calendar size={12} className="text-textMuted" />
                  <p className="text-xs text-textMuted">Last Updated</p>
                </div>
                <p className="text-sm font-medium text-textMain">{new Date(trackingData.last_updated).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-surface-2 rounded-xl border border-border">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MapPin size={12} className="text-textMuted" />
                  <p className="text-xs text-textMuted">Est. Delivery</p>
                </div>
                <p className="text-sm font-semibold text-accent">{new Date(trackingData.estimated_delivery).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-danger">Failed to fetch tracking data.</p>
          </div>
        )}
      </Modal>

      {/* Create Shipment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Shipment"
        subtitle="Initiate a product transfer"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          {createError && (
            <div className="text-xs text-danger bg-danger/8 border border-danger/20 rounded-xl px-3 py-2">
              {createError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-textMuted">Select Product</label>
            <select
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-textMain outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/60 transition-all hover:border-border-light"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
            >
              <option value="">— Choose a product —</option>
              {products?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} (Qty: {p.quantity})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-textMuted">Destination Company ID</label>
            <div className="relative">
              <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                type="text"
                placeholder="550e8400-e29b-41d4-…"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 pl-9 text-sm text-textMain outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/60 transition-all hover:border-border-light placeholder:text-textMuted"
                value={formData.to_company_id}
                onChange={(e) => setFormData({ ...formData, to_company_id: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-textMuted">Quantity</label>
            <input
              type="number"
              min="1"
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-textMain outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/60 transition-all hover:border-border-light"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          <Button type="submit" className="w-full mt-1" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Initiating…
              </>
            ) : (
              'Initiate Shipment'
            )}
          </Button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
