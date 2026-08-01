import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  label?: string;
  placeholder?: string;
  error?: string;
  containerClassName?: string; // Better naming
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      value,
      onChange,
      options,
      label,
      placeholder = 'Select an option',
      error,
      disabled = false,
      className = '',
      containerClassName = '', // Separate container classes
      ...rest
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.persist(); // For async operations
      onChange?.(e); // Safe call
    };

    return (
      <div className={`flex flex-col space-y-1.5 ${containerClassName}`}>
        {label && (
          <label className="text-sm font-semibold text-slate-700">
            {label}
            {rest.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          value={value}
          onChange={handleChange} // Use our handler
          disabled={disabled}
          className={`
            border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800
            focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            transition-all duration-300 bg-white
            ${error ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' : ''}
            ${className}
          `}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';