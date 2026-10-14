import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ChurnRateChartProps {
  data?: { bin: string; count: number }[];
}

const defaultData = [
  { bin: '0-10%', count: 4500 },
  { bin: '10-20%', count: 2000 },
  { bin: '20-30%', count: 1100 },
  { bin: '30-40%', count: 800 },
  { bin: '40-50%', count: 500 },
  { bin: '50-60%', count: 300 },
  { bin: '60-70%', count: 250 },
  { bin: '70-80%', count: 200 },
  { bin: '80-90%', count: 180 },
  { bin: '90-100%', count: 170 }
];

export const ChurnRateChart: React.FC<ChurnRateChartProps> = ({ data = defaultData }) => {
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-5 h-80 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            CHURN PROBABILITY DISTRIBUTION (HISTOGRAM)
          </h3>
          <p className="text-[9px] font-mono text-text-muted mt-0.5">
            FREQUENCY OF CUSTOMERS BY RISK PROBABILITY BINS
          </p>
        </div>
        <div className="flex gap-4 text-[9px] font-mono text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span>LOW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span>MEDIUM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-danger" />
            <span>HIGH</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full text-xs font-mono">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--success)" stopOpacity={0.4} />
                <stop offset="35%" stopColor="var(--success)" stopOpacity={0.3} />
                <stop offset="65%" stopColor="var(--warning)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--danger)" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="strokeRisk" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--success)" />
                <stop offset="35%" stopColor="var(--success)" />
                <stop offset="65%" stopColor="var(--warning)" />
                <stop offset="100%" stopColor="var(--danger)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis 
              dataKey="bin" 
              stroke="var(--text-muted)" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '10px'
              }}
              labelStyle={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="url(#strokeRisk)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRisk)"
              name="Customer Count"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
