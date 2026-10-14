import React from 'react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Shield, ShieldAlert, Award, Zap } from 'lucide-react';

interface BusinessInsightsProps {
  churnByAgeBin: { [key: string]: number };
  churnByProductCount: { [key: string]: number };
  churnByActivity: { Active: number; Inactive: number };
}

export const BusinessInsights: React.FC<BusinessInsightsProps> = ({
  churnByAgeBin,
  churnByProductCount,
  churnByActivity
}) => {
  // 1. Prepare Age Data
  const ageData = Object.entries(churnByAgeBin).map(([bin, rate]) => ({
    name: bin,
    rate: rate
  }));

  // 2. Prepare Product Data
  const productData = Object.entries(churnByProductCount)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([count, rate]) => ({
      name: `${count} Product${Number(count) > 1 ? 's' : ''}`,
      rate: rate
    }));

  // 3. Prepare Activity Data
  const activityData = [
    { name: 'Active Member', rate: churnByActivity.Active },
    { name: 'Inactive Member', rate: churnByActivity.Inactive }
  ];

  // Formatting utility for percentages
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Title Divider */}
      <div className="border-b border-border pb-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent animate-pulse" />
          PORTFOLIO BEHAVIORAL RISK ANALYSIS
        </h3>
        <p className="text-[9px] font-mono text-text-muted mt-0.5">
          DEEPER SEGMENT ATTRIBUTIONS CALCULATED OVER CURRENT ACCOUNT POPULATION
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Age Bin Churn Rate */}
        <div className="bg-bg-surface border border-border rounded-xl p-5 h-80 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-primary">
              CHURN RATE BY AGE DEMOGRAPHIC
            </h4>
            <p className="text-[8px] font-mono text-text-muted mt-0.5">
              ACTUAL ATTRITION SEGMENTED BY CUSTOMER AGE BINS
            </p>
          </div>

          <div className="flex-1 w-full text-[9px] font-mono mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageData}
                margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={formatPercent}
                  domain={[0, 1]}
                />
                <RechartsTooltip
                  formatter={(value: number) => [formatPercent(value), 'Churn Rate']}
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '9px'
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Bar dataKey="rate" radius={[3, 3, 0, 0]}>
                  {ageData.map((entry, index) => {
                    // Alert color based on rate severity
                    const fill = entry.rate > 0.4 
                      ? 'var(--danger)' 
                      : entry.rate > 0.2 
                        ? 'var(--warning)' 
                        : 'var(--success)';
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={fill} 
                        fillOpacity={0.8}
                        stroke={fill}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[8px] font-mono text-text-secondary bg-bg-primary/50 p-2 rounded border border-border/30">
            ⚠️ <span className="font-bold text-danger">45-60 Category</span> displays peak vulnerability (~49.4% risk).
          </div>
        </div>

        {/* Widget 2: Product Count Churn Rate */}
        <div className="bg-bg-surface border border-border rounded-xl p-5 h-80 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-primary">
              CHURN BY PRODUCT ADOPTION
            </h4>
            <p className="text-[8px] font-mono text-text-muted mt-0.5">
              CORRELATION BETWEEN NUMBER OF HELD PRODUCTS AND CHURN
            </p>
          </div>

          <div className="flex-1 w-full text-[9px] font-mono mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productData}
                margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={formatPercent}
                  domain={[0, 1]}
                />
                <RechartsTooltip
                  formatter={(value: number) => [formatPercent(value), 'Churn Rate']}
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '9px'
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                />
                <Bar dataKey="rate" radius={[3, 3, 0, 0]}>
                  {productData.map((entry, index) => {
                    const fill = entry.rate > 0.8 
                      ? 'var(--danger)' 
                      : entry.rate > 0.2 
                        ? 'var(--warning)' 
                        : 'var(--success)';
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={fill} 
                        fillOpacity={0.8}
                        stroke={fill}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[8px] font-mono text-text-secondary bg-bg-primary/50 p-2 rounded border border-border/30">
            ⚠️ <span className="font-bold text-danger">3+ Product accounts</span> churn at a catastrophic rate (&gt;82%).
          </div>
        </div>

        {/* Widget 3: Active vs Inactive Churn Rate */}
        <div className="bg-bg-surface border border-border rounded-xl p-5 h-80 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-primary">
              CUSTOMER ENGAGEMENT MATRIX
            </h4>
            <p className="text-[8px] font-mono text-text-muted mt-0.5">
              CHURN PROFILES OF ACTIVE VS INACTIVE MEMBERS
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4">
            {activityData.map((item, idx) => {
              const ratePercent = (item.rate * 100).toFixed(1);
              const isHigh = item.rate > 0.2;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                    <span className="text-text-primary flex items-center gap-1.5">
                      {idx === 0 ? (
                        <Shield className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-danger" />
                      )}
                      {item.name}
                    </span>
                    <span className={isHigh ? 'text-danger' : 'text-success'}>
                      {ratePercent} Churn
                    </span>
                  </div>
                  <div className="w-full bg-bg-elevated h-3 rounded border border-border/60 overflow-hidden relative">
                    <div 
                      className="h-full transition-all duration-500" 
                      style={{ 
                        width: `${item.rate * 100}%`,
                        backgroundColor: isHigh ? 'var(--danger)' : 'var(--success)',
                        opacity: 0.85
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 text-[8px] font-mono text-text-secondary bg-bg-primary/50 p-2 rounded border border-border/30">
            💡 <span className="font-bold text-accent">Inactive members</span> are nearly twice as likely to churn (26.9%).
          </div>
        </div>
      </div>
    </div>
  );
};
