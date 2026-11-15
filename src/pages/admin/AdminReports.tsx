import { useState } from 'react';
import adminService from '../../services/adminService';
import PageHeader from '../../components/common/PageHeader';
import { PeriodPicker, ReportCard } from '../manager/ManagerReports';

const AdminReports = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  return (
    <div>
      <PageHeader title="Reports" description="Download business reports as PDF" />
      <PeriodPicker year={year} month={month} onYear={setYear} onMonth={setMonth} />

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Financial (Admin only)</h2>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <ReportCard title="Monthly sales" description="Every paid order in the selected month with totals." onDownload={() => adminService.downloadReport('sales', { year, month }, `sales-${year}-${month}.pdf`)} />
        <ReportCard title="Monthly expenses" description="All expenses including automatic supplier payments." onDownload={() => adminService.downloadReport('expenses', { year, month }, `expenses-${year}-${month}.pdf`)} />
        <ReportCard title="Profit report" description="Revenue, expenses and profit for each month of the selected year." onDownload={() => adminService.downloadReport('profit', { year }, `profit-${year}.pdf`)} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Operations</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard title="Inventory" description="Current stock for every book." onDownload={() => adminService.downloadReport('inventory', {}, 'inventory-report.pdf')} />
        <ReportCard title="Supplier deliveries" description="Supplier orders in the selected month." onDownload={() => adminService.downloadReport('supplier-deliveries', { year, month }, `supplier-deliveries-${year}-${month}.pdf`)} />
        <ReportCard title="Order summary" description="Orders created in the selected month." onDownload={() => adminService.downloadReport('orders', { year, month }, `order-summary-${year}-${month}.pdf`)} />
      </div>
    </div>
  );
};

export default AdminReports;