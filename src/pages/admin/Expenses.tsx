import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import adminService, { ExpenseInput } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { Expense, Pagination as PaginationInfo } from '../../types';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { formatDate, formatPrice, formatStatus } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import DataTable, { Column } from '../../components/dashboard/DataTable';
import { Input, Select, TextArea } from '../../components/common/Input';

const today = () => new Date().toISOString().slice(0, 10);

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseInput>({ title: '', category: 'OTHER', amount: 0, expenseDate: today(), description: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const load = () => {
    setLoading(true);
    adminService
      .getExpenses({ page, category: category || undefined, from: from || undefined, to: to || undefined })
      .then((res) => {
        setExpenses(res.expenses);
        setTotalAmount(res.totalAmount);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, category, from, to]);

  const openForm = (e?: Expense) => {
    setEditing(e || null);
    setForm(e ? { title: e.title, category: e.category, amount: e.amount, expenseDate: e.expenseDate.slice(0, 10), description: e.description || '' } : { title: '', category: 'OTHER', amount: 0, expenseDate: today(), description: '' });
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await adminService.updateExpense(editing._id, form);
      else await adminService.createExpense(form);
      toast.success('Expense saved');
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
      toast.success(await adminService.deleteExpense(deleting._id));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<Expense>[] = [
    { header: 'Date', render: (e) => formatDate(e.expenseDate) },
    { header: 'Title', render: (e) => <div><p className="font-medium text-slate-900">{e.title}</p>{e.description && <p className="text-xs text-slate-500">{e.description}</p>}</div> },
    { header: 'Category', render: (e) => formatStatus(e.category) },
    { header: 'Amount', render: (e) => <span className="font-semibold">{formatPrice(e.amount)}</span> },
    { header: 'Recorded by', render: (e) => e.recordedBy?.fullName || '-' },
    {
      header: 'Actions',
      render: (e) =>
        e.category === 'SUPPLIER_PAYMENT' ? (
          <span className="text-xs text-slate-400">Automatic</span>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => openForm(e)} className="text-slate-500 hover:text-blue-800" aria-label="Edit"><Pencil size={17} /></button>
            <button onClick={() => setDeleting(e)} className="text-slate-500 hover:text-red-600" aria-label="Delete"><Trash2 size={17} /></button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Expenses" description={`Total for current filter: ${formatPrice(totalAmount)}`} actions={<Button onClick={() => openForm()}><Plus size={16} /> Record expense</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {['SUPPLIER_PAYMENT', ...EXPENSE_CATEGORIES].map((c) => <option key={c} value={c}>{formatStatus(c)}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" aria-label="From" />
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" aria-label="To" />
      </div>
      <DataTable columns={columns} rows={expenses} loading={loading} rowKey={(e) => e._id} emptyTitle="No expenses" />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal open={open} title={editing ? 'Edit expense' : 'Record expense'} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Title" name="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Category" name="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{formatStatus(c)}</option>)}
          </Select>
          <Input label="Amount (LKR)" name="amount" type="number" min={0} step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          <Input label="Date" name="expenseDate" type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
          <TextArea label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleting} title="Delete expense?" message="This expense will be removed from profit calculations." confirmText="Delete" onConfirm={remove} onCancel={() => setDeleting(null)} />
    </div>
  );
};

export default Expenses;