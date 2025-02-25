import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  let baseClasses = "px-4 py-2 font-semibold ";
  if (variant === 'primary') {
    baseClasses += "bg-[#00B2A9] text-white ";
  } else {
    baseClasses += "bg-[#7B5EA7] text-white ";
  }
  return (
    <button
      {...props}
      className={`${baseClasses}rounded-xl border border-white/10 shadow-glass backdrop-blur-sm ${className}`}
    >
      {props.children}
    </button>
  );
};

export default Button;
