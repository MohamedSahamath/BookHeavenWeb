// Reusable form controls: Input, Select and TextArea, each with a label and error message.
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

const baseClass =
  'w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
}

const FieldWrapper = ({ label, error, hint, id, children }: FieldProps & { id?: string; children: ReactNode }) => (
  <div className="space-y-1">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
    )}
    {children}
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export const Input = ({ label, error, hint, id, name, className = '', ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) => (
  <FieldWrapper label={label} error={error} hint={hint} id={id || name}>
    <input
      id={id || name}
      name={name}
      className={`${baseClass} ${error ? 'border-red-400' : 'border-slate-300'} ${className}`}
      {...rest}
    />
  </FieldWrapper>
);

export const Select = ({
  label,
  error,
  hint,
  id,
  name,
  children,
  className = '',
  ...rest
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) => (
  <FieldWrapper label={label} error={error} hint={hint} id={id || name}>
    <select
      id={id || name}
      name={name}
      className={`${baseClass} bg-white ${error ? 'border-red-400' : 'border-slate-300'} ${className}`}
      {...rest}
    >
      {children}
    </select>
  </FieldWrapper>
);

export const TextArea = ({ label, error, hint, id, name, className = '', ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <FieldWrapper label={label} error={error} hint={hint} id={id || name}>
    <textarea
      id={id || name}
      name={name}
      rows={4}
      className={`${baseClass} ${error ? 'border-red-400' : 'border-slate-300'} ${className}`}
      {...rest}
    />
  </FieldWrapper>
);

export default Input;