import React, { useEffect } from 'react';
import { useChurnStore } from '../store/useChurnStore';
import { Spinner } from '../components/ui/Spinner';
import { Cpu, CheckCircle2, ChevronRight, BarChart3, Database } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const ModelInfoPage: React.FC = () => {
  const { modelInfo, isLoading, error, fetchModelInfo } = useChurnStore();

  useEffect(() => {
    fetchModelInfo();
  }, [fetchModelInfo]);

  if (isLoading && !modelInfo) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl font-mono text-xs max-w-xl">
          <div className="font-bold uppercase tracking-wider mb-1">MODEL METADATA ACCESS FAILURE</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  // Formatting calculations
  const totalTest = modelInfo ? (
    modelInfo.confusion_matrix.TN + 
    modelInfo.confusion_matrix.FP + 
    modelInfo.confusion_matrix.FN + 
    modelInfo.confusion_matrix.TP
  ) : 0;
  
  const accuracy = modelInfo ? (
    (modelInfo.confusion_matrix.TN + modelInfo.confusion_matrix.TP) / totalTest * 100
  ).toFixed(2) + '%' : '0.0%';

  return (
    <div className="p-6 space-y-6 select-none">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-bg-surface border border-border p-5 rounded-xl">
        <div>
          <h2 className="text-base font-syne font-extrabold tracking-wider text-text-primary flex items-center gap-2">
            MODEL ARCHITECTURE SPECIFICATIONS
          </h2>
          <p className="text-xs text-text-secondary font-mono mt-0.5">
            EVALUATE HYPERPARAMETERS, PERFORMANCE COEFFICIENTS, AND GLOBAL FEATURE IMPORTANCES
          </p>
        </div>
        <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded bg-bg-primary/50 text-[10px] font-mono text-text-secondary">
          <Cpu className="w-3.5 h-3.5 text-accent animate-spin" />
          <span>ENSEMBLE MODEL ON</span>
        </div>
      </div>

      {modelInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Specs & Confusion Matrix */}
          <div className="lg:col-span-6 space-y-6">
            {/* Spec Card */}
            <div className="bg-bg-surface border border-border rounded-xl p-5 space-y-4">
              <div className="border-b border-border pb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                  METRICS SUMMARY
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-bg-primary/50 border border-border p-3 rounded-lg">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block mb-1">Architecture</span>
                  <span className="text-text-primary font-bold">{modelInfo.model_type.split(' (')[0]}</span>
                </div>
                <div className="bg-bg-primary/50 border border-border p-3 rounded-lg">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block mb-1">Last Trained</span>
                  <span className="text-text-primary font-bold">{modelInfo.last_trained}</span>
                </div>
                <div className="bg-bg-primary/50 border border-border p-3 rounded-lg">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block mb-1">Training Samples</span>
                  <span className="text-text-primary font-bold">{modelInfo.training_samples} (SMOTE'd)</span>
                </div>
                <div className="bg-bg-primary/50 border border-border p-3 rounded-lg">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block mb-1">Testing Samples</span>
                  <span className="text-text-primary font-bold">{modelInfo.testing_samples}</span>
                </div>
                <div className="bg-bg-primary/50 border border-border p-3 rounded-lg">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block mb-1">ROC-AUC Coefficient</span>
                  <span className="text-accent font-bold text-sm">{(modelInfo.roc_auc).toFixed(4)}</span>
                </div>
                <div className="bg-bg-primary/50 border border-border p-3 rounded-lg">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block mb-1">Evaluation Accuracy</span>
                  <span className="text-success font-bold text-sm">{accuracy}</span>
                </div>
              </div>
            </div>

            {/* Confusion Matrix Card */}
            <div className="bg-bg-surface border border-border rounded-xl p-5 space-y-4">
              <div className="border-b border-border pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                    CONFUSION MATRIX HEATMAP
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-text-muted">YOUDEN'S J THRESHOLD</span>
              </div>
              
              {/* Heatmap Grid */}
              <div className="grid grid-cols-3 gap-2 font-mono text-center select-none text-[10px] sm:text-xs">
                {/* Labels row */}
                <div className="border border-transparent" />
                <div className="p-2 border border-border bg-bg-primary/30 text-text-secondary font-bold uppercase">Pred Neg</div>
                <div className="p-2 border border-border bg-bg-primary/30 text-text-secondary font-bold uppercase">Pred Pos</div>
                
                {/* True Neg row */}
                <div className="p-2 border border-border bg-bg-primary/30 text-text-secondary font-bold uppercase flex items-center justify-center">Actual Neg</div>
                <div className="p-4 bg-success/20 border border-success/30 text-success text-center">
                  <div className="font-bold text-sm">{modelInfo.confusion_matrix.TN}</div>
                  <div className="text-[8px] opacity-70 mt-0.5">True Negative</div>
                </div>
                <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-center">
                  <div className="font-bold text-sm">{modelInfo.confusion_matrix.FP}</div>
                  <div className="text-[8px] opacity-70 mt-0.5">False Positive</div>
                </div>
                
                {/* True Pos row */}
                <div className="p-2 border border-border bg-bg-primary/30 text-text-secondary font-bold uppercase flex items-center justify-center">Actual Pos</div>
                <div className="p-4 bg-danger/15 border border-danger/25 text-danger/80 text-center">
                  <div className="font-bold text-sm">{modelInfo.confusion_matrix.FN}</div>
                  <div className="text-[8px] opacity-70 mt-0.5">False Negative</div>
                </div>
                <div className="p-4 bg-success/35 border border-success/40 text-success text-center font-semibold">
                  <div className="font-bold text-sm">{modelInfo.confusion_matrix.TP}</div>
                  <div className="text-[8px] opacity-80 mt-0.5">True Positive</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Feature Importances */}
          <div className="lg:col-span-6">
            <div className="bg-bg-surface border border-border rounded-xl p-5 space-y-4">
              <div className="border-b border-border pb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                  GLOBAL FEATURE IMPORTANCES (AVERAGED)
                </h3>
              </div>
              <p className="text-[9px] font-mono text-text-muted mt-1 uppercase leading-relaxed">
                THE RELATIVE IMPORTANCE OF EACH INPUT ATTRIBUTION SCORE DERIVED FROM COMBINED RANDOM FOREST AND XGBOOST WEIGHTS
              </p>

              <div className="space-y-2 mt-4">
                {modelInfo.feature_importances.map((item, idx) => {
                  const percent = (item.importance * 100).toFixed(1);
                  return (
                    <div key={item.feature} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px] font-mono select-none">
                        <span className="text-text-primary font-bold flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 text-text-muted" />
                          {item.feature}
                        </span>
                        <span className="text-text-secondary font-semibold">{percent}%</span>
                      </div>
                      <div className="w-full bg-bg-primary border border-border rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-accent h-full rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
