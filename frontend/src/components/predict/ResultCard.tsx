import React from 'react';
import type { PredictionResponse } from '../../types';
import { Badge } from '../ui/Badge';
import { CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';

interface ResultCardProps {
  result: PredictionResponse;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const probPercentage = Math.round(result.churn_probability * 100);
  
  // Choose colors/icons based on risk tier
  const riskConfig = {
    Low: {
      color: 'text-success border-success/20 bg-success/5',
      badgeVariant: 'success' as const,
      icon: CheckCircle2,
      progressColor: 'var(--success)'
    },
    Medium: {
      color: 'text-warning border-warning/20 bg-warning/5',
      badgeVariant: 'warning' as const,
      icon: AlertTriangle,
      progressColor: 'var(--warning)'
    },
    High: {
      color: 'text-danger border-danger/20 bg-danger/5',
      badgeVariant: 'danger' as const,
      icon: XCircle,
      progressColor: 'var(--danger)'
    }
  };

  const currentRisk = riskConfig[result.risk_tier] || riskConfig.Low;
  const RiskIcon = currentRisk.icon;

  // SVG parameters for radial gauge
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.churn_probability * circumference);

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-6 space-y-6">
      <div className="border-b border-border pb-3 flex justify-between items-center">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
          RISK CLASSIFICATION REPORT
        </h3>
        <span className="text-[9px] font-mono text-text-muted">
          VERSION {result.model_version}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Radial Dial Display */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative w-36 h-36 flex items-center justify-center select-none">
            {/* SVG circular track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-bg-elevated fill-none"
                strokeWidth="10"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="gauge-circle fill-none"
                strokeWidth="10"
                stroke={currentRisk.progressColor}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-mono font-bold tracking-tight text-text-primary">
                {probPercentage}%
              </span>
              <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest font-semibold mt-0.5">
                PROBABILITY
              </span>
            </div>
          </div>
        </div>

        {/* Risk & Confidence Badges */}
        <div className="space-y-4">
          <div className={`p-4 border rounded-xl flex items-center gap-3.5 ${currentRisk.color}`}>
            <RiskIcon className="w-6 h-6 shrink-0" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60">Risk Profile</div>
              <div className="text-lg font-syne font-bold tracking-wide uppercase">{result.risk_tier} RISK</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-bg-primary/50 border border-border p-3 rounded-lg text-center">
              <span className="text-[8px] text-text-secondary uppercase tracking-wider block mb-1">Confidence</span>
              <Badge variant={result.confidence === 'High' ? 'success' : result.confidence === 'Medium' ? 'warning' : 'danger'}>
                {result.confidence}
              </Badge>
            </div>
            <div className="bg-bg-primary/50 border border-border p-3 rounded-lg text-center">
              <span className="text-[8px] text-text-secondary uppercase tracking-wider block mb-1">Response Time</span>
              <span className="text-xs text-text-primary font-bold">{Math.round(result.processing_time_ms)}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retention Recommendations */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
          TARGETED RETENTION INTERVENTIONS
        </h4>
        <div className="space-y-2">
          {result.retention_actions.map((action, idx) => (
            <div 
              key={idx} 
              className="bg-bg-primary/50 border border-border hover:border-text-muted p-3.5 rounded-lg flex gap-3 items-start transition-all"
            >
              <div className="p-1 rounded bg-accent/10 border border-accent/20 text-accent font-mono text-[10px] font-bold shrink-0">
                0{idx + 1}
              </div>
              <p className="text-xs leading-relaxed text-text-secondary font-sans font-medium">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
