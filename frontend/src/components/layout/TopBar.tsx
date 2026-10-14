import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import { useChurnStore } from '../../store/useChurnStore';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const [time, setTime] = useState<string>('');
  const { modelInfo } = useChurnStore();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'EXECUTIVE OVERVIEW';
      case '/predict':
        return 'SINGLE PREDICTOR ENGINE';
      case '/batch':
        return 'BATCH ANALYTICS UPLOADER';
      case '/model':
        return 'MODEL SPECIFICATION';
      default:
        return 'ANALYTICS SYSTEM';
    }
  };

  return (
    <div className="h-16 border-b border-border bg-bg-surface px-6 flex items-center justify-between select-none">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-mono tracking-widest text-text-primary uppercase font-bold">
          {getPageTitle()}
        </h1>
        <span className="text-text-muted text-xs">|</span>
        <span className="text-[10px] font-mono text-text-secondary tracking-widest">
          NODE_ID: US-EAST-01
        </span>
      </div>

      {/* Stats and Clock */}
      <div className="flex items-center gap-6">
        {/* Model Threshold Indicator */}
        {modelInfo && (
          <div className="hidden md:flex items-center gap-2 border border-border px-3 py-1 rounded bg-bg-primary/50 text-[10px] font-mono">
            <Cpu className="w-3.5 h-3.5 text-accent" />
            <span className="text-text-secondary">MODEL THRESHOLD:</span>
            <span className="text-accent font-semibold">{modelInfo.confusion_matrix ? '0.2620' : '0.50'}</span>
          </div>
        )}

        {/* System Activity */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-success bg-success/5 border border-success/10 px-3 py-1 rounded">
          <Activity className="w-3 h-3 animate-pulse text-success" />
          <span>SYS_LATENCY: 12ms</span>
        </div>

        {/* Real-time Clock */}
        <div className="text-xs font-mono text-text-secondary border border-border px-3 py-1 rounded bg-bg-primary/50">
          {time}
        </div>
      </div>
    </div>
  );
};
