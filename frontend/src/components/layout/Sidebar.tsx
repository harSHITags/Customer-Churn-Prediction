import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  UploadCloud, 
  Cpu, 
  TrendingUp 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Single Predict', path: '/predict', icon: UserCheck },
    { name: 'Batch Upload', path: '/batch', icon: UploadCloud },
    { name: 'Model Health', path: '/model', icon: Cpu }
  ];

  return (
    <div className="w-64 h-screen bg-bg-surface border-r border-border flex flex-col select-none">
      {/* Brand logo header */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <TrendingUp className="text-accent animate-pulse w-6 h-6" />
        <span className="font-syne font-extrabold text-lg tracking-wider bg-gradient-to-r from-text-primary to-accent bg-clip-text text-transparent">
          CHURN.INTEL
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono tracking-wide transition-all duration-200 ${
                isActive
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer system details */}
      <div className="p-4 border-t border-border bg-bg-primary/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-success animate-ping" />
          <span className="text-[10px] font-mono text-success uppercase font-semibold">
            API Node Active
          </span>
        </div>
        <div className="text-[9px] font-mono text-text-muted">
          VERSION: 1.0.0 (STABLE)
        </div>
      </div>
    </div>
  );
};
