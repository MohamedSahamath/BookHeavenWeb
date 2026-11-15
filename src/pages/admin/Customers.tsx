import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { Pagination as PaginationInfo, User } from '../../types';
import { formatDate, formatDateTime } from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DataTable, { Column } from '../../components/dashboard/DataTable';

const Customers = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debounced = useDebounce(search);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<User | null>(null);

  const load = () => {
    setLoading(true);
    adminService
      .getCustomers({ page, search: debounced || undefined, status: status || undefined })
      .then((res) => {
        setCustomers(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, debounced, status]);

  const toggle = async () => {
    if (!toggling) return;
    try {
      toast.success(await adminService.setCustomerStatus(toggling._id, !toggling.isActive));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(null);
    }
  };

  const columns: Column<User>[] = [
    { header: 'Name', render: (c) => <span className="font-medium text-slate-900">{c.fullName}</span> },
    { header: 'Email', render: (c) => c.email },
    { header: 'Mobile', render: (c) => c.phone },
    { header: 'Paid orders', render: (c) => c.orderCount || 0 },
    { header: 'Registered', render: (c) => formatDate(c.createdAt) },
    { header: 'Last login', render: (c) => formatDateTime(c.lastLogin) },
    { header: 'Status', render: (c) => <StatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    { header: '', render: (c) => <Button size="sm" variant={c.isActive ? 'secondary' : 'success'} onClick={() => setToggling(c)}>{c.isActive ? 'Deactivate' : 'Activate'}</Button> },
  ];

  return (
    <div>
      <PageHeader title="Customers" description="All registered customer accounts" />
      <div className="mb-4 flex flex-wrap gap-2">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email, mobile" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-72" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <DataTable columns={columns} rows={customers} loading={loading} rowKey={(c) => c._id} emptyTitle="No customers" />
      <Pagination pagination={pagination} onPageChange={setPage} />
      <ConfirmDialog
        open={!!toggling}
        title={toggling?.isActive ? 'Deactivate customer?' : 'Activate customer?'}
        message={toggling?.isActive ? 'The customer will be logged out and cannot log in.' : 'The customer can log in again.'}
        confirmText={toggling?.isActive ? 'Deactivate' : 'Activate'}
        danger={!!toggling?.isActive}
        onConfirm={toggle}
        onCancel={() => setToggling(null)}
      />
    </div>
  );
};

export default Customers;