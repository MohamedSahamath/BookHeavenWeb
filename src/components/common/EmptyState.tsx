// Shown when a list has no data.
import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

const EmptyState = ({ title, message, action, icon }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
    <div className="mb-3 text-slate-400">{icon || <Inbox size={40} />}</div>
    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
    {message && <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;