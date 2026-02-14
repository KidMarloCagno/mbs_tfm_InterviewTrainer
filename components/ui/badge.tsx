import type React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'default',
  ...props 
}) => {
  const variants = {
    default: 'border-transparent bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
    secondary: 'border-transparent bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700',
    destructive: 'border-transparent bg-red-500 text-slate-50 hover:bg-red-600 dark:hover:bg-red-600',
    outline: 'text-slate-950 dark:text-slate-50',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-300 ${variants[variant]} ${className || ''}`}
      {...props}
    />
  );
};
