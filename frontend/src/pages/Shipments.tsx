import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Truck, Plus, Activity } from 'lucide-react';
import { fetchShipments, fetchTracking, createShipment } from '../services/shipments';
import { fetchProducts } from '../services/products';

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
      setIsCreateModalOpen(false);
      setFormData({ product_id: '', to_company_id: '', quantity: 1 });
      setCreateError('');
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.detail || 'Failed to create shipment');
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.to_company_id) {
      setCreateError('Please fill in all fields');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textMain">Shipments</h1>
          <p className="text-textMuted mt-1">Track product movements</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} /> New Shipment
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-10 text-center text-textMuted">Loading shipments...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">Failed to load shipments.</div>
        ) : shipments?.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-textMuted">
            <Truck size={48} className="mb-4 opacity-50" />
            <p>No active shipments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sm text-textMuted uppercase tracking-wider">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Product ID</th>
                  <th className="p-4 font-semibold">Destination</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment: any) => (
                  <tr key={shipment.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                    <td className="p-4 font-medium text-xs text-textMuted">{shipment.id.slice(0, 8)}...</td>
                    <td className="p-4 text-xs">{shipment.product_id.slice(0, 8)}...</td>
                    <td className="p-4 text-xs">{shipment.to_company_id.slice(0, 8)}...</td>
                    <td className="p-4">
                      <Badge variant={shipment.status === 'PENDING' ? 'warning' : 'info'}>
                        {shipment.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="secondary" onClick={() => setSelectedShipment(shipment.id)} className="px-2 py-1 text-xs">
                        <Activity size={14} className="mr-1" /> Track
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={!!selectedShipment} onClose={() => setSelectedShipment(null)} title="Live Tracking Info">
        {trackingLoading ? (
          <div className="py-8 text-center text-textMuted flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            Contacting carrier API...
          </div>
        ) : trackingData ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <div className="text-sm text-textMuted">Tracking Number</div>
                <div className="font-bold text-lg text-primary">{trackingData.tracking_number}</div>
              </div>
              <Badge variant="info">{trackingData.carrier}</Badge>
            </div>
            
            <div>
              <div className="text-sm text-textMuted mb-1">Current Status</div>
              <div className="font-medium flex items-center gap-2 text-textMain">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                {trackingData.current_status}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2 bg-background p-4 rounded-lg">
              <div>
                <div className="text-xs text-textMuted">Last Updated</div>
                <div className="text-sm">{new Date(trackingData.last_updated).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-textMuted">Est. Delivery</div>
                <div className="text-sm font-medium">{new Date(trackingData.estimated_delivery).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-red-500">Failed to fetch tracking data.</div>
        )}
      </Modal>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Shipment">
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          {createError && <div className="text-red-500 text-sm">{createError}</div>}
          
          <div>
            <label className="block text-sm text-textMuted mb-1">Select Product</label>
            <select 
              className="w-full bg-background border border-border rounded-lg p-2 text-textMain outline-none focus:border-primary"
              value={formData.product_id}
              onChange={(e) => setFormData({...formData, product_id: e.target.value})}
            >
              <option value="">-- Choose a product --</option>
              {products?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} (Available: {p.quantity})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-textMuted mb-1">Destination Company ID</label>
            <input 
              type="text" 
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              className="w-full bg-background border border-border rounded-lg p-2 text-textMain outline-none focus:border-primary"
              value={formData.to_company_id}
              onChange={(e) => setFormData({...formData, to_company_id: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm text-textMuted mb-1">Quantity to Ship</label>
            <input 
              type="number" 
              min="1"
              className="w-full bg-background border border-border rounded-lg p-2 text-textMain outline-none focus:border-primary"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
            />
          </div>

          <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Initiating...' : 'Initiate Shipment'}
          </Button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
