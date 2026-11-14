import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import orderService from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { Order } from '../../types';
import { useAppDispatch } from '../../hooks/useRedux';
import { fetchCart } from '../../redux/slices/cartSlice';
import { fetchUnreadCount } from '../../redux/slices/notificationSlice';
import { formatDate, formatPrice } from '../../utils/format';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<string>('LOADING');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const called = useRef(false);
  const sessionId = params.get('session_id') || '';

  const verify = async () => {
    setStatus('LOADING');
    try {
      const result = await orderService.verifyPayment(sessionId);
      setStatus(result.status);
      setOrder(result.order);
      dispatch(fetchCart());
      dispatch(fetchUnreadCount());
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('ERROR');
    }
  };

  useEffect(() => {
    if (called.current) return; // React StrictMode runs effects twice in development
    called.current = true;
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'LOADING') return <Loader text="Confirming your payment with the bank..." />;

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
      {status === 'SUCCESS' && order && (
        <>
          <CheckCircle2 size={56} className="mx-auto text-emerald-600" />
          <h1 className="mt-4 text-2xl font-bold">Payment successful!</h1>
          <p className="mt-2 text-slate-600">Thank you for your order. A confirmation has been sent to your email.</p>
          <div className="mt-6 space-y-1 rounded-lg bg-slate-50 p-4 text-left text-sm">
            <p><b>Order:</b> {order.orderNumber}</p>
            <p><b>Invoice:</b> {order.invoiceNumber}</p>
            <p><b>Amount paid:</b> {formatPrice(order.totalAmount)}</p>
            <p><b>Expected delivery:</b> {formatDate(order.expectedDeliveryDate)}</p>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => orderService.downloadInvoice(order._id, order.invoiceNumber || order.orderNumber)}>Download invoice</Button>
            <Link to={`/orders/${order._id}`} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white">View order</Link>
          </div>
        </>
      )}

      {status === 'PENDING' && (
        <>
          <Clock size={56} className="mx-auto text-amber-500" />
          <h1 className="mt-4 text-2xl font-bold">Payment is still processing</h1>
          <p className="mt-2 text-slate-600">This can take a few seconds.</p>
          <Button className="mt-6" onClick={verify}>Check again</Button>
        </>
      )}

      {status === 'REFUND_PENDING' && (
        <>
          <XCircle size={56} className="mx-auto text-orange-500" />
          <h1 className="mt-4 text-2xl font-bold">Order could not be completed</h1>
          <p className="mt-2 text-slate-600">{order?.cancelReason || 'A book went out of stock during payment. A full refund will be issued.'}</p>
          <Link to="/orders" className="mt-6 inline-block text-blue-800">Go to my orders</Link>
        </>
      )}

      {(status === 'FAILED' || status === 'ERROR') && (
        <>
          <XCircle size={56} className="mx-auto text-red-600" />
          <h1 className="mt-4 text-2xl font-bold">Payment failed</h1>
          <p className="mt-2 text-slate-600">{error || 'Your card was not charged. Your cart is still saved.'}</p>
          <Link to="/cart" className="mt-6 inline-block rounded-lg bg-blue-900 px-4 py-2 text-sm text-white">Back to cart</Link>
        </>
      )}
    </div>
  );
};

export const PaymentCancel = () => {
  const [params] = useSearchParams();
  const called = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    const orderId = params.get('order_id');
    if (orderId) orderService.cancelPayment(orderId).catch(() => undefined).finally(() => setDone(true));
    else setDone(true);
  }, [params]);

  if (!done) return <Loader />;

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <XCircle size={56} className="mx-auto text-slate-400" />
      <h1 className="mt-4 text-2xl font-bold">Payment cancelled</h1>
      <p className="mt-2 text-slate-600">No money was taken and no stock was reserved. Your books are still in your cart.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/cart" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Back to cart</Link>
        <Link to="/checkout" className="rounded-lg bg-blue-900 px-4 py-2 text-sm text-white">Try again</Link>
      </div>
    </div>
  );
};