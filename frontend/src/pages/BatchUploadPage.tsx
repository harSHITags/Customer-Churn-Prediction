import React from 'react';
import { useChurnStore } from '../store/useChurnStore';
import { predictBatch } from '../services/api';
import { BatchUpload } from '../components/batch/BatchUpload';
import { BatchResultsTable } from '../components/batch/BatchResultsTable';
import { toast } from 'react-hot-toast';
import { UploadCloud, FileSpreadsheet, RefreshCw } from 'lucide-react';

export const BatchUploadPage: React.FC = () => {
  const { batchResults, setBatchResults, isLoading, setLoading, error, setError } = useChurnStore();

  const handleBatchUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setBatchResults(null);
    
    try {
      const res = await predictBatch(file);
      setBatchResults(res.data);
      toast.success(`Classification complete. ${res.data.total} records.`, {
        style: {
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '11px'
        }
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'Batch classification failed';
      setError(errMsg);
      toast.error('Batch upload execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBatchResults(null);
    setError(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-bg-surface border border-border p-5 rounded-xl">
        <div>
          <h2 className="text-base font-syne font-extrabold tracking-wider text-text-primary flex items-center gap-2">
            BATCH FILE MATRIX PROCESSING
          </h2>
          <p className="text-xs text-text-secondary font-mono mt-0.5">
            PROCESS BULK PORTFOLIO EXPORTS VIA RAPID PARSING AND CLASSIFICATION
          </p>
        </div>
        {batchResults && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 border border-border hover:border-text-secondary px-3.5 py-1.5 rounded bg-bg-primary/50 text-[10px] font-mono text-text-secondary transition-all cursor-pointer font-bold uppercase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Process New Batch</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {!batchResults ? (
          /* Dropzone component */
          <div className="max-w-2xl mx-auto w-full">
            <BatchUpload onUpload={handleBatchUpload} isLoading={isLoading} error={error} />
            
            {/* Guide to formatting */}
            <div className="bg-bg-surface border border-border rounded-xl p-5 mt-6 font-mono text-[10px] text-text-secondary leading-relaxed space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-2 text-text-primary font-semibold">
                <FileSpreadsheet className="w-4 h-4 text-accent" />
                <span>CSV INPUT SCHEMA SPECIFICATIONS</span>
              </div>
              <p>
                The classification pipeline expects a standard bank CSV containing precisely the following headers (order independent):
              </p>
              <div className="bg-bg-primary/50 border border-border p-3 rounded-lg text-text-muted select-all">
                CreditScore, Geography, Gender, Age, Tenure, Balance, NumOfProducts, HasCrCard, IsActiveMember, EstimatedSalary
              </div>
              <ul className="list-disc list-inside space-y-1 mt-2 text-text-muted">
                <li>Geography must be either: <strong className="text-text-secondary">France</strong>, <strong className="text-text-secondary">Germany</strong>, or <strong className="text-text-secondary">Spain</strong></li>
                <li>Gender must be: <strong className="text-text-secondary">Male</strong> or <strong className="text-text-secondary">Female</strong></li>
                <li>Binary columns (HasCrCard, IsActiveMember) must be <strong className="text-text-secondary">0</strong> or <strong className="text-text-secondary">1</strong></li>
              </ul>
            </div>
          </div>
        ) : (
          /* Paginated Results Table */
          <div className="w-full">
            <BatchResultsTable response={batchResults} />
          </div>
        )}
      </div>
    </div>
  );
};
