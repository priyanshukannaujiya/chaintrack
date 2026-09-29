import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Package, Plus, Upload, CheckCircle2, XCircle,
  AlertTriangle, X, FileText, Search
} from 'lucide-react';
import { fetchProducts, importProducts } from '../services/products';

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
              <p className="text-xs text-textMuted mt-0.5">CSV processing finished</p>
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
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const importMutation = useMutation({
    mutationFn: importProducts,
    onSuccess: (data: ImportResult) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setImportResult(data);
      setShowModal(true);
    },
    onError: () => {
      setImportResult(null);
      setShowModal(true);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = products?.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <DashboardLayout>
      <ImportResultModal result={importResult} onClose={() => { setShowModal(false); setImportResult(null); }} />

      {/* Error modal */}
      {showModal && !importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative glass-strong rounded-2xl p-8 text-center max-w-sm w-full animate-slide-up">
            <XCircle size={36} className="text-danger mx-auto mb-3" />
            <h2 className="text-base font-bold text-textMain mb-1">Import Failed</h2>
            <p className="text-sm text-textMuted mb-5">Could not upload the file. Check the backend is running.</p>
            <Button onClick={() => setShowModal(false)} variant="danger" size="sm">Close</Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Products</h1>
          <p className="text-textMuted text-sm mt-1">Manage your inventory catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
          >
            <Upload size={15} />
            {importMutation.isPending ? 'Importing…' : 'Import CSV'}
          </Button>
          <Button size="sm">
            <Plus size={15} />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search + table */}
      <Card className="p-0 overflow-hidden">
        {/* Search bar */}
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-3">
          <Search size={15} className="text-textMuted shrink-0" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-textMain placeholder:text-textMuted outline-none"
          />
          {products && (
            <span className="text-xs text-textMuted shrink-0">{filtered.length} items</span>
          )}
        </div>

        {isLoading ? (
          <div className="py-14 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-textMuted">Loading products…</p>
          </div>
        ) : error ? (
          <div className="py-14 text-center">
            <XCircle size={32} className="text-danger mx-auto mb-2 opacity-60" />
            <p className="text-sm text-danger">Failed to load products.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-textMuted">
            <Package size={40} className="opacity-30" />
            <p className="text-sm">{search ? 'No matching products' : 'No products yet'}</p>
            {!search && <p className="text-xs text-textMuted">Import a CSV or add products manually</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Description', 'Qty', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-textMuted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product: any) => (
                  <tr key={product.id} className="tr-hover border-b border-border last:border-0">
                    <td className="px-5 py-3.5 text-sm font-semibold text-textMain">{product.name}</td>
                    <td className="px-5 py-3.5 text-sm text-textMuted max-w-[200px] truncate">
                      {product.description || <span className="text-textMuted/40">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-textMain">{product.quantity.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={product.status === 'ACTIVE' ? 'success' : product.status === 'DRAFT' ? 'default' : 'warning'} dot>
                        {product.status}
                      </Badge>
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
