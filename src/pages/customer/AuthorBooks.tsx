import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import bookService from '../../services/bookService';
import { getErrorMessage } from '../../services/api';
import { Author, Book, Pagination as PaginationInfo } from '../../types';
import BookGrid from '../../components/books/BookGrid';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const AuthorBooks = () => {
  const { id = '' } = useParams();
  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    bookService
      .getAuthor(id, { page })
      .then((res) => {
        setAuthor(res.author);
        setBooks(res.books);
        setPagination(res.pagination);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, page]);

  if (loading && !author) return <Loader />;
  if (error || !author) return <EmptyState title="Author not found" message={error} />;

  return (
    <div>
      <div className="mb-8 flex flex-col items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-900">
          {author.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{author.name}</h1>
          {author.nationality && <p className="text-sm text-slate-500">{author.nationality}</p>}
          <p className="mt-2 text-sm text-slate-700">{author.biography || 'Browse all books by this author below.'}</p>
        </div>
      </div>
      <h2 className="mb-4 text-xl font-semibold">Books by {author.name}</h2>
      {books.length === 0 ? <EmptyState title="No books yet" /> : <BookGrid books={books} />}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default AuthorBooks;