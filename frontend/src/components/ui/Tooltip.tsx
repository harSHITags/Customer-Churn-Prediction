import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2 text-[10px] leading-relaxed font-mono bg-bg-elevated border border-border text-text-secondary rounded shadow-2xl pointer-events-none text-center">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-border" />
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-0.5 border-x-[3px] border-x-transparent border-t-[3px] border-t-bg-elevated" />
        </div>
      )}
    </div>
  );
};
