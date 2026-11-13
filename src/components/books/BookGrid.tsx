import { Book } from '../../types';
import BookCard from './BookCard';

const BookGrid = ({ books }: { books: Book[] }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
    {books.map((book) => (
      <BookCard key={book._id} book={book} />
    ))}
  </div>
);

export default BookGrid;