import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PackageCheck, PackageX, Plus, Trash2 } from 'lucide-react';
import managerService, { SupplierOrderInput } from '../../services/managerService';
import bookService from '../../services/bookService';
import { getErrorMessage } from '../../services/api';
import { Book, Pagination as PaginationInfo, Supplier, SupplierOrder } from '../../types';
import { formatDate, formatPrice, formatStatus } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { Column } from '../../components/dashboard/DataTable';
import { Input, Select, TextArea } from '../../components/common/Input';

const today = () => new Date().toISOString().slice(0, 10);

const SupplierOrders = () => {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SupplierOrderInput>({ supplier: '', book: '', orderedQuantity: 10, unitCost: 0, orderDate: today(), expectedDeliveryDate: '', notes: '' });
  const [receiving, setReceiving] = useState<SupplierOrder | null>(null);
  const [receiveQty, setReceiveQty] = useState('');
  const [receiveDate, setReceiveDate] = useState(today());
  const [notReceived, setNotReceived] = useState<SupplierOrder | null>(null);
  const [deleting, setDeleting] = useState<SupplierOrder | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    managerService
      .getSupplierOrders({ page, status: status || undefined })
      .then((res) => {
        setOrders(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, status]);

  useEffect(() => {
    managerService.getSuppliers({ status: 'active', limit: 100 }).then((r) => setSuppliers(r.items));
    bookService.getBooks({ limit: 100, includeInactive: 'true', sort: 'title' }).then((r) => setBooks(r.items));
  }, []);

  // When a book is chosen, pre-fill the unit cost with its purchase cost
  const chooseBook = (bookId: string) => {
    const book = books.find((b) => b._id === bookId);
    setForm({ ...form, book: bookId, unitCost: book ? book.purchaseCost : form.unitCost });
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      toast.success(await managerService.createSupplierOrder(form));
      setOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const receive = async (e: FormEvent) => {
    e.preventDefault();
    if (!receiving) return;
    setSaving(true);
    try {
      toast.success(await managerService.receiveSupplierOrder(receiving._id, Number(receiveQty), receiveDate));
      setReceiving(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const markNotReceived = async () => {
    if (!notReceived) return;
    try {
      toast.success(await managerService.markNotReceived(notReceived._id));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setNotReceived(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      toast.success(await managerService.deleteSupplierOrder(deleting._id));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<SupplierOrder>[] = [
    { header: 'Reference', render: (o) => <div><p className="font-medium">{o.referenceNumber}</p><p className="text-xs text-slate-500">{o.supplier?.name}</p></div> },
    { header: 'Book', render: (o) => o.book?.title },
    { header: 'Ordered', render: (o) => o.orderedQuantity },
    { header: 'Received', render: (o) => <span className={o.receivedQuantity < o.orderedQuantity ? 'text-amber-700' : 'text-emerald-700'}>{o.receivedQuantity}</span> },
    { header: 'Unit cost', render: (o) => formatPrice(o.unitCost) },
    {
      header: 'Dates',
      render: (o) => {
        const overdue = ['PENDING', 'PARTIALLY_RECEIVED'].includes(o.status) && new Date(o.expectedDeliveryDate) < new Date();
        return (
          <div className="text-xs">
            <p>Ordered: {formatDate(o.orderDate)}</p>
            <p className={overdue ? 'font-semibold text-red-600' : ''}>Expected: {formatDate(o.expectedDeliveryDate)}{overdue ? ' (overdue)' : ''}</p>
            {o.actualReceivedDate && <p>Received: {formatDate(o.actualReceivedDate)}</p>}
          </div>
        );
      },
    },
    { header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    {
      header: 'Actions',
      render: (o) => (
        <div className="flex gap-1">
          {['PENDING', 'PARTIALLY_RECEIVED'].includes(o.status) && (
            <Button size="sm" variant="success" onClick={() => { setReceiving(o); setReceiveQty(String(o.orderedQuantity - o.receivedQuantity)); setReceiveDate(today()); }}>
              <PackageCheck size={14} /> Receive
            </Button>
          )}
          {o.status === 'PENDING' && (
            <>
              <Button size="sm" variant="ghost" onClick={() => setNotReceived(o)} aria-label="Not received"><PackageX size={14} /></Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleting(o)} aria-label="Delete"><Trash2 size={14} /></Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Supplier deliveries"
        description="Stock increases only when you confirm the quantity actually received"
        actions={<Button onClick={() => setOpen(true)}><Plus size={16} /> New supplier order</Button>}
      />
      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="mb-4 rounded-lg border border-slate-300 px-3 py-2 text-sm">
        <option value="">All statuses</option>
        {['PENDING', 'PARTIALLY_RECEIVED', 'RECEIVED', 'NOT_RECEIVED'].map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
      </select>
      <DataTable columns={columns} rows={orders} loading={loading} rowKey={(o) => o._id} emptyTitle="No supplier orders" />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal open={open} title="New supplier order" onClose={() => setOpen(false)} size="lg">
        <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
          <Select label="Supplier" name="supplier" required value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
            <option value="">Select supplier</option>
            {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </Select>
          <Select label="Book" name="book" required value={form.book} onChange={(e) => chooseBook(e.target.value)}>
            <option value="">Select book</option>
            {books.map((b) => <option key={b._id} value={b._id}>{b.title} (stock {b.stock})</option>)}
          </Select>
          <Input label="Ordered quantity" name="orderedQuantity" type="number" min={1} required value={form.orderedQuantity} onChange={(e) => setForm({ ...form, orderedQuantity: Number(e.target.value) })} />
          <Input label="Unit purchase cost (LKR)" name="unitCost" type="number" min={0} step="0.01" required value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} />
          <Input label="Order date" name="orderDate" type="date" value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })} />
          <Input label="Expected delivery date" name="expectedDeliveryDate" type="date" required value={form.expectedDeliveryDate} onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })} />
          <div className="sm:col-span-2">
            <TextArea label="Notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <p className="rounded bg-blue-50 px-3 py-2 text-xs text-blue-900 sm:col-span-2">Total cost: <b>{formatPrice(form.orderedQuantity * form.unitCost)}</b>. Stock will NOT change until the books are received.</p>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create order</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!receiving} title={`Receive books - ${receiving?.referenceNumber || ''}`} onClose={() => setReceiving(null)}>
        <form onSubmit={receive} className="space-y-4">
          <p className="text-sm text-slate-600">
            {receiving?.book?.title}: ordered <b>{receiving?.orderedQuantity}</b>, already received <b>{receiving?.receivedQuantity}</b>.
          </p>
          <Input
            label="Quantity actually received now"
            name="receiveQty"
            type="number"
            min={1}
            max={receiving ? receiving.orderedQuantity - receiving.receivedQuantity : undefined}
            required
            value={receiveQty}
            onChange={(e) => setReceiveQty(e.target.value)}
            hint="Stock will increase by this number and a supplier payment expense will be recorded"
          />
          <Input label="Received date" name="receiveDate" type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setReceiving(null)}>Cancel</Button>
            <Button type="submit" variant="success" loading={saving}>Confirm received</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!notReceived} title="Mark as NOT received?" message="Use this when the supplier did not deliver anything. Stock will not change." confirmText="Mark not received" onConfirm={markNotReceived} onCancel={() => setNotReceived(null)} />
      <ConfirmDialog open={!!deleting} title="Delete supplier order?" message="Only orders with no received books can be deleted." confirmText="Delete" onConfirm={remove} onCancel={() => setDeleting(null)} />
    </div>
  );
};

export default SupplierOrders;