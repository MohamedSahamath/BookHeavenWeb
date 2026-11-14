import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Truck, CreditCard, Sparkles } from 'lucide-react';
import bookService from '../../services/bookService';
import { getErrorMessage } from '../../services/api';
import { HomeData } from '../../types';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import BookSection from '../../components/books/BookSection';

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    bookService
      .getHome()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/books?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 to-blue-800 px-6 py-12 text-white md:px-12">
        <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs">
          <Sparkles size={14} className="text-amber-300" /> Sri Lanka's online bookstore
        </p>
        <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl">Find your next favourite book. Delivered island-wide in 5 days.</h1>
        <form onSubmit={onSearch} className="mt-6 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title, author, category or ISBN"
              className="w-full rounded-lg bg-white py-3 pl-10 pr-3 text-sm text-slate-900 focus:outline-none"
            />
          </div>
          <button className="rounded-lg bg-amber-500 px-5 text-sm font-semibold text-blue-950 hover:bg-amber-400">Search</button>
        </form>
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-blue-100">
          <span className="flex items-center gap-2"><Truck size={16} /> Free delivery over LKR 5,000</span>
          <span className="flex items-center gap-2"><CreditCard size={16} /> Secure card payments</span>
        </div>
      </section>

      {loading && <Loader text="Loading books..." />}
      {error && <div className="mt-8"><EmptyState title="Could not load the store" message={error} /></div>}

      {data && (
        <>
          {/* Categories */}
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Browse by category</h2>
            <div className="flex flex-wrap gap-2">
              {data.categories.map((c) => (
                <Link
                  key={c._id}
                  to={`/books?category=${c._id}`}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:border-blue-800 hover:text-blue-900"
                >
                  {c.name} <span className="text-slate-400">({c.bookCount || 0})</span>
                </Link>
              ))}
            </div>
          </section>

          <BookSection title="Recommended for you" subtitle={data.recommended.reason} books={data.recommended.books} />
          <BookSection title="Featured books" books={data.featured} />
          <BookSection title="Special offers" subtitle="Limited-time discounts" books={data.offers} />
          <BookSection title="Best sellers" books={data.bestSellers} viewAllLink="/books?sort=popular" />
          <BookSection title="Latest arrivals" books={data.latest} viewAllLink="/books?sort=newest" />
          <BookSection title="Popular right now" subtitle="Most viewed by readers" books={data.popular} />

          {/* Authors */}
          {data.authors.length > 0 && (
            <section className="mt-12">
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-xl font-bold text-slate-900">Discover authors</h2>
                <Link to="/authors" className="text-sm font-medium text-blue-800 hover:underline">All authors →</Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {data.authors.map((a) => (
                  <Link key={a._id} to={`/authors/${a._id}`} className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 text-center hover:shadow">
                    <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-900">
                      {a.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </span>
                    <span className="text-sm font-medium text-slate-800">{a.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Home;