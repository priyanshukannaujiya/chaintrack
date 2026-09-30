import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  Package, Plus, Upload, CheckCircle2, XCircle,
  AlertTriangle, X, FileText, Search,
  Tag, Hash, FileSpreadsheet, Link
} from 'lucide-react';
import { fetchProducts, importProducts, createProduct } from '../services/products';
import api from '../services/api';

// Register a product event on Ethereum Sepolia via MetaMask
async function registerOnBlockchain(productId: string, productName: string): Promise<string> {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error('MetaMask not found. Please install MetaMask.');
  await eth.request({ method: 'eth_requestAccounts' });
  const accounts: string[] = await eth.request({ method: 'eth_accounts' });
  const from = accounts[0];
  // Encode product info as hex data for the tx
  const data = '0x' + Array.from(new TextEncoder().encode(
    JSON.stringify({ product_id: productId, event: 'PRODUCT_REGISTERED', name: productName })
  )).map(b => b.toString(16).padStart(2, '0')).join('');
  const txHash: string = await eth.request({
    method: 'eth_sendTransaction',
    params: [{ from, to: from, value: '0x0', data, chainId: '0xaa36a7' /* Sepolia */ }],
  });
  // Store the tx_hash in our backend
  await api.post('/blockchain/events', {
    product_id: productId,
    transaction_hash: txHash,
    event_type: 'PRODUCT_REGISTERED',
  });
  return txHash;
}

interface RowError { row_num: number; error: string; }
interface ImportResult { success_count: number; errors: RowError[]; }

const ImportResultModal: React.FC<{ result: ImportResult | null; onClose: () => void }> = ({ result, onClose }) => {
  if (!result) return null;
  const hasErrors = result.errors.length > 0;
  const allFailed = result.success_count === 0 && hasErrors;
  const allSuccess = result.success_count > 0 && !hasErrors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md glass-strong rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-primary/60 via-secondary/60 to-transparent" />

        {/* Header */}
        <div className={`px-6 pt-6 pb-4 flex items-start justify-between border-b border-border ${
          allSuccess ? 'bg-success/5' : allFailed ? 'bg-danger/5' : 'bg-warning/5'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              allSuccess ? 'bg-success/15' : allFailed ? 'bg-danger/15' : 'bg-warning/15'
            }`}>
              {allSuccess
                ? <CheckCircle2 size={20} className="text-success" />
                : allFailed
                ? <XCircle size={20} className="text-danger" />
                : <AlertTriangle size={20} className="text-warning" />}
            </div>
            <div>
              <h3 className="font-semibold text-textMain text-sm">Import Complete</h3>
              <p className="text-xs text-textMuted mt-0.5">CSV batch processing finished</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-textMuted hover:text-textMain hover:bg-surface-2 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="px-6 py-5 text-center">
            <p className="text-3xl font-bold text-success">{result.success_count}</p>
            <p className="text-xs text-textMuted mt-1 uppercase tracking-wider font-medium">Imported</p>
          </div>
          <div className="px-6 py-5 text-center">
            <p className={`text-3xl font-bold ${result.errors.length > 0 ? 'text-danger' : 'text-textMuted'}`}>
              {result.errors.length}
            </p>
            <p className="text-xs text-textMuted mt-1 uppercase tracking-wider font-medium">Errors</p>
          </div>
        </div>

        {/* Errors */}
        {hasErrors && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={13} className="text-textMuted" />
              <p className="text-xs font-semibold text-textMuted uppercase tracking-wider">Error Details</p>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {result.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-danger/5 border border-danger/20 px-3 py-2.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-danger/15 text-danger text-[10px] font-bold shrink-0 mt-0.5">
                    {err.row_num}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-danger">Row {err.row_num}</p>
                    <p className="text-xs text-textSub mt-0.5">{err.error}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button onClick={onClose} variant={allFailed ? 'danger' : 'primary'} size="sm" className="px-6">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Products: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [search, setSearch] = useState('');
  
  // Create Product modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: 100, description: '' });
  const [createError, setCreateError] = useState('');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const importMutation = useMutation({
    mutationFn: importProducts,
    onSuccess: (data: ImportResult) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setImportResult(data);
    },
    onError: () => {
      setShowErrorModal(true);
    },
  });

  const [blockchainLoading, setBlockchainLoading] = useState<string | null>(null);
  const [blockchainDone, setBlockchainDone]       = useState<Set<string>>(new Set());

  const handleRegisterBlockchain = async (productId: string, productName: string) => {
    setBlockchainLoading(productId);
    try {
      const txHash = await registerOnBlockchain(productId, productName);
      setBlockchainDone(prev => new Set(prev).add(productId));
      console.log('Blockchain tx:', txHash);
    } catch (err: any) {
      alert(err?.message || 'Blockchain registration failed');
    } finally {
      setBlockchainLoading(null);
    }
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateOpen(false);
      setNewProduct({ name: '', quantity: 100, description: '' });
      setCreateError('');
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.detail || 'Failed to create product');
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) {
      setCreateError('Product name is required');
      return;
    }
    createMutation.mutate(newProduct);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,name,quantity,description\n' +
      'Cold-Chain Insulin R-100,500,Refrigerated pharmaceutical insulin batch\n' +
      '3nm Silicon Wafer Lot #4,200,High-precision semiconductor wafers\n' +
      'EV Battery Cells 800V,1200,Automotive grade energy storage modules\n' +
      'Organic Fair-Trade Coffee,3500,Single origin arabica green beans';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'chaintrack_sample_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = products?.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  ) ?? [];

  return (
    <DashboardLayout>
      <ImportResultModal result={importResult} onClose={() => setImportResult(null)} />

      {/* Error modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={() => setShowErrorModal(false)} />
          <div className="relative glass-strong rounded-2xl p-8 text-center max-w-sm w-full animate-slide-up border border-danger/30">
            <XCircle size={36} className="text-danger mx-auto mb-3" />
            <h2 className="text-base font-bold text-textMain mb-1">Import Failed</h2>
            <p className="text-sm text-textMuted mb-5">Could not process CSV. Ensure backend is running and CSV format is valid.</p>
            <Button onClick={() => setShowErrorModal(false)} variant="danger" size="sm">Close</Button>
          </div>
        </div>
      )}

      {/* Manual Product Creation Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Asset / Product"
        subtitle="Mint product specifications into the ChainTrack registry"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs">
              {createError}
            </div>
          )}

          <Input
            label="Product / SKU Name"
            placeholder="e.g. Cold-Chain Insulin R-100"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            icon={<Tag size={15} />}
            required
          />

          <Input
            label="Initial Batch Quantity"
            type="number"
            min="1"
            placeholder="100"
            value={newProduct.quantity.toString()}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 1 })}
            icon={<Hash size={15} />}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-textSub mb-1.5">Description / Specifications</label>
            <textarea
              rows={3}
              placeholder="e.g. Temperature-controlled batch requiring continuous +2°C to +8°C telemetry."
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2/60 border border-border text-sm text-textMain placeholder-textMuted focus:outline-none focus:border-primary/60 transition-all resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Registering...' : 'Register Asset'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Enterprise Asset Ledger</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-textMain tracking-tight">Products & Inventory</h1>
          <p className="text-textMuted text-xs mt-0.5">Manage tokenized catalog items and track verified inventory batches.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Download sample CSV template */}
          <button
            onClick={handleDownloadSampleCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs font-semibold text-textSub hover:text-textMain hover:border-primary/40 transition-all"
            title="Download CSV template"
          >
            <FileSpreadsheet size={14} className="text-accent" />
            <span>Sample CSV</span>
          </button>

          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
          >
            <Upload size={14} />
            {importMutation.isPending ? 'Importing…' : 'Bulk Import CSV'}
          </Button>

          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus size={14} />
            Register Product
          </Button>
        </div>
      </div>

      {/* Search + Table Container */}
      <Card className="p-0 overflow-hidden">
        {/* Search bar */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between gap-3 bg-surface-2/30">
          <div className="flex items-center gap-3 flex-1">
            <Search size={15} className="text-textMuted shrink-0" />
            <input
              type="text"
              placeholder="Search product name or technical specifications…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-xs text-textMain placeholder:text-textMuted outline-none"
            />
          </div>
          {products && (
            <span className="text-[11px] font-semibold text-textMuted shrink-0 bg-surface px-2.5 py-1 rounded-lg border border-border/60">
              {filtered.length} registered
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-textMuted font-mono">Querying decentralized inventory state…</p>
          </div>
        ) : error ? (
          <div className="py-14 text-center">
            <XCircle size={32} className="text-danger mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-danger">Failed to load product catalog.</p>
            <p className="text-xs text-textMuted mt-1">Verify backend connectivity or check authorization token.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-textMuted text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center border border-border">
              <Package size={24} className="text-textMuted/60" />
            </div>
            <div>
              <p className="text-sm font-semibold text-textMain">{search ? 'No matching products found' : 'No registered assets in this company'}</p>
              <p className="text-xs text-textMuted mt-0.5">
                {search ? 'Try clearing your search query' : 'Import your catalog using CSV or register a product manually.'}
              </p>
            </div>
            {!search && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                  <Plus size={14} /> Register First Product
                </Button>
                <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} /> Upload CSV
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-2/20 text-textMuted uppercase tracking-wider font-semibold text-[10px]">
                  <th className="px-5 py-3.5">Asset Name</th>
                  <th className="px-5 py-3.5">Specifications / Description</th>
                  <th className="px-5 py-3.5">Available Quantity</th>
                  <th className="px-5 py-3.5">Ledger Status</th>
                  <th className="px-5 py-3.5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((product: any) => (
                  <tr key={product.id} className="hover:bg-surface-2/40 transition-colors group">
                    <td className="px-5 py-3.5 font-semibold text-textMain group-hover:text-primary transition-colors">
                      {product.name}
                    </td>
                    <td className="px-5 py-3.5 text-textMuted max-w-[280px] truncate">
                      {product.description || <span className="text-textMuted/40 font-mono">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-textMain bg-surface-2/60 px-2 py-0.5 rounded border border-border/60">
                        {product.quantity.toLocaleString()} units
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={product.status === 'ACTIVE' ? 'success' : product.status === 'DRAFT' ? 'default' : 'warning'} dot>
                        {product.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {blockchainDone.has(product.id) ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                          <CheckCircle2 size={12} /> Registered on-chain
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegisterBlockchain(product.id, product.name)}
                          disabled={blockchainLoading === product.id}
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary hover:text-white hover:bg-primary/80 bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full transition-all disabled:opacity-50 disabled:cursor-wait"
                        >
                          {blockchainLoading === product.id ? (
                            <><div className="w-2.5 h-2.5 border border-primary/40 border-t-primary rounded-full animate-spin" /> Signing…</>
                          ) : (
                            <><Link size={11} /> Register on ⛓️ Chain</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};
