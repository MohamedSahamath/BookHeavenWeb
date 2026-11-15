import { useState } from 'react';
import toast from 'react-hot-toast';
import { FileDown } from 'lucide-react';
import managerService from '../../services/managerService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const ReportCard = ({ title, description, onDownload }: { title: string; description: string; onDownload: () => Promise<void> }) => {
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try {
      await onDownload();
      toast.success('Report downloaded');
    } catch {
      toast.error('Could not generate the report');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-500">{description}</p>
      <Button className="mt-4" variant="secondary" loading={loading} onClick={run}><FileDown size={16} /> Download PDF</Button>
    </div>
  );
};

export const PeriodPicker = ({ year, month, onYear, onMonth }: { year: number; month: number; onYear: (y: number) => void; onMonth: (m: number) => void }) => (
  <div className="mb-6 flex flex-wrap gap-2">
    <select value={month} onChange={(e) => onMonth(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
      {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
    </select>
    <select value={year} onChange={(e) => onYear(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
      {[0, 1, 2, 3].map((n) => {
        const y = new Date().getFullYear() - n;
        return <option key={y} value={y}>{y}</option>;
      })}
    </select>
  </div>
);

const ManagerReports = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  return (
    <div>
      <PageHeader title="Reports" description="Download operational reports as PDF" />
      <PeriodPicker year={year} month={month} onYear={setYear} onMonth={setMonth} />
      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard title="Inventory report" description="Current stock, warning levels and stock status for every book." onDownload={() => managerService.downloadReport('inventory', {}, 'inventory-report.pdf')} />
        <ReportCard title="Supplier deliveries" description="Supplier orders for the selected month with ordered vs received quantities." onDownload={() => managerService.downloadReport('supplier-deliveries', { year, month }, `supplier-deliveries-${year}-${month}.pdf`)} />
        <ReportCard title="Order summary" description="All orders created in the selected month with their status and district." onDownload={() => managerService.downloadReport('orders', { year, month }, `order-summary-${year}-${month}.pdf`)} />
      </div>
    </div>
  );
};

export default ManagerReports;