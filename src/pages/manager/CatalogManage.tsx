import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import bookService from '../../services/bookService';
import { getErrorMessage } from '../../services/api';
import { Author, Category } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { Column } from '../../components/dashboard/DataTable';
import { Input, TextArea } from '../../components/common/Input';

// ---------- Authors ----------
export const AuthorsManage = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [form, setForm] = useState({ name: '', nationality: '', biography: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Author | null>(null);

  const load = () => {
    setLoading(true);
    bookService.getAuthors({ limit: 100 }).then((r) => setAuthors(r.items)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openForm = (author?: Author) => {
    setEditing(author || null);
    setForm({ name: author?.name || '', nationality: author?.nationality || '', biography: author?.biography || '', isActive: author?.isActive ?? true });
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await bookService.updateAuthor(editing._id, form);
      else await bookService.createAuthor(form);
      toast.success('Author saved');
      setOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      toast.success(await bookService.deleteAuthor(deleting._id));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<Author>[] = [
    { header: 'Name', render: (a) => <span className="font-medium text-slate-900">{a.name}</span> },
    { header: 'Nationality', render: (a) => a.nationality || '-' },
    { header: 'Books', render: (a) => a.bookCount || 0 },
    { header: 'Status', render: (a) => <StatusBadge status={a.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      header: 'Actions',
      render: (a) => (
        <div className="flex gap-2">
          <button onClick={() => openForm(a)} className="text-slate-500 hover:text-blue-800" aria-label="Edit"><Pencil size={17} /></button>
          <button onClick={() => setDeleting(a)} className="text-slate-500 hover:text-red-600" aria-label="Delete"><Trash2 size={17} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Authors" description="Authors can be linked to many books" actions={<Button onClick={() => openForm()}><Plus size={16} /> Add author</Button>} />
      <DataTable columns={columns} rows={authors} loading={loading} rowKey={(a) => a._id} />
      <Modal open={open} title={editing ? 'Edit author' : 'Add author'} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Nationality" name="nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
          <TextArea label="Biography" name="biography" value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleting} title="Delete author?" message="Authors linked to books cannot be deleted." confirmText="Delete" onConfirm={remove} onCancel={() => setDeleting(null)} />
    </div>
  );
};

// ---------- Categories ----------
export const CategoriesManage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const load = () => {
    setLoading(true);
    bookService.getCategories(true).then(setCategories).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openForm = (category?: Category) => {
    setEditing(category || null);
    setForm({ name: category?.name || '', description: category?.description || '', isActive: category?.isActive ?? true });
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await bookService.updateCategory(editing._id, form);
      else await bookService.createCategory(form);
      toast.success('Category saved');
      setOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      toast.success(await bookService.deleteCategory(deleting._id));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<Category>[] = [
    { header: 'Name', render: (c) => <span className="font-medium text-slate-900">{c.name}</span> },
    { header: 'Slug', render: (c) => <code className="text-xs">{c.slug}</code> },
    { header: 'Description', render: (c) => c.description || '-' },
    { header: 'Status', render: (c) => <StatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      header: 'Actions',
      render: (c) => (
        <div className="flex gap-2">
          <button onClick={() => openForm(c)} className="text-slate-500 hover:text-blue-800" aria-label="Edit"><Pencil size={17} /></button>
          <button onClick={() => setDeleting(c)} className="text-slate-500 hover:text-red-600" aria-label="Delete"><Trash2 size={17} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Categories" description="Every book belongs to one category" actions={<Button onClick={() => openForm()}><Plus size={16} /> Add category</Button>} />
      <DataTable columns={columns} rows={categories} loading={loading} rowKey={(c) => c._id} />
      <Modal open={open} title={editing ? 'Edit category' : 'Add category'} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextArea label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleting} title="Delete category?" message="Categories used by books cannot be deleted - deactivate them instead." confirmText="Delete" onConfirm={remove} onCancel={() => setDeleting(null)} />
    </div>
  );
};