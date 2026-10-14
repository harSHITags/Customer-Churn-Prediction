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

interface RiskDistributionProps {
  data?: { name: string; value: number }[];
}

const defaultData = [
  { name: 'Low Risk', value: 7186 },
  { name: 'Medium Risk', value: 1181 },
  { name: 'High Risk', value: 1633 }
];

const COLORS = ['var(--success)', 'var(--warning)', 'var(--danger)'];

export const RiskDistribution: React.FC<RiskDistributionProps> = ({ data = defaultData }) => {
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-5 h-80 flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
          RISK TIER BREAKDOWN
        </h3>
        <p className="text-[9px] font-mono text-text-muted mt-0.5">
          TOTAL CUSTOMER PROFILE DISTRIBUTION BY MODEL RISK CLASSIFICATION
        </p>
      </div>

      <div className="flex-1 w-full text-xs font-mono mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis 
              dataKey="name" 
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
              cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              name="Customer Count"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  fillOpacity={0.85}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
