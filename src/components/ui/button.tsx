import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'px-4 py-2 font-medium rounded-lg shadow-md transition-transform transform hover:scale-105';
  const glassClasses = 'bg-white/20 backdrop-blur-lg border border-white/30';
  const variantClasses =
    variant === 'primary'
      ? 'text-white hover:bg-white/30'
      : 'text-gray-200 hover:bg-gray-700/30';

  return (
    <button
      className={`${baseClasses} ${glassClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
