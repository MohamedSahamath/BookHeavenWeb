import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye } from 'lucide-react';
import orderService from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { Order, OrderDetails, Pagination as PaginationInfo, User } from '../../types';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatDate, formatDateTime, formatPrice, formatStatus } from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import DataTable, { Column } from '../../components/dashboard/DataTable';
import { Input } from '../../components/common/Input';

const customerName = (o: Order) => (typeof o.customer === 'string' ? '-' : (o.customer as Pick<User, 'fullName'>).fullName);

const OrdersManage = () => {
  const [params] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [delayed, setDelayed] = useState(params.get('delayed') === 'true');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const debounced = useDebounce(search);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<OrderDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [courier, setCourier] = useState({ courierName: '', trackingNumber: '', note: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    orderService
      .getAllOrders({ page, status: status || undefined, delayed: delayed ? 'true' : undefined, search: debounced || undefined, from: from || undefined, to: to || undefined })
      .then((res) => {
        setOrders(res.items);
        setPagination(res.pagination);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, status, delayed, debounced, from, to]);

  const openDetails = async (id: string) => {
    setDetailsLoading(true);
    setDetails({} as OrderDetails);
    try {
      const data = await orderService.getOrder(id);
      setDetails(data);
      setCourier({ courierName: data.delivery?.courierName || '', trackingNumber: data.delivery?.trackingNumber || '', note: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshDetails = async () => {
    if (details?.order) await openDetails(details.order._id);
    load();
  };

  const changeStatus = async (newStatus: 'PROCESSING' | 'CANCELLED') => {
    if (!details?.order) return;
    if (newStatus === 'CANCELLED' && !window.confirm('Cancel this order? Paid orders will be restocked and marked for refund.')) return;
    setSaving(true);
    try {
      await orderService.updateOrderStatus(details.order._id, newStatus, courier.note || undefined);
      toast.success(`Order ${formatStatus(newStatus)}`);
      await refreshDetails();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const updateDelivery = async (newStatus: 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED') => {
    if (!details?.order) return;
    setSaving(true);
    try {
      toast.success(await orderService.updateDelivery(details.order._id, { status: newStatus, courierName: courier.courierName || undefined, trackingNumber: courier.trackingNumber || undefined, notes: courier.note || undefined }));
      await refreshDetails();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Order>[] = [
    { header: 'Order', render: (o) => <div><p className="font-medium text-slate-900">{o.orderNumber}</p><p className="text-xs text-slate-500">{formatDateTime(o.createdAt)}</p></div> },
    { header: 'Customer', render: (o) => customerName(o) },
    { header: 'Items', render: (o) => o.items.reduce((s, i) => s + i.quantity, 0) },
    { header: 'Total', render: (o) => formatPrice(o.totalAmount) },
    { header: 'Payment', render: (o) => <StatusBadge status={o.paymentStatus} /> },
    { header: 'Status', render: (o) => <div className="flex flex-col gap-1"><StatusBadge status={o.status} />{o.isDelayed && <StatusBadge status="DELAYED" />}</div> },
    { header: 'Expected', render: (o) => formatDate(o.expectedDeliveryDate) },
    { header: '', render: (o) => <Button size="sm" variant="secondary" onClick={() => openDetails(o._id)}><Eye size={14} /> View</Button> },
  ];

  const order = details?.order;

  return (
    <div>
      <PageHeader title="Customer orders" description="Process, dispatch and track every order" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Order no, invoice or customer" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-64" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" disabled={delayed}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" aria-label="From date" />
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" aria-label="To date" />
        <label className="flex items-center gap-2 text-sm text-red-700">
          <input type="checkbox" checked={delayed} onChange={(e) => { setDelayed(e.target.checked); setPage(1); }} /> Only delayed (past 5 days)
        </label>
      </div>
      <DataTable columns={columns} rows={orders} loading={loading} rowKey={(o) => o._id} emptyTitle="No orders found" />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal open={!!details} title={order ? `Order ${order.orderNumber}` : 'Order'} onClose={() => setDetails(null)} size="xl">
        {detailsLoading || !order ? (
          <Loader />
        ) : (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={order.status} />
              <StatusBadge status={order.paymentStatus} />
              {order.isDelayed && <StatusBadge status="DELAYED" />}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="mb-1 font-semibold">Customer & delivery address</p>
                <p>{order.shippingAddress.recipientName} · {order.shippingAddress.phone}</p>
                <p className="text-slate-600">{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
                <p className="text-slate-600">{order.shippingAddress.city}, {order.shippingAddress.district} {order.shippingAddress.postalCode}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="mb-1 font-semibold">Payment</p>
                <p>Card {details?.payment?.cardBrand ? `${details.payment.cardBrand.toUpperCase()} •••• ${details.payment.cardLast4}` : ''}</p>
                <p className="break-all text-xs text-slate-500">Ref: {details?.payment?.transactionId || '-'}</p>
                <p>Invoice: {order.invoiceNumber || '-'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="mb-1 font-semibold">Delivery</p>
                <p>Confirmed: {formatDate(order.confirmedAt)}</p>
                <p className={order.isDelayed ? 'font-semibold text-red-600' : ''}>Expected: {formatDate(order.expectedDeliveryDate)}</p>
                <p>Dispatched: {formatDate(details?.delivery?.dispatchDate)}</p>
                <p>Delivered: {formatDate(details?.delivery?.deliveredDate)}</p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="text-xs uppercase text-slate-500"><tr><th className="py-1">Book</th><th>Qty</th><th>Price</th><th className="text-right">Total</th></tr></thead>
              <tbody className="divide-y">
                {order.items.map((i) => (
                  <tr key={i.book}><td className="py-2">{i.title}<p className="text-xs text-slate-500">{i.authorNames.join(', ')}</p></td><td>{i.quantity}</td><td>{formatPrice(i.unitPrice)}</td><td className="text-right">{formatPrice(i.lineTotal)}</td></tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={3} className="pt-2 text-right">Delivery</td><td className="pt-2 text-right">{formatPrice(order.deliveryCharge)}</td></tr>
                <tr className="font-bold"><td colSpan={3} className="text-right">Total</td><td className="text-right">{formatPrice(order.totalAmount)}</td></tr>
              </tfoot>
            </table>

            {/* Actions */}
            {!['DELIVERED', 'CANCELLED', 'PAYMENT_PENDING'].includes(order.status) && (
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="mb-3 font-semibold">Update order / delivery</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input label="Courier name" name="courierName" value={courier.courierName} onChange={(e) => setCourier({ ...courier, courierName: e.target.value })} placeholder="e.g. Pronto Lanka" />
                  <Input label="Tracking number" name="trackingNumber" value={courier.trackingNumber} onChange={(e) => setCourier({ ...courier, trackingNumber: e.target.value })} />
                  <Input label="Note (optional)" name="note" value={courier.note} onChange={(e) => setCourier({ ...courier, note: e.target.value })} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.status === 'CONFIRMED' && <Button loading={saving} onClick={() => changeStatus('PROCESSING')}>Mark processing</Button>}
                  {order.status === 'PROCESSING' && <Button loading={saving} onClick={() => updateDelivery('DISPATCHED')}>Dispatch</Button>}
                  {order.status === 'DISPATCHED' && <Button loading={saving} onClick={() => updateDelivery('OUT_FOR_DELIVERY')}>Out for delivery</Button>}
                  {(order.status === 'DISPATCHED' || order.status === 'OUT_FOR_DELIVERY') && <Button variant="success" loading={saving} onClick={() => updateDelivery('DELIVERED')}>Mark delivered</Button>}
                  {(order.status === 'CONFIRMED' || order.status === 'PROCESSING') && <Button variant="danger" loading={saving} onClick={() => changeStatus('CANCELLED')}>Cancel order</Button>}
                </div>
              </div>
            )}

            <div>
              <p className="mb-1 font-semibold">Status history</p>
              <ul className="space-y-1 text-xs text-slate-600">
                {order.statusHistory.map((h, i) => <li key={i}>{formatDateTime(h.changedAt)} — {formatStatus(h.status)}{h.note ? ` (${h.note})` : ''}</li>)}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersManage;