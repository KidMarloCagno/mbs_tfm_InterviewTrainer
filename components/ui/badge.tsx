import type React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ className, ...props }) => (
  <div className={`ui-badge ${className ?? ''}`.trim()} {...props} />
);
