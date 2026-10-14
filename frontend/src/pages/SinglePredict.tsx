import React, { useState } from 'react';
import { useChurnStore } from '../store/useChurnStore';
import { predictSingle } from '../services/api';
import { PredictForm } from '../components/predict/PredictForm';
import { ResultCard } from '../components/predict/ResultCard';
import { ShapChart } from '../components/predict/ShapChart';
import type { CustomerInput } from '../types';
import { toast } from 'react-hot-toast';
import { HelpCircle, Terminal } from 'lucide-react';
import { Tooltip } from '../components/ui/Tooltip';

export const SinglePredict: React.FC = () => {
  const { latestPrediction, setPrediction, isLoading, setLoading, setError, error } = useChurnStore();
  const [activeCustomer, setActiveCustomer] = useState<CustomerInput | null>(null);

  const handlePredictSubmit = async (data: CustomerInput) => {
    setLoading(true);
    setError(null);
    setActiveCustomer(data);
    
    try {
      const res = await predictSingle(data);
      setPrediction(res.data);
      toast.success('Inference complete.', {
        style: {
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '11px'
        }
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'Prediction call failed';
      setError(errMsg);
      toast.error('Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Intro Header */}
      <div className="flex justify-between items-center bg-bg-surface border border-border p-5 rounded-xl">
        <div>
          <h2 className="text-base font-syne font-extrabold tracking-wider text-text-primary flex items-center gap-2">
            SINGLE CLIENT INFERENCE NODE
          </h2>
          <p className="text-xs text-text-secondary font-mono mt-0.5">
            CALCULATE DISCRETE PROBABILITY SCORES WITH COGNITIVE EXPLANABILITY
          </p>
        </div>
        <div className="flex items-center gap-1.5 border border-border px-3 py-1.5 rounded bg-bg-primary/50 text-[10px] font-mono text-text-secondary">
          <Terminal className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span>PORT: 8000 (INFERENCE_OK)</span>
        </div>
      </div>

      {/* Main Form and Output Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left side: Input Form */}
        <div className="lg:col-span-5">
          <PredictForm onSubmit={handlePredictSubmit} isLoading={isLoading} />
        </div>

        {/* Right side: Results Report */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            <div className="bg-bg-surface border border-border rounded-xl p-16 flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                <span className="absolute text-[8px] font-mono text-accent animate-pulse uppercase">RUNNING</span>
              </div>
              <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest mt-6">
                Executing Soft Voting Ensemble...
              </p>
            </div>
          ) : latestPrediction ? (
            <>
              <ResultCard result={latestPrediction} />
              {latestPrediction.shap_explanation.length > 0 && (
                <ShapChart data={latestPrediction.shap_explanation} />
              )}
            </>
          ) : (
            <div className="bg-bg-surface border border-border border-dashed rounded-xl p-16 flex flex-col items-center justify-center text-center h-full min-h-[400px] select-none">
              <div className="p-4 rounded-full bg-bg-primary/40 border border-border mb-4 text-text-muted">
                <Terminal className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-mono text-text-primary uppercase tracking-wide font-bold">
                Telemetry Awaiting Payload
              </h4>
              <p className="text-[10px] font-mono text-text-secondary mt-1.5 uppercase max-w-xs leading-relaxed">
                Enter customer profile statistics on the left panel and click execute to trigger model decision boundary logic.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
