import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchCart, removeCartItem, updateCartItem } from '../../redux/slices/cartSlice';
import { coverOrPlaceholder, formatPrice } from '../../utils/format';
import { FREE_DELIVERY_THRESHOLD } from '../../utils/constants';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useAppSelector((s) => s.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const changeQty = async (bookId: string, quantity: number) => {
    if (quantity < 1) return;
    const result = await dispatch(updateCartItem({ bookId, quantity }));
    if (updateCartItem.rejected.match(result)) toast.error(result.payload as string);
  };

  const remove = async (bookId: string) => {
    await dispatch(removeCartItem(bookId));
    toast.success('Removed from cart');
  };

  if (loading && !cart) return <Loader />;

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart size={44} />}
        title="Your cart is empty"
        message="Browse our collection and add some books."
        action={<Link to="/books" className="rounded-lg bg-blue-900 px-4 py-2 text-sm text-white">Browse books</Link>}
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Shopping cart ({cart.itemCount})</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.bookId} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
              <img src={coverOrPlaceholder(item.coverImage)} alt={item.title} className="h-28 w-20 rounded object-cover" />
              <div className="flex flex-1 flex-col">
                <Link to={`/books/${item.bookId}`} className="font-semibold text-slate-900 hover:underline">{item.title}</Link>
                <p className="text-sm text-slate-500">{item.authorNames.join(', ')}</p>
                <p className="mt-1 text-sm text-slate-700">{formatPrice(item.unitPrice)} each</p>
                {!item.isAvailable && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {item.stock === 0 ? 'Out of stock - please remove' : `Only ${item.stock} available - reduce the quantity`}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-lg border border-slate-300">
                    <button onClick={() => changeQty(item.bookId, item.quantity - 1)} className="p-1.5 hover:bg-slate-100" aria-label="Decrease"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => changeQty(item.bookId, item.quantity + 1)} disabled={item.quantity >= item.stock} className="p-1.5 hover:bg-slate-100 disabled:opacity-40" aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{formatPrice(item.lineTotal)}</span>
                    <button onClick={() => remove(item.bookId)} className="text-red-500 hover:text-red-700" aria-label="Remove"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-900">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{cart.deliveryCharge === 0 ? 'FREE' : formatPrice(cart.deliveryCharge)}</dd></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd>{formatPrice(cart.total)}</dd></div>
          </dl>
          {cart.subtotal < FREE_DELIVERY_THRESHOLD && (
            <p className="mt-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Add {formatPrice(FREE_DELIVERY_THRESHOLD - cart.subtotal)} more for FREE delivery.
            </p>
          )}
          <Button className="mt-4" fullWidth size="lg" disabled={cart.hasStockProblems} onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </Button>
          {cart.hasStockProblems && <p className="mt-2 text-center text-xs text-red-600">Fix the stock problems above to continue.</p>}
        </div>
      </div>
    </div>
  );
};

export default Cart;