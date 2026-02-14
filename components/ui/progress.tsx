import type React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress: React.FC<ProgressProps> = ({ className, value = 0, ...props }) => (
  <div className={`ui-progress ${className ?? ''}`.trim()} {...props}>
    <div className="ui-progress-bar" style={{ width: `${Math.min(value, 100)}%` }} />
  </div>
);
