import React, { useState } from 'react';
import Papa from 'papaparse';
import { Download, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import type { BatchPredictionResponse, PredictionResponse } from '../../types';
import { Badge } from '../ui/Badge';

interface BatchResultsTableProps {
  response: BatchPredictionResponse;
}

export const BatchResultsTable: React.FC<BatchResultsTableProps> = ({ response }) => {
  const { results, total, churners, churn_rate } = response;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Pagination calculations
  const totalPages = Math.ceil(results.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedResults = results.slice(startIndex, startIndex + pageSize);

  const handleExportCSV = () => {
    // Flatten predictions to readable rows
    const exportData = results.map((item, idx) => ({
      RecordNumber: idx + 1,
      ChurnProbability: (item.churn_probability).toFixed(4),
      ChurnPrediction: item.churn_prediction,
      RiskTier: item.risk_tier,
      Confidence: item.confidence,
      PrimaryAction: item.retention_actions[0] || 'N/A',
      SecondaryAction: item.retention_actions[1] || 'N/A',
      ModelVersion: item.model_version
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'churn_intel_batch_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'info';
    }
  };

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-6 space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            CLASSIFICATION OUTCOME MATRIX
          </h3>
          <p className="text-[9px] font-mono text-text-muted mt-0.5 uppercase">
            BATCH SUMMARY STATS FOR {total} PROFILED RECORDS
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-border bg-bg-primary/50 px-3 py-1 rounded text-[10px] font-mono">
            <span className="text-text-secondary">CHURNERS:</span>
            <span className="text-danger font-bold">{churners}</span>
          </div>
          <div className="flex items-center gap-2 border border-border bg-bg-primary/50 px-3 py-1 rounded text-[10px] font-mono">
            <span className="text-text-secondary">RATE:</span>
            <span className="text-accent font-bold">{(churn_rate * 100).toFixed(2)}%</span>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-accent hover:bg-accent-soft text-white font-mono text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded border border-accent/20 flex items-center gap-2 transition-all cursor-pointer font-semibold"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto border border-border rounded-lg bg-bg-primary/20">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-bg-elevated/40 border-b border-border select-none">
              <th className="p-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider w-16">ID</th>
              <th className="p-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider w-28">Probability</th>
              <th className="p-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider w-24">Risk Tier</th>
              <th className="p-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider w-24">Confidence</th>
              <th className="p-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Primary Retention Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {paginatedResults.map((item, idx) => {
              const recordId = startIndex + idx + 1;
              return (
                <tr 
                  key={idx} 
                  className="hover:bg-bg-elevated/35 transition-colors duration-150"
                >
                  <td className="p-3 text-text-secondary font-bold">#{recordId}</td>
                  <td className="p-3 font-semibold text-text-primary">
                    {(item.churn_probability * 100).toFixed(2)}%
                  </td>
                  <td className="p-3">
                    <Badge variant={getRiskBadgeVariant(item.risk_tier)}>
                      {item.risk_tier}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={item.confidence === 'High' ? 'success' : item.confidence === 'Medium' ? 'warning' : 'danger'}>
                      {item.confidence}
                    </Badge>
                  </td>
                  <td className="p-3 text-text-secondary truncate max-w-xs sm:max-w-md font-sans">
                    {item.retention_actions[0] || 'No recommendation'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-text-secondary select-none">
        <div className="flex items-center gap-2">
          <span>Displaying {startIndex + 1}-{Math.min(startIndex + pageSize, total)} of {total}</span>
          <span className="text-text-muted">|</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-bg-primary border border-border rounded px-2 py-0.5 text-[10px] text-text-primary focus:outline-none focus:border-accent"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-border bg-bg-surface hover:bg-bg-elevated text-text-primary disabled:opacity-30 disabled:hover:bg-bg-surface transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          
          <span className="px-2">Page {currentPage} of {totalPages}</span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-border bg-bg-surface hover:bg-bg-elevated text-text-primary disabled:opacity-30 disabled:hover:bg-bg-surface transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
