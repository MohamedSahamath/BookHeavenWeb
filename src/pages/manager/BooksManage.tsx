import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import bookService from '../../services/bookService';
import { getErrorMessage } from '../../services/api';
import { Author, Book, Category, Pagination as PaginationInfo } from '../../types';
import { coverOrPlaceholder, formatPrice } from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { Column } from '../../components/dashboard/DataTable';
import { Input, Select, TextArea } from '../../components/common/Input';

const emptyForm = {
  title: '', isbn: '', description: '', category: '', authors: [] as string[], price: '', discountPercent: '0', purchaseCost: '',
  publisher: '', publicationYear: '', language: 'English', pages: '', initialStock: '0', lowStockLevel: '5',
  isFeatured: false, isActive: true, coverImageUrl: '',
};

const BooksManage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const debounced = useDebounce(search);

  const load = () => {
    setLoading(true);
    bookService
      .getBooks({ search: debounced || undefined, page, limit: 10, includeInactive: 'true', sort: 'newest' })
      .then((res) => {
        setBooks(res.items);
        setPagination(res.pagination);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [debounced, page]);

  useEffect(() => {
    bookService.getCategories(true).then(setCategories);
    bookService.getAuthors({ limit: 100 }).then((r) => setAuthors(r.items));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setCoverFile(null);
    setOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditing(book);
    setCoverFile(null);
    setForm({
      title: book.title, isbn: book.isbn, description: book.description, category: book.category?._id || '',
      authors: book.authors.map((a) => a._id), price: String(book.price), discountPercent: String(book.discountPercent || 0),
      purchaseCost: String(book.purchaseCost), publisher: book.publisher || '', publicationYear: book.publicationYear ? String(book.publicationYear) : '',
      language: book.language || 'English', pages: book.pages ? String(book.pages) : '', initialStock: '0',
      lowStockLevel: String(book.lowStockLevel ?? 5), isFeatured: book.isFeatured, isActive: book.isActive, coverImageUrl: book.coverImage || '',
    });
    setOpen(true);
  };

  const toggleAuthor = (id: string) =>
    setForm((f) => ({ ...f, authors: f.authors.includes(id) ? f.authors.filter((a) => a !== id) : [...f.authors, id] }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.authors.length === 0) return toast.error('Select at least one author');

    // FormData lets us send text fields and the image file in one request
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'authors') data.append('authors', JSON.stringify(value));
      else if (key === 'initialStock' && editing) return; // stock is changed in Inventory, not here
      else data.append(key, String(value));
    });
    if (coverFile) data.append('coverImage', coverFile);

    setSaving(true);
    try {
      if (editing) await bookService.updateBook(editing._id, data);
      else await bookService.createBook(data);
      toast.success(editing ? 'Book updated' : 'Book added');
      setOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      toast.success(await bookService.deleteBook(deleting._id));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<Book>[] = [
    {
      header: 'Book',
      render: (b) => (
        <div className="flex items-center gap-3">
          <img src={coverOrPlaceholder(b.coverImage)} alt="" className="h-12 w-9 rounded object-cover" />
          <div>
            <p className="font-medium text-slate-900">{b.title}</p>
            <p className="text-xs text-slate-500">{b.authors.map((a) => a.name).join(', ')} · ISBN {b.isbn}</p>
          </div>
        </div>
      ),
    },
    { header: 'Category', render: (b) => b.category?.name },
    { header: 'Price', render: (b) => <div>{formatPrice(b.sellingPrice)}{b.discountPercent > 0 && <p className="text-xs text-red-600">-{b.discountPercent}%</p>}</div> },
    { header: 'Cost', render: (b) => formatPrice(b.purchaseCost) },
    { header: 'Stock', render: (b) => <div className="flex items-center gap-2">{b.stock}<StatusBadge status={b.availability} /></div> },
    { header: 'Status', render: (b) => <StatusBadge status={b.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      header: 'Actions',
      render: (b) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(b)} className="text-slate-500 hover:text-blue-800" aria-label="Edit"><Pencil size={17} /></button>
          <button onClick={() => setDeleting(b)} className="text-slate-500 hover:text-red-600" aria-label="Delete"><Trash2 size={17} /></button>
        </div>
      ),
    },
  ];

  const set = (field: keyof typeof form, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div>
      <PageHeader title="Books" description="Add, update and remove books in the catalog" actions={<Button onClick={openCreate}><Plus size={16} /> Add book</Button>} />
      <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title, author, ISBN..." className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-80" />
      <DataTable columns={columns} rows={books} loading={loading} rowKey={(b) => b._id} emptyTitle="No books yet" />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal open={open} title={editing ? 'Edit book' : 'Add new book'} onClose={() => setOpen(false)} size="xl">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Input label="Title" name="title" required value={form.title} onChange={(e) => set('title', e.target.value)} />
          <Input label="ISBN (10 or 13 digits)" name="isbn" required value={form.isbn} onChange={(e) => set('isbn', e.target.value)} />
          <div className="md:col-span-2">
            <TextArea label="Description" name="description" required value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <Select label="Category" name="category" required value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </Select>
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">Authors (one or more)</p>
            <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-slate-300 p-2">
              {authors.map((a) => (
                <label key={a._id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.authors.includes(a._id)} onChange={() => toggleAuthor(a._id)} /> {a.name}
                </label>
              ))}
              {authors.length === 0 && <p className="text-xs text-slate-500">Add authors first (Authors page)</p>}
            </div>
          </div>
          <Input label="Selling price (LKR)" name="price" type="number" min={0} step="0.01" required value={form.price} onChange={(e) => set('price', e.target.value)} />
          <Input label="Purchase cost (LKR)" name="purchaseCost" type="number" min={0} step="0.01" required value={form.purchaseCost} onChange={(e) => set('purchaseCost', e.target.value)} />
          <Input label="Discount %" name="discountPercent" type="number" min={0} max={90} value={form.discountPercent} onChange={(e) => set('discountPercent', e.target.value)} />
          <Input label="Publisher" name="publisher" value={form.publisher} onChange={(e) => set('publisher', e.target.value)} />
          <Input label="Publication year" name="publicationYear" type="number" value={form.publicationYear} onChange={(e) => set('publicationYear', e.target.value)} />
          <Input label="Language" name="language" value={form.language} onChange={(e) => set('language', e.target.value)} />
          <Input label="Pages" name="pages" type="number" min={1} value={form.pages} onChange={(e) => set('pages', e.target.value)} />
          {!editing && (
            <Input label="Initial stock quantity" name="initialStock" type="number" min={0} value={form.initialStock} onChange={(e) => set('initialStock', e.target.value)} hint="Later stock changes are done in Inventory or by receiving supplier deliveries" />
          )}
          <Input label="Low-stock warning level" name="lowStockLevel" type="number" min={0} value={form.lowStockLevel} onChange={(e) => set('lowStockLevel', e.target.value)} />
          <Input label="Cover image URL (optional)" name="coverImageUrl" value={form.coverImageUrl} onChange={(e) => set('coverImageUrl', e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Or upload cover (JPG/PNG/WEBP, max 2MB)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
          <div className="flex items-center gap-6 md:col-span-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /> Featured on homepage</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Active (visible to customers)</label>
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Add book'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete book?"
        message={`"${deleting?.title}" will be deleted. If it has orders or stock history it will be deactivated instead, to keep records correct.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default BooksManage;