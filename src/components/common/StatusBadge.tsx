import { STATUS_COLORS } from '../../utils/constants';
import { formatStatus } from '../../utils/format';

const StatusBadge = ({ status, label }: { status: string; label?: string }) => (
  <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-700'}`}>
    {label || formatStatus(status)}
  </span>
);

export default StatusBadge;