import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((
  { label, error, hint, leftIcon, className, ...props },
  ref
) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
    <div className="relative">
      {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</span>}
      <input
        ref={ref}
        className={`w-full ${leftIcon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          error
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white'
        } ${className ?? ''}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
));
Input.displayName = 'Input';
