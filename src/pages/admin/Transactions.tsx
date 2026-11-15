
import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { Order, Pagination as PaginationInfo, Payment, User } from '../../types';
import { formatDateTime, formatPrice, formatStatus } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { Column } from '../../components/dashboard/DataTable';

const Transactions = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService
      .getTransactions({ page, status: status || undefined })
      .then((res) => {
        setPayments(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  const columns: Column<Payment>[] = [
    { header: 'Date', render: (p) => formatDateTime(p.paidAt || p.createdAt) },
    { header: 'Order', render: (p) => (typeof p.order === 'string' ? '-' : (p.order as Pick<Order, 'orderNumber'>).orderNumber) },
    { header: 'Customer', render: (p) => (typeof p.customer === 'string' ? '-' : (p.customer as Pick<User, 'fullName'>).fullName) },
    { header: 'Amount', render: (p) => <span className="font-semibold">{formatPrice(p.amount)}</span> },
    { header: 'Card', render: (p) => (p.cardBrand ? `${p.cardBrand.toUpperCase()} •••• ${p.cardLast4}` : '-') },
    { header: 'Transaction ref', render: (p) => <span className="break-all text-xs">{p.transactionId || p.sessionId.slice(0, 24) + '…'}</span> },
    { header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Transactions" description="Online card payments processed through Stripe (test mode)" />
      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="mb-4 rounded-lg border border-slate-300 px-3 py-2 text-sm">
        <option value="">All statuses</option>
        {['PENDING', 'SUCCESS', 'FAILED', 'REFUND_PENDING', 'REFUNDED'].map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
      </select>
      <DataTable columns={columns} rows={payments} loading={loading} rowKey={(p) => p._id} emptyTitle="No transactions" />
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default Transactions;