import type React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress: React.FC<ProgressProps> = ({ 
  className, 
  value = 0, 
  ...props 
}) => (
  <div
    className={`relative h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${className || ''}`}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-slate-900 transition-all dark:bg-slate-50"
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);
