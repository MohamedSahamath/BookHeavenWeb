import { Link } from 'react-router-dom';
import { Book } from '../../types';
import BookGrid from './BookGrid';

interface BookSectionProps {
  title: string;
  subtitle?: string;
  books: Book[];
  viewAllLink?: string;
}

const BookSection = ({ title, subtitle, books, viewAllLink }: BookSectionProps) => {
  if (books.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm font-medium text-blue-800 hover:underline">
            View all →
          </Link>
        )}
      </div>
      <BookGrid books={books.slice(0, 6)} />
    </section>
  );
};

export default BookSection;