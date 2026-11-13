import { ReactNode } from 'react';

const ChartCard = ({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {action}
    </div>
    <div className="h-72">{children}</div>
  </div>
);

export default ChartCard;