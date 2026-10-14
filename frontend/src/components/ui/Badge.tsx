import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'muted';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'info', 
  children, 
  className = '' 
}) => {
  const baseStyle = "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold tracking-wider uppercase border";
  
  const variantStyles = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-accent/10 text-accent border-accent/20",
    muted: "bg-bg-elevated text-text-secondary border-border"
  };

  return (
    <span className={`${baseStyle} ${variantStyles[variant]} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse inline-block" />
      {children}
    </span>
  );
};
