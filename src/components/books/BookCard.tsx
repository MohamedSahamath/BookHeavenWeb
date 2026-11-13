import { Link } from 'react-router-dom';
import { Book } from '../../types';
import { coverOrPlaceholder, formatPrice } from '../../utils/format';
import StatusBadge from '../common/StatusBadge';

const availabilityLabel = { IN_STOCK: 'In stock', LOW_STOCK: 'Only a few left', OUT_OF_STOCK: 'Out of stock' };

const BookCard = ({ book }: { book: Book }) => (
  <Link
    to={`/books/${book._id}`}
    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
      <img
        src={coverOrPlaceholder(book.coverImage)}
        alt={book.title}
        loading="lazy"
        onError={(e) => ((e.target as HTMLImageElement).src = coverOrPlaceholder())}
        className={`h-full w-full object-cover transition group-hover:scale-105 ${book.stock === 0 ? 'opacity-60 grayscale' : ''}`}
      />
      {book.discountPercent > 0 && (
        <span className="absolute left-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
          -{book.discountPercent}%
        </span>
      )}
    </div>
    <div className="flex flex-1 flex-col p-3">
      <p className="text-xs text-blue-700">{book.category?.name}</p>
      <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-900">{book.title}</h3>
      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{book.authors.map((a) => a.name).join(', ')}</p>
      <div className="mt-auto pt-2">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900">{formatPrice(book.sellingPrice)}</span>
          {book.discountPercent > 0 && <span className="text-xs text-slate-400 line-through">{formatPrice(book.price)}</span>}
        </div>
        <div className="mt-1.5">
          <StatusBadge status={book.availability} label={availabilityLabel[book.availability]} />
        </div>
      </div>
    </div>
  </Link>
);

export default BookCard;