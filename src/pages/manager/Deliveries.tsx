import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BellRing } from 'lucide-react';
import orderService from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { Delivery, Pagination as PaginationInfo } from '../../types';
import { SRI_LANKA_DISTRICTS } from '../../utils/constants';
import { formatDate, formatStatus } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { Column } from '../../components/dashboard/DataTable';

const Deliveries = () => {
  const [params] = useSearchParams();
  const [rows, setRows] = useState<Delivery[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [district, setDistrict] = useState('');
  const [delayed, setDelayed] = useState(params.get('delayed') === 'true');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const load = () => {
    setLoading(true);
    orderService
      .getDeliveries({ page, status: status || undefined, district: district || undefined, delayed: delayed ? 'true' : undefined })
      .then((res) => {
        setRows(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, status, district, delayed]);

  const runCheck = async () => {
    setChecking(true);
    try {
      toast.success(await orderService.runDelayCheck());
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  const columns: Column<Delivery>[] = [
    { header: 'Order', render: (d) => (typeof d.order === 'string' ? d.order : d.order.orderNumber) },
    { header: 'Customer', render: (d) => <div><p>{d.customerName}</p><p className="text-xs text-slate-500">{d.contactNumber}</p></div> },
    { header: 'Address', render: (d) => <span className="text-xs">{d.address}, {d.city}, {d.district} {d.postalCode}</span> },
    { header: 'Expected', render: (d) => <span className={d.isDelayed ? 'font-semibold text-red-600' : ''}>{formatDate(d.expectedDeliveryDate)}</span> },
    { header: 'Courier', render: (d) => <div className="text-xs"><p>{d.courierName || '-'}</p><p className="text-slate-500">{d.trackingNumber}</p></div> },
    { header: 'Dispatched', render: (d) => formatDate(d.dispatchDate) },
    { header: 'Delivered', render: (d) => formatDate(d.deliveredDate) },
    { header: 'Status', render: (d) => <div className="flex flex-col gap-1"><StatusBadge status={d.status} />{d.isDelayed && <StatusBadge status="DELAYED" />}</div> },
  ];

   return (
    <div>
      <PageHeader
        title="Nationwide deliveries"
        description="Every confirmed order must be delivered within 5 calendar days. Update statuses from the Orders page."
        actions={
          <Button variant="secondary" loading={checking} onClick={runCheck}>
            <BellRing size={16} /> Check delays now
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          disabled={delayed}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {['PENDING', 'PROCESSING', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{formatStatus(s)}</option>
          ))}
        </select>
        <select
          value={district}
          onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All districts</option>
          {SRI_LANKA_DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-red-700">
          <input
            type="checkbox"
            checked={delayed}
            onChange={(e) => { setDelayed(e.target.checked); setPage(1); }}
          />
          Only delayed
        </label>
      </div>
      <DataTable columns={columns} rows={rows} loading={loading} rowKey={(d) => d._id} emptyTitle="No deliveries" />
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default Deliveries;