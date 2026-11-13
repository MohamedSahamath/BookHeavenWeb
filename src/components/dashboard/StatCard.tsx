import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
  hint?: string;
}

const colors = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  slate: 'bg-slate-200 text-slate-700',
};

const StatCard = ({ label, value, icon: Icon, color = 'blue', hint }: StatCardProps) => (
  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
    <div className={`rounded-lg p-3 ${colors[color]}`}>
      <Icon size={22} />
    </div>
    <div className="min-w-0">
      <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="truncate text-xl font-bold text-slate-900">{value}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  </div>
);

export default StatCard;