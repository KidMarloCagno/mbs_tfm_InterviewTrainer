import type React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'default', size = 'default', ...props }) => {
  const variantClass =
    variant === 'destructive'
      ? 'ui-button-destructive'
      : variant === 'outline'
        ? 'ui-button-outline'
        : variant === 'secondary' || variant === 'ghost' || variant === 'link'
          ? 'ui-button-secondary'
          : 'ui-button-default';

  const sizeClass = size === 'lg' ? 'ui-button-lg' : '';

  return <button className={`ui-button ${variantClass} ${sizeClass} ${className ?? ''}`.trim()} {...props} />;
};
