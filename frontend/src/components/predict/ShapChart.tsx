import React from 'react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  ReferenceLine, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import type { ShapFeature } from '../../types';

interface ShapChartProps {
  data: ShapFeature[];
}

export const ShapChart: React.FC<ShapChartProps> = ({ data }) => {
  // Format the features for better visual presentation
  const formattedData = data.map(item => ({
    feature: item.feature,
    value: item.shap_value,
    direction: item.direction
  }));

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-6 flex flex-col justify-between">
      <div className="border-b border-border pb-3 flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            SHAP FORCE EXPLANATION (LOCAL INFLUENCE)
          </h3>
          <p className="text-[9px] font-mono text-text-muted mt-0.5">
            IMPACT OF LOCAL FEATURE ATTRIBUTIONS ON CHURN DECISION BOUNDARY
          </p>
        </div>
        <div className="flex gap-4 text-[9px] font-mono">
          <div className="flex items-center gap-1.5 text-danger bg-danger/5 border border-danger/10 px-2 py-0.5 rounded">
            <span>+ CHURN RISK</span>
          </div>
          <div className="flex items-center gap-1.5 text-success bg-success/5 border border-success/10 px-2 py-0.5 rounded">
            <span>- CHURN RISK</span>
          </div>
        </div>
      </div>

      {formattedData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-lg text-center">
          <span className="text-[10px] font-mono text-text-muted uppercase">No attribution data available</span>
        </div>
      ) : (
        <div className="h-64 w-full text-[10px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} horizontal={false} />
              <XAxis 
                type="number" 
                stroke="var(--text-muted)" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="feature" 
                stroke="var(--text-primary)" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <ReferenceLine x={0} stroke="var(--border)" strokeWidth={1.5} />
              <Bar 
                dataKey="value"
                radius={2}
                name="SHAP Attribution Value"
              >
                {formattedData.map((entry, index) => {
                  const isPositive = entry.value > 0;
                  const barColor = isPositive ? 'var(--danger)' : 'var(--success)';
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={barColor} 
                      fillOpacity={0.8}
                      stroke={barColor}
                      strokeWidth={1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
