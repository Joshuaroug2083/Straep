import React, { forwardRef } from 'react';

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, helperText, startIcon, endIcon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-400 font-outfit uppercase tracking-wider pl-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative flex items-center w-full">
          {startIcon && (
            <div className="absolute left-4 text-slate-500 flex items-center justify-center pointer-events-none">
              {startIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full bg-slate-900/40 hover:bg-slate-900/60 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500
              focus:outline-none focus:bg-slate-900/80 focus:border-primary-500 transition-all duration-300 font-jakarta
              ${startIcon ? 'pl-11' : ''}
              ${endIcon ? 'pr-11' : ''}
              ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800/80 focus:ring-1 focus:ring-primary-500/20'}
            `}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute right-4 text-slate-500 flex items-center justify-center">
              {endIcon}
            </div>
          )}
        </div>

        {error ? (
          <span className="text-xs font-medium text-red-400 pl-1 font-jakarta">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-500 pl-1 font-jakarta">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

PremiumInput.displayName = 'PremiumInput';
