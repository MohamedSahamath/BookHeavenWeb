// Previous / next page buttons with "Page X of Y".
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination as PaginationInfo } from '../../types';

interface PaginationProps {
  pagination?: PaginationInfo;
  onPageChange: (page: number) => void;
}

const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;

  return (
    <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
      <span>
        Page {page} of {pages} · {total} results
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;