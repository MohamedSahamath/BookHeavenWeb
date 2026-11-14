import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertTriangle, Check, Download, Truck } from 'lucide-react';
import orderService from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { OrderDetails as OrderDetailsData } from '../../types';
import { coverOrPlaceholder, formatDate, formatDateTime, formatPrice, formatStatus } from '../../utils/format';
import { ORDER_TIMELINE } from '../../utils/constants';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const OrderDetails = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<OrderDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = () => {
    orderService
      .getOrder(id)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const download = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      await orderService.downloadInvoice(data.order._id, data.order.invoiceNumber || data.order.orderNumber);
    } catch {
      toast.error('Could not download the invoice');
    } finally {
      setDownloading(false);
    }
  };

  const cancel = async () => {
    try {
      await orderService.cancelOrder(id);
      toast.success('Order cancelled');
      setConfirmCancel(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;
  if (error || !data) return <EmptyState title="Order not found" message={error} />;

  const { order, payment, delivery } = data;
  const currentStep = ORDER_TIMELINE.indexOf(order.status);
  const isPaid = order.paymentStatus === 'SUCCESS' || order.paymentStatus === 'REFUND_PENDING';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/orders" className="text-sm text-blue-800 hover:underline">← My orders</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-slate-500">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.invoiceNumber && isPaid && (
            <Button variant="secondary" loading={downloading} onClick={download}><Download size={16} /> Download invoice</Button>
          )}
          {order.status === 'PAYMENT_PENDING' && <Button variant="danger" onClick={() => setConfirmCancel(true)}>Cancel order</Button>}
          {isPaid && order.status !== 'PAYMENT_PENDING' && (
            <Button variant="ghost" onClick={() => navigate(`/complaints?orderId=${order._id}`)}>Report a problem</Button>
          )}
        </div>
      </div>

      {order.isDelayed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="flex items-center gap-2"><AlertTriangle size={18} /> This order has passed its 5-day delivery date ({formatDate(order.expectedDeliveryDate)}).</span>
          <Button size="sm" variant="danger" onClick={() => navigate(`/complaints?orderId=${order._id}&type=DELIVERY_DELAY`)}>Submit delivery complaint</Button>
        </div>
      )}

      {/* Tracking timeline */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold"><Truck size={18} /> Delivery tracking</h2>
          <StatusBadge status={order.status} />
        </div>
        {order.status === 'CANCELLED' ? (
          <p className="text-sm text-red-700">This order was cancelled. {order.cancelReason}</p>
        ) : order.status === 'PAYMENT_PENDING' ? (
          <p className="text-sm text-amber-700">Waiting for payment. Stock is not reserved until payment succeeds.</p>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-5">
            {ORDER_TIMELINE.map((step, index) => {
              const done = index <= currentStep;
              const history = order.statusHistory.find((h) => h.status === step);
              return (
                <li key={step} className="flex items-start gap-2 sm:flex-col sm:items-center sm:text-center">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {done ? <Check size={16} /> : index + 1}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${done ? 'text-slate-900' : 'text-slate-400'}`}>{formatStatus(step)}</p>
                    {history && <p className="text-xs text-slate-500">{formatDateTime(history.changedAt)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {delivery && (
          <div className="mt-5 grid gap-2 border-t pt-4 text-sm sm:grid-cols-3">
            <p><span className="text-slate-500">Expected delivery:</span> <b>{formatDate(delivery.expectedDeliveryDate)}</b></p>
            <p><span className="text-slate-500">Courier:</span> {delivery.courierName || 'Not assigned yet'}</p>
            <p><span className="text-slate-500">Tracking no:</span> {delivery.trackingNumber || '-'}</p>
            {delivery.dispatchDate && <p><span className="text-slate-500">Dispatched:</span> {formatDate(delivery.dispatchDate)}</p>}
            {delivery.deliveredDate && <p><span className="text-slate-500">Delivered:</span> {formatDate(delivery.deliveredDate)}</p>}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold">Books</h2>
          <div className="divide-y">
            {order.items.map((i) => (
              <div key={i.book} className="flex items-center gap-3 py-3">
                <img src={coverOrPlaceholder(i.coverImage)} alt={i.title} className="h-16 w-11 rounded object-cover" />
                <div className="flex-1">
                  <Link to={`/books/${i.book}`} className="text-sm font-medium hover:underline">{i.title}</Link>
                  <p className="text-xs text-slate-500">{i.authorNames.join(', ')}</p>
                  <p className="text-xs text-slate-500">{i.quantity} × {formatPrice(i.unitPrice)}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(i.lineTotal)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}</dd></div>
            <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.totalAmount)}</dd></div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
            <h2 className="mb-2 font-semibold">Delivery address</h2>
            <p>{order.shippingAddress.recipientName}</p>
            <p className="text-slate-600">{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
            <p className="text-slate-600">{order.shippingAddress.city}, {order.shippingAddress.district} {order.shippingAddress.postalCode}</p>
            <p className="text-slate-600">{order.shippingAddress.phone}</p>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
            <h2 className="mb-2 font-semibold">Payment</h2>
            <div className="flex items-center justify-between"><span>Status</span><StatusBadge status={order.paymentStatus} /></div>
            <p className="mt-2 text-slate-600">Method: Online card{payment?.cardBrand ? ` (${payment.cardBrand.toUpperCase()} •••• ${payment.cardLast4})` : ''}</p>
            {payment?.transactionId && <p className="break-all text-xs text-slate-500">Ref: {payment.transactionId}</p>}
            {order.invoiceNumber && <p className="text-slate-600">Invoice: {order.invoiceNumber}</p>}
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message="This unpaid order will be cancelled. You can place a new order anytime."
        confirmText="Cancel order"
        onConfirm={cancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
};

export default OrderDetails;