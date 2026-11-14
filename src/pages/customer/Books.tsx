import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import bookService from '../../services/bookService';
import { getErrorMessage } from '../../services/api';
import { Author, Book, Category, Pagination as PaginationInfo } from '../../types';
import { SORT_OPTIONS } from '../../utils/constants';
import BookGrid from '../../components/books/BookGrid';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { useDebounce } from '../../hooks/useDebounce';

const Books = () => {
  const [params, setParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState(params.get('search') || '');
  const debouncedSearch = useDebounce(searchText);

  // Helper: change one URL filter (and go back to page 1)
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    bookService.getCategories().then(setCategories).catch(() => undefined);
    bookService.getAuthors({ limit: 100 }).then((r) => setAuthors(r.items)).catch(() => undefined);
  }, []);

  // Update the URL when the user stops typing
  useEffect(() => {
    if (debouncedSearch !== (params.get('search') || '')) setParam('search', debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Load books whenever the URL filters change
  useEffect(() => {
    setLoading(true);
    setError('');
    bookService
      .getBooks({
        search: params.get('search') || undefined,
        category: params.get('category') || undefined,
        author: params.get('author') || undefined,
        minPrice: params.get('minPrice') || undefined,
        maxPrice: params.get('maxPrice') || undefined,
        inStock: params.get('inStock') || undefined,
        sort: params.get('sort') || 'newest',
        page: Number(params.get('page')) || 1,
        limit: 12,
      })
      .then((res) => {
        setBooks(res.items);
        setPagination(res.pagination);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [params]);

  const clearFilters = () => {
    setSearchText('');
    setParams(new URLSearchParams());
  };

  const filters = (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
        <select value={params.get('category') || ''} onChange={(e) => setParam('category', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Author</label>
        <select value={params.get('author') || ''} onChange={(e) => setParam('author', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">All authors</option>
          {authors.map((a) => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Price (LKR)</label>
        <div className="flex gap-2">
          <input type="number" min={0} placeholder="Min" defaultValue={params.get('minPrice') || ''} onBlur={(e) => setParam('minPrice', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input type="number" min={0} placeholder="Max" defaultValue={params.get('maxPrice') || ''} onBlur={(e) => setParam('maxPrice', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={params.get('inStock') === 'true'} onChange={(e) => setParam('inStock', e.target.checked ? 'true' : '')} />
        Only show books in stock
      </label>
      <button onClick={clearFilters} className="text-sm text-red-600 hover:underline">Clear all filters</button>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {params.get('search') ? `Results for "${params.get('search')}"` : 'All books'}
        </h1>
        <div className="flex gap-2">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search title, author, ISBN..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:w-72"
          />
          <select value={params.get('sort') || 'newest'} onChange={(e) => setParam('sort', e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button onClick={() => setShowFilters(true)} className="rounded-lg border border-slate-300 bg-white px-3 lg:hidden" aria-label="Filters">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-60 shrink-0 rounded-xl border border-slate-200 bg-white p-4 lg:block">{filters}</aside>

        {showFilters && (
          <div className="fixed inset-0 z-40 flex justify-end bg-black/40 lg:hidden" onClick={() => setShowFilters(false)}>
            <div className="h-full w-72 bg-white p-5" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex justify-between">
                <span className="font-semibold">Filters</span>
                <button onClick={() => setShowFilters(false)}><X size={20} /></button>
              </div>
              {filters}
            </div>
          </div>
        )}

        <div className="flex-1">
          {loading ? (
            <Loader />
          ) : error ? (
            <EmptyState title="Could not load books" message={error} />
          ) : books.length === 0 ? (
            <EmptyState title="No books found" message="Try a different search or remove some filters." />
          ) : (
            <>
              <BookGrid books={books} />
              <Pagination pagination={pagination} onPageChange={(p) => setParam('page', String(p))} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Books;