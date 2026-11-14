import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import bookService from '../../services/bookService';
import { Author } from '../../types';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';

const Authors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debounced = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    bookService
      .getAuthors({ search: debounced || undefined, limit: 100 })
      .then((r) => setAuthors(r.items.filter((a) => a.isActive)))
      .finally(() => setLoading(false));
  }, [debounced]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Authors</h1>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search authors..." className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-72" />
      </div>
      {loading ? (
        <Loader />
      ) : authors.length === 0 ? (
        <EmptyState title="No authors found" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {authors.map((a) => (
            <Link key={a._id} to={`/authors/${a._id}`} className="rounded-xl border border-slate-200 bg-white p-5 text-center hover:shadow">
              <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-900">
                {a.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </span>
              <p className="font-medium text-slate-900">{a.name}</p>
              <p className="text-xs text-slate-500">{a.bookCount || 0} book(s)</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Authors;