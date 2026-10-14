import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  badge?: React.ReactNode;
  color?: string; // CSS color variable for borders or text
  textColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  subtext,
  badge,
  color = 'var(--accent)',
  textColor = 'text-text-primary'
}) => {
  return (
    <div 
      className="bg-bg-surface border border-border rounded-xl p-5 hover:border-text-muted transition-all duration-200 flex flex-col justify-between h-36 relative overflow-hidden group"
      style={{ borderLeftWidth: '4px', borderLeftColor: color }}
    >
      {/* Subtle grid background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/[0.01] to-transparent rounded-bl-full pointer-events-none" />
      
      {/* Header section */}
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest font-semibold">
          {title}
        </span>
        <div className="p-1.5 rounded bg-bg-primary/50 border border-border">
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      
      {/* Value and badge section */}
      <div className="flex items-end justify-between mt-4">
        <div>
          <span className={`text-2xl font-mono font-bold tracking-tight ${textColor}`}>
            {value}
          </span>
          {subtext && (
            <p className="text-[9px] font-mono text-text-muted mt-1 uppercase tracking-wide">
              {subtext}
            </p>
          )}
        </div>
        {badge && <div className="ml-2">{badge}</div>}
      </div>
    </div>
  );
};
