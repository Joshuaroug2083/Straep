import React from 'react';

export const Logo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Icon with glowing double-circle styling */}
      <div className="relative flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-400 rotate-12 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/20 transform transition-transform hover:rotate-45 duration-300">
          S
        </div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-300 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 -z-10 animate-pulse"></div>
      </div>
      
      <span className={`${sizeClasses[size]} font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-outfit`}>
        straep<span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">.</span>
      </span>
    </div>
  );
};
