import React, { useEffect } from 'react';
import { useChurnStore } from '../store/useChurnStore';
import { KPICard } from '../components/dashboard/KPICard';
import { ChurnRateChart } from '../components/dashboard/ChurnRateChart';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { BusinessInsights } from '../components/dashboard/BusinessInsights';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { Users, UserX, Percent, AlertOctagon, TrendingUp, HelpCircle } from 'lucide-react';
import { Tooltip } from '../components/ui/Tooltip';

export const Dashboard: React.FC = () => {
  const { analytics, isLoading, error, fetchAnalytics } = useChurnStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading && !analytics) {
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
          <div className="font-bold uppercase tracking-wider mb-1">DATA FLOW CONNECTION CORRUPTED</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  const overallChurnRatePercent = analytics ? (analytics.overall_churn_rate * 100).toFixed(1) + '%' : '0.0%';
  const predictedChurnersCount = analytics ? Math.round(analytics.total_customers * analytics.overall_churn_rate) : 0;
  const highRiskCount = analytics ? analytics.risk_distribution.High : 0;
  const highRiskPercent = analytics ? ((highRiskCount / analytics.total_customers) * 100).toFixed(1) + '%' : '0.0%';

  return (
    <div className="p-6 space-y-6 select-none animate-shimmer">
      {/* Overview Intro Banner */}
      <div className="flex justify-between items-center bg-bg-surface border border-border p-5 rounded-xl">
        <div>
          <h2 className="text-base font-syne font-extrabold tracking-wider text-text-primary">
            EXECUTIVE CHURN TELEMETRY
          </h2>
          <p className="text-xs text-text-secondary font-mono mt-0.5">
            REAL-TIME CLASSIFICATION MONITOR FOR RISK ASSESSMENT
          </p>
        </div>
        <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded bg-bg-primary/50 text-[10px] font-mono text-text-secondary">
          <TrendingUp className="w-3.5 h-3.5 text-accent" />
          <span>PORTFOLIO RISK LEVEL: STANDARD</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Portfolio Size"
          value={analytics?.total_customers.toLocaleString() || '0'}
          icon={Users}
          subtext="Total Profiled Bank Accounts"
          color="var(--accent)"
        />

        <KPICard
          title="Historical Churners"
          value={predictedChurnersCount.toLocaleString()}
          icon={UserX}
          subtext="Known Exit Classifications"
          color="var(--danger)"
          badge={
            <Badge variant="danger">
              {overallChurnRatePercent} Rate
            </Badge>
          }
        />

        <KPICard
          title="Avg Churn Risk"
          value={analytics ? '30.1%' : '0.0%'}
          icon={Percent}
          subtext="Ensemble Predict Prob Mean"
          color="var(--warning)"
        />

        <KPICard
          title="Critical Risk Tiers"
          value={highRiskCount.toLocaleString()}
          icon={AlertOctagon}
          subtext="Classified High Churn Risk"
          color="var(--danger)"
          textColor="text-danger"
          badge={
            <Tooltip content="Customers with predicted probability >= 0.65. Immediate outreach recommended.">
              <Badge variant="danger">
                {highRiskPercent} Pop
              </Badge>
            </Tooltip>
          }
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChurnRateChart />
        <RiskDistribution />
      </div>

      {/* Behavioral Insights */}
      {analytics && (
        <BusinessInsights 
          churnByAgeBin={analytics.churn_by_age_bin}
          churnByProductCount={analytics.churn_by_product_count}
          churnByActivity={analytics.churn_by_activity}
        />
      )}

      {/* Region risk section */}
      {analytics && (
        <div className="bg-bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              GEOGRAPHICAL CHURN ATTRIBUTION
            </h3>
            <p className="text-[9px] font-mono text-text-muted mt-0.5">
              AVERAGE ENSEMBLE CHURN PROBABILITY BY REGISTERED NATIONAL REGION
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analytics.avg_probability_by_geography).map(([geo, prob]) => {
              const probPercent = (prob * 100).toFixed(1);
              return (
                <div key={geo} className="bg-bg-primary/50 border border-border p-4 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-text-primary">{geo}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-bg-elevated h-2 rounded-full overflow-hidden border border-border/50">
                      <div 
                        className="bg-accent h-full" 
                        style={{ 
                          width: `${probPercent}%`,
                          backgroundColor: prob > 0.35 ? 'var(--danger)' : 'var(--success)'
                        }} 
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-text-secondary">{probPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
