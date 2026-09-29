import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Box, Plus, Upload, CheckCircle2, XCircle, AlertTriangle, X, FileText } from 'lucide-react';
import { fetchProducts, importProducts } from '../services/products';

interface RowError {
  row_num: number;
  error: string;
}

interface ImportResult {
  success_count: number;
  errors: RowError[];
}

const ImportResultModal: React.FC<{ result: ImportResult | null; onClose: () => void }> = ({ result, onClose }) => {
  if (!result) return null;

  const hasErrors = result.errors.length > 0;
  const allFailed = result.success_count === 0 && hasErrors;
  const allSuccess = result.success_count > 0 && !hasErrors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-border bg-surface shadow-2xl animate-slide-up overflow-hidden">

        {/* Header */}
        <div className={`px-6 py-5 flex items-start justify-between border-b border-border ${
          allSuccess ? 'bg-emerald-500/10' : allFailed ? 'bg-red-500/10' : 'bg-amber-500/10'
        }`}>
          <div className="flex items-center gap-3">
            {allSuccess ? (
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-emerald-400" />
              </div>
            ) : allFailed ? (
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle size={22} className="text-red-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle size={22} className="text-amber-400" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-textMain">Import Complete</h2>
              <p className="text-sm text-textMuted mt-0.5">CSV import finished processing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-textMuted hover:text-textMain transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="px-6 py-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{result.success_count}</p>
            <p className="text-xs text-textMuted mt-1 uppercase tracking-wider font-medium">Rows Imported</p>
          </div>
          <div className="px-6 py-4 text-center">
            <p className={`text-3xl font-bold ${result.errors.length > 0 ? 'text-red-400' : 'text-textMuted'}`}>
              {result.errors.length}
            </p>
            <p className="text-xs text-textMuted mt-1 uppercase tracking-wider font-medium">Errors Found</p>
          </div>
        </div>

        {/* Error list */}
        {hasErrors && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-textMuted" />
              <p className="text-sm font-semibold text-textMuted uppercase tracking-wider">Error Details</p>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {result.errors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg bg-red-500/8 border border-red-500/20 px-3 py-2.5"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                      {err.row_num}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-400">Row {err.row_num}</p>
                    <p className="text-sm text-textMain mt-0.5">{err.error}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          {hasErrors && (
            <p className="text-xs text-textMuted self-center flex-1">
              Fix the errors above and re-import the corrected rows.
            </p>
          )}
          <Button onClick={onClose} variant={allFailed ? 'danger' : 'primary'} className="px-6">
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
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout>
      <ImportResultModal
        result={importResult}
        onClose={() => { setShowModal(false); setImportResult(null); }}
      />
      {showModal && !importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-red-500/30 bg-surface p-8 shadow-2xl text-center max-w-sm mx-4">
            <XCircle size={40} className="text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-textMain mb-1">Import Failed</h2>
            <p className="text-sm text-textMuted mb-4">Could not upload the file. Check that the backend is running.</p>
            <Button onClick={() => setShowModal(false)} variant="danger">Close</Button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textMain">Products</h1>
          <p className="text-textMuted mt-1">Manage your inventory</p>
          {importMutation.isPending && (
            <p className="text-sm text-primary mt-2 animate-pulse">⏳ Importing CSV...</p>
          )}
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
          >
            <Upload size={18} />
            {importMutation.isPending ? 'Importing...' : 'Import CSV'}
          </Button>
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Add Product
          </Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-10 text-center text-textMuted">Loading products...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">Failed to load products. Ensure backend is running.</div>
        ) : products?.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-textMuted">
            <Box size={48} className="mb-4 opacity-50" />
            <p>No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sm text-textMuted uppercase tracking-wider">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">Quantity</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 text-textMuted text-sm">{product.description || '—'}</td>
                    <td className="p-4">{product.quantity}</td>
                    <td className="p-4">
                      <Badge variant={product.status === 'DRAFT' ? 'default' : 'success'}>
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
