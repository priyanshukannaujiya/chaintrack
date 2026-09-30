import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Truck, Plus, Activity, MapPin, Calendar } from 'lucide-react';
import { fetchShipments, fetchTracking, createShipment, fetchCompanies, transferShipment, receiveShipment } from '../services/shipments';
import api from '../services/api';

const fetchCurrentUser = async () => {
  const { data } = await api.get('/users/me');
  return data;
};
import { fetchProducts } from '../services/products';

const statusVariant = (status: string) => {
  switch (status) {
    case 'DELIVERED': return 'success';
    case 'IN_TRANSIT': return 'info';
    case 'SHIPPED':    return 'info';
    case 'RECEIVED':   return 'success';
    case 'PENDING':    return 'warning';
    case 'CANCELLED':  return 'default';
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
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  });
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  });
  const myCompanyId = currentUser?.company_id;

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

  const transferMutation = useMutation({
    mutationFn: (id: string) => transferShipment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shipments'] }),
  });

  const receiveMutation = useMutation({
    mutationFn: (id: string) => receiveShipment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shipments'] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.to_company_id) {
      setCreateError('Please select both a product and a destination company.');
      return;
    }
    createMutation.mutate(formData);
  };

  const getProductName = (productId: string) => {
    const prod = products?.find((p: any) => p.id === productId);
    return prod ? prod.name : `${productId.slice(0, 8)}…`;
  };

  const getCompanyName = (companyId: string) => {
    const comp = companies?.find((c: any) => c.id === companyId);
    return comp ? comp.name : `${companyId.slice(0, 8)}…`;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Shipment Custody</h1>
          <p className="text-textMuted text-xs mt-1">Track and manage product movements across verified nodes</p>
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
            <p className="text-xs text-textMuted font-mono">Loading shipments…</p>
          </div>
        ) : error ? (
          <div className="py-14 text-center">
            <p className="text-sm text-danger">Failed to load shipments.</p>
          </div>
        ) : !shipments?.length ? (
          <div className="py-16 flex flex-col items-center gap-3 text-textMuted text-center">
            <Truck size={40} className="opacity-30" />
            <p className="text-sm font-semibold text-textMain">No shipments recorded yet</p>
            <p className="text-xs text-textMuted">Dispatch your first product shipment to start tracking.</p>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} /> Create First Shipment
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-2/20 text-textMuted uppercase tracking-wider font-semibold text-[10px]">
                  <th className="px-5 py-3.5">Shipment ID</th>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">From → To</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {shipments.map((s: any) => {
                  const isSender   = s.from_company_id === myCompanyId;
                  const isReceiver = s.to_company_id   === myCompanyId;
                  const canShip    = isSender   && s.status === 'PENDING';
                  const canReceive = isReceiver && s.status === 'SHIPPED';

                  return (
                  <tr key={s.id} className="hover:bg-surface-2/40 transition-colors group">
                    <td className="px-5 py-3.5">
                      <code className="text-xs text-textSub font-mono bg-surface-2 px-2 py-0.5 rounded-md border border-border/60">
                        #{s.id.slice(0, 8)}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-textMain">
                      {getProductName(s.product_id)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-textMain font-semibold">
                      {s.quantity ? `${s.quantity} units` : '1 unit'}
                    </td>
                    <td className="px-5 py-3.5 text-textSub">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-textMuted text-[10px] font-mono">{getCompanyName(s.from_company_id)}</span>
                        <span className="text-primary">→</span>
                        <span className="font-semibold text-textMain">{getCompanyName(s.to_company_id)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusVariant(s.status)} dot>{s.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canShip && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => transferMutation.mutate(s.id)}
                            disabled={transferMutation.isPending}
                            className="text-xs gap-1.5 py-1 px-2.5 h-auto border-primary/40 text-primary hover:bg-primary/10"
                          >
                            <Truck size={12} />
                            {transferMutation.isPending ? '…' : 'Ship'}
                          </Button>
                        )}
                        {canReceive && (
                          <Button
                            size="sm"
                            onClick={() => receiveMutation.mutate(s.id)}
                            disabled={receiveMutation.isPending}
                            className="text-xs gap-1.5 py-1 px-2.5 h-auto bg-accent/20 text-accent hover:bg-accent/30 border-accent/40"
                          >
                            <MapPin size={12} />
                            {receiveMutation.isPending ? '…' : 'Receive'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedShipment(s.id)}
                          className="text-xs gap-1.5 py-1 px-2.5 h-auto"
                        >
                          <Activity size={13} />
                          Track
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Tracking Modal */}
      <Modal
        isOpen={!!selectedShipment}
        onClose={() => setSelectedShipment(null)}
        title="Live Carrier Tracking"
        subtitle="Real-time shipment logistics and status"
      >
        {trackingLoading ? (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-textMuted font-mono">Contacting logistics carrier API…</p>
          </div>
        ) : trackingData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
              <div>
                <p className="text-xs text-textMuted mb-1 font-semibold uppercase tracking-wider text-[10px]">Tracking Number</p>
                <p className="font-bold text-primary font-mono text-sm">{trackingData.tracking_number}</p>
              </div>
              <Badge variant="info">{trackingData.carrier}</Badge>
            </div>

            <div className="p-4 bg-surface-2 rounded-xl border border-border flex items-center gap-3">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Current Custody Status</p>
                <p className="text-sm font-semibold text-textMain mt-0.5">{trackingData.current_status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-2 rounded-xl border border-border">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Calendar size={12} className="text-textMuted" />
                  <p className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Last Ping</p>
                </div>
                <p className="text-xs font-medium text-textMain font-mono">{new Date(trackingData.last_updated).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-surface-2 rounded-xl border border-border">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MapPin size={12} className="text-textMuted" />
                  <p className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Est. Delivery</p>
                </div>
                <p className="text-xs font-semibold text-accent font-mono">{new Date(trackingData.estimated_delivery).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-danger">Failed to fetch carrier tracking data.</p>
          </div>
        )}
      </Modal>

      {/* Create Shipment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Initiate Shipment"
        subtitle="Transfer product custody to a destination partner"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          {createError && (
            <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-xl px-3.5 py-2.5">
              {createError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-textMuted">Select Product</label>
            <select
              className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-xs text-textMain outline-none focus:border-primary/60 transition-all hover:border-border-light"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              required
            >
              <option value="">— Choose a product from inventory —</option>
              {products?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-textMuted">Destination Company / Partner</label>
            {companies && companies.length > 0 ? (
              <select
                className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-xs text-textMain outline-none focus:border-primary/60 transition-all hover:border-border-light"
                value={formData.to_company_id}
                onChange={(e) => setFormData({ ...formData, to_company_id: e.target.value })}
                required
              >
                <option value="">— Choose destination partner —</option>
                {companies.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter destination company UUID..."
                className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-xs text-textMain outline-none focus:border-primary/60 transition-all placeholder:text-textMuted font-mono"
                value={formData.to_company_id}
                onChange={(e) => setFormData({ ...formData, to_company_id: e.target.value })}
                required
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-textMuted">Quantity to Dispatch</label>
            <input
              type="number"
              min="1"
              className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-xs text-textMain outline-none focus:border-primary/60 transition-all font-mono"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Initiating…' : 'Dispatch Shipment'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
