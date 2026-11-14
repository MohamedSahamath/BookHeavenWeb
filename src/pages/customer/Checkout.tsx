import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreditCard, Lock, MapPin, Plus } from 'lucide-react';
import authService, { AddressInput } from '../../services/authService';
import orderService from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { Address } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchCart } from '../../redux/slices/cartSlice';
import { addDaysLabel, coverOrPlaceholder, formatPrice } from '../../utils/format';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import AddressForm from '../../components/common/AddressForm';

const Checkout = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { cart, loading: cartLoading } = useAppSelector((s) => s.cart);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchCart());
    authService
      .getAddresses()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelected(def._id);
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  const saveAddress = async (data: AddressInput) => {
    setSaving(true);
    try {
      const list = await authService.addAddress(data);
      setAddresses(list);
      setSelected(list[list.length - 1]._id);
      setShowForm(false);
      toast.success('Address added');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const pay = async () => {
    if (!selected) return toast.error('Please select a delivery address');
    setPaying(true);
    try {
      const { checkoutUrl } = await orderService.checkout(selected);
      // Leave our site and go to Stripe's secure card page
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
      setPaying(false);
      dispatch(fetchCart());
    }
  };

  if (loading || (cartLoading && !cart)) return <Loader />;
  if (!cart || cart.items.length === 0) {
    return <EmptyState title="Nothing to checkout" message="Your cart is empty." action={<Link to="/books" className="text-blue-800">Browse books</Link>} />;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Step 1: address */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold"><MapPin size={18} /> 1. Delivery address</h2>
              <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}><Plus size={14} /> New address</Button>
            </div>
            {addresses.length === 0 ? (
              <p className="text-sm text-slate-500">You have no saved addresses. Please add one.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <label key={a._id} className={`cursor-pointer rounded-lg border p-3 text-sm ${selected === a._id ? 'border-blue-800 ring-2 ring-blue-200' : 'border-slate-200'}`}>
                    <input type="radio" name="address" className="mr-2" checked={selected === a._id} onChange={() => setSelected(a._id)} />
                    <span className="font-medium">{a.label}</span>
                    <p className="mt-1 text-slate-600">{a.recipientName} · {a.phone}</p>
                    <p className="text-slate-600">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</p>
                    <p className="text-slate-600">{a.city}, {a.district} {a.postalCode}</p>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Step 2: items */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold">2. Review your books</h2>
            <div className="divide-y">
              {cart.items.map((i) => (
                <div key={i.bookId} className="flex items-center gap-3 py-3">
                  <img src={coverOrPlaceholder(i.coverImage)} alt={i.title} className="h-16 w-11 rounded object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{i.title}</p>
                    <p className="text-xs text-slate-500">{i.quantity} × {formatPrice(i.unitPrice)}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(i.lineTotal)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Step 3: pay */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">3. Payment</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery charges</dt><dd>{cart.deliveryCharge === 0 ? 'FREE' : formatPrice(cart.deliveryCharge)}</dd></div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold"><dt>Total payable</dt><dd>{formatPrice(cart.total)}</dd></div>
          </dl>
          <p className="mt-3 rounded bg-blue-50 px-3 py-2 text-xs text-blue-900">Expected delivery: on or before <b>{addDaysLabel(5)}</b> (5 days after payment)</p>
          <div className="mt-4 rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
            <p className="flex items-center gap-2 font-medium text-slate-800"><CreditCard size={16} /> Online card payment only</p>
            <p className="mt-1">You will enter your card details on Stripe's secure page. BookHaven never sees or stores your card number or CVV.</p>
          </div>
          <Button className="mt-4" fullWidth size="lg" loading={paying} disabled={!selected || cart.hasStockProblems} onClick={pay}>
            <Lock size={16} /> Pay {formatPrice(cart.total)} with card
          </Button>
          {cart.hasStockProblems && <p className="mt-2 text-center text-xs text-red-600">Some books no longer have enough stock. Go back to your cart.</p>}
        </aside>
      </div>

      <Modal open={showForm} title="Add delivery address" onClose={() => setShowForm(false)} size="lg">
        <AddressForm defaultName={user?.fullName} defaultPhone={user?.phone} loading={saving} onSubmit={saveAddress} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
};

export default Checkout;