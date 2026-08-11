import React from 'react';

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 bg-[#0B132B] cursor-pointer appearance-none ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0F172A] text-slate-100 py-1">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
};
