import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-slate-400 pointer-events-none">{icon}</div>}
        <input
          id={inputId}
          className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500 ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-rose-500/80 focus:border-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-400 font-medium mt-0.5">{error}</span>}
    </div>
  );
};
