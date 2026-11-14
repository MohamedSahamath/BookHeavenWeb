import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Zap } from 'lucide-react';
import bookService from '../../services/bookService';
import { getErrorMessage } from '../../services/api';
import { Book } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { addToCart } from '../../redux/slices/cartSlice';
import { coverOrPlaceholder, formatPrice } from '../../utils/format';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import BookSection from '../../components/books/BookSection';

const BookDetails = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [book, setBook] = useState<Book | null>(null);
  const [related, setRelated] = useState<Book[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    bookService
      .getBook(id)
      .then((b) => {
        setBook(b);
        // "More from this category"
        return bookService.getBooks({ category: b.category._id, limit: 7 });
      })
      .then((res) => setRelated(res.items.filter((b) => b._id !== id)))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  // Adds to cart; returns true when it worked
  const handleAdd = async (): Promise<boolean> => {
    if (!user) {
      toast('Please log in to buy books');
      navigate('/login', { state: { from: `/books/${id}` } });
      return false;
    }
    if (user.role !== 'CUSTOMER') {
      toast.error('Only customer accounts can buy books');
      return false;
    }
    setAdding(true);
    const result = await dispatch(addToCart({ bookId: id, quantity }));
    setAdding(false);
    if (addToCart.fulfilled.match(result)) {
      toast.success(`Added ${quantity} × "${book?.title}" to your cart`);
      return true;
    }
    toast.error(result.payload as string);
    return false;
  };

  const handleBuyNow = async () => {
    if (await handleAdd()) navigate('/checkout');
  };

  if (loading) return <Loader />;
  if (error || !book) return <EmptyState title="Book not found" message={error} action={<Link to="/books" className="text-blue-800">Back to books</Link>} />;

  const outOfStock = book.stock === 0 || !book.isActive;

  return (
    <div>
      <nav className="mb-4 text-sm text-slate-500">
        <Link to="/" className="hover:underline">Home</Link> / <Link to={`/books?category=${book.category._id}`} className="hover:underline">{book.category.name}</Link> / <span className="text-slate-800">{book.title}</span>
      </nav>

      <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-[300px_1fr]">
        <img
          src={coverOrPlaceholder(book.coverImage)}
          alt={book.title}
          onError={(e) => ((e.target as HTMLImageElement).src = coverOrPlaceholder())}
          className="mx-auto w-full max-w-[300px] rounded-xl border border-slate-200 object-cover shadow"
        />

        <div>
          <Link to={`/books?category=${book.category._id}`} className="text-sm font-medium text-blue-700">{book.category.name}</Link>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{book.title}</h1>
          <p className="mt-2 text-slate-600">
            by{' '}
            {book.authors.map((a, i) => (
              <span key={a._id}>
                <Link to={`/authors/${a._id}`} className="font-medium text-blue-800 hover:underline">{a.name}</Link>
                {i < book.authors.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900">{formatPrice(book.sellingPrice)}</span>
            {book.discountPercent > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">{formatPrice(book.price)}</span>
                <span className="rounded bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-700">{book.discountPercent}% OFF</span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <StatusBadge status={outOfStock ? 'OUT_OF_STOCK' : book.availability} />
            {!outOfStock && <span className="text-sm text-slate-600">{book.stock} copies available</span>}
          </div>

          {outOfStock ? (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              Sorry, this book is currently out of stock. Please check again soon — our team restocks regularly.
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg border border-slate-300">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-slate-100" aria-label="Decrease"><Minus size={16} /></button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))} className="p-2.5 hover:bg-slate-100" aria-label="Increase"><Plus size={16} /></button>
              </div>
              <Button size="lg" variant="secondary" loading={adding} onClick={handleAdd}><ShoppingCart size={18} /> Add to cart</Button>
              <Button size="lg" onClick={handleBuyNow} disabled={adding}><Zap size={18} /> Buy now</Button>
            </div>
          )}

          <p className="mt-3 text-xs text-slate-500">Delivered anywhere in Sri Lanka within 5 days of payment.</p>

          <div className="mt-8">
            <h2 className="mb-2 font-semibold text-slate-900">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{book.description}</p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">ISBN</dt><dd className="font-medium">{book.isbn}</dd></div>
            <div><dt className="text-slate-500">Publisher</dt><dd className="font-medium">{book.publisher || '-'}</dd></div>
            <div><dt className="text-slate-500">Published</dt><dd className="font-medium">{book.publicationYear || '-'}</dd></div>
            <div><dt className="text-slate-500">Language</dt><dd className="font-medium">{book.language}</dd></div>
            <div><dt className="text-slate-500">Pages</dt><dd className="font-medium">{book.pages || '-'}</dd></div>
          </dl>
        </div>
      </div>

      <BookSection title={`More in ${book.category.name}`} books={related} viewAllLink={`/books?category=${book.category._id}`} />
    </div>
  );
};

export default BookDetails;