import React from 'react';
import { motion } from 'framer-motion';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glow?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  glow = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 font-outfit overflow-hidden focus:outline-none select-none cursor-pointer';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white border border-primary-400/20 active:scale-98 shadow-lg shadow-primary-500/10 hover:shadow-primary-500/25',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 active:scale-98',
    accent: 'bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white border border-accent-400/20 active:scale-98 shadow-lg shadow-accent-500/10 hover:shadow-accent-500/25',
    glass: 'glass hover:bg-slate-800/40 text-slate-100 border border-white/10 active:scale-98 shadow-inner shadow-white/5',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white border border-red-500/20 active:scale-98 shadow-lg shadow-red-500/10',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  const isBtnDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={isBtnDisabled ? {} : { y: -1 }}
      whileTap={isBtnDisabled ? {} : { scale: 0.98 }}
      disabled={isBtnDisabled}
      className={`
        ${baseStyle} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${isBtnDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} 
        ${className}
      `}
      {...(props as any)}
    >
      {/* Background glow shadow */}
      {glow && !isBtnDisabled && (
        <div className={`absolute -inset-0.5 rounded-xl blur opacity-30 hover:opacity-50 transition duration-300 -z-10 bg-gradient-to-r ${variant === 'accent' ? 'from-accent-500 to-cyan-500' : 'from-primary-500 to-accent-500'}`} />
      )}
      
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};
