import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import orderService from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { Order, Pagination as PaginationInfo } from '../../types';
import { formatDate, formatPrice, formatStatus } from '../../utils/format';
import { ORDER_STATUSES } from '../../utils/constants';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    orderService
      .getMyOrders({ page, status: status || undefined })
      .then((res) => {
        setOrders(res.items);
        setPagination(res.pagination);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, status]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My orders</h1>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <EmptyState title="Could not load orders" message={error} />
      ) : orders.length === 0 ? (
        <EmptyState icon={<Package size={40} />} title="No orders yet" action={<Link to="/books" className="text-blue-800">Start shopping</Link>} />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o._id} to={`/orders/${o._id}`} className="block rounded-xl border border-slate-200 bg-white p-4 hover:shadow">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{o.orderNumber}</p>
                  <p className="text-xs text-slate-500">Placed {formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} book(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  {o.isDelayed && <StatusBadge status="DELAYED" />}
                  <StatusBadge status={o.status} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-slate-600">{o.items.map((i) => i.title).join(', ').slice(0, 80)}</span>
                <span className="font-semibold">{formatPrice(o.totalAmount)}</span>
              </div>
              {o.expectedDeliveryDate && o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                <p className="mt-2 text-xs text-blue-800">Expected delivery: {formatDate(o.expectedDeliveryDate)}</p>
              )}
            </Link>
          ))}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default MyOrders;