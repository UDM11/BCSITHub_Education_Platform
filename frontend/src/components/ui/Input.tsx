import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      type = 'text',
      placeholder,
      error,
      icon: Icon,
      disabled = false,
      required = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label className="block text-sm font-semibold text-slate-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`
              block w-full rounded-xl border border-slate-200 shadow-sm 
              focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
              disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
              ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5
              transition-all duration-300 text-slate-800 placeholder:text-slate-400 text-sm
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}
            `}
            {...rest}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
