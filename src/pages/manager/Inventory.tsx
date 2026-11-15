import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { History, PackagePlus, Settings2 } from 'lucide-react';
import managerService from '../../services/managerService';
import { getErrorMessage } from '../../services/api';
import { InventoryItem, Pagination as PaginationInfo, StockMovement } from '../../types';
import { coverOrPlaceholder, formatDateTime, formatStatus } from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { Column } from '../../components/dashboard/DataTable';
import { Input, Select } from '../../components/common/Input';

const stockStatus = (i: InventoryItem) => (i.quantity === 0 ? 'OUT_OF_STOCK' : i.quantity <= i.lowStockLevel ? 'LOW_STOCK' : 'IN_STOCK');

const Inventory = () => {
  const [tab, setTab] = useState<'stock' | 'history'>('stock');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [loading, setLoading] = useState(true);

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movePagination, setMovePagination] = useState<PaginationInfo>();
  const [movePage, setMovePage] = useState(1);
  const [moveType, setMoveType] = useState('');
  const [historyBook, setHistoryBook] = useState<{ id: string; title: string } | null>(null);

  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);
  const [adjustForm, setAdjustForm] = useState({ type: 'ADD' as 'ADD' | 'REMOVE', quantity: '1', reason: '' });
  const [levelItem, setLevelItem] = useState<InventoryItem | null>(null);
  const [level, setLevel] = useState('5');
  const [saving, setSaving] = useState(false);

  const loadStock = () => {
    setLoading(true);
    managerService
      .getInventory({ page, status: status || undefined, search: debounced || undefined })
      .then((res) => {
        setItems(res.items);
        setPagination(res.pagination);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  const loadMovements = () => {
    setLoading(true);
    managerService
      .getMovements({ page: movePage, type: moveType || undefined, book: historyBook?.id })
      .then((res) => {
        setMovements(res.items);
        setMovePagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'stock') loadStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, status, debounced]);

  useEffect(() => {
    if (tab === 'history') loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, movePage, moveType, historyBook]);

  const submitAdjust = async (e: FormEvent) => {
    e.preventDefault();
    if (!adjusting) return;
    setSaving(true);
    try {
      toast.success(await managerService.adjustStock(adjusting.book._id, adjustForm.type, Number(adjustForm.quantity), adjustForm.reason));
      setAdjusting(null);
      loadStock();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const submitLevel = async (e: FormEvent) => {
    e.preventDefault();
    if (!levelItem) return;
    setSaving(true);
    try {
      toast.success(await managerService.updateLowStockLevel(levelItem.book._id, Number(level)));
      setLevelItem(null);
      loadStock();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const stockColumns: Column<InventoryItem>[] = [
    {
      header: 'Book',
      render: (i) => (
        <div className="flex items-center gap-3">
          <img src={coverOrPlaceholder(i.book?.coverImage)} alt="" className="h-12 w-9 rounded object-cover" />
          <div>
            <p className="font-medium text-slate-900">{i.book?.title}</p>
            <p className="text-xs text-slate-500">ISBN {i.book?.isbn}</p>
          </div>
        </div>
      ),
    },
    { header: 'Available', render: (i) => <span className="text-lg font-semibold">{i.quantity}</span> },
    { header: 'Warning level', render: (i) => i.lowStockLevel },
    { header: 'Status', render: (i) => <StatusBadge status={stockStatus(i)} /> },
    { header: 'Updated', render: (i) => formatDateTime(i.updatedAt) },
    {
      header: 'Actions',
      render: (i) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => { setAdjusting(i); setAdjustForm({ type: 'ADD', quantity: '1', reason: '' }); }}><PackagePlus size={14} /> Stock</Button>
          <Button size="sm" variant="ghost" onClick={() => { setLevelItem(i); setLevel(String(i.lowStockLevel)); }} aria-label="Warning level"><Settings2 size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={() => { setHistoryBook({ id: i.book._id, title: i.book.title }); setMovePage(1); setTab('history'); }} aria-label="History"><History size={14} /></Button>
        </div>
      ),
    },
  ];

  const movementColumns: Column<StockMovement>[] = [
    { header: 'Date', render: (m) => formatDateTime(m.createdAt) },
    { header: 'Book', render: (m) => m.book?.title },
    { header: 'Type', render: (m) => formatStatus(m.type) },
    { header: 'Change', render: (m) => <span className={`font-semibold ${m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span> },
    { header: 'Stock', render: (m) => `${m.previousQuantity} → ${m.newQuantity}` },
    {
      header: 'Reason / reference',
      render: (m) => (
        <div className="text-xs">
          <p>{m.reason || '-'}</p>
          {m.order && <p className="text-slate-500">Order {m.order.orderNumber}</p>}
          {m.supplierOrder && <p className="text-slate-500">Supplier order {m.supplierOrder.referenceNumber}</p>}
        </div>
      ),
    },
    { header: 'By', render: (m) => m.performedBy?.fullName || 'System' },
  ];

  return (
    <div>
      <PageHeader title="Inventory" description="Stock increases only from supplier deliveries or manual additions, and decreases only after successful payments" />

      <div className="mb-4 flex gap-1 rounded-lg bg-slate-200 p-1 sm:w-fit">
        <button onClick={() => setTab('stock')} className={`rounded-md px-4 py-1.5 text-sm ${tab === 'stock' ? 'bg-white shadow' : ''}`}>Current stock</button>
        <button onClick={() => setTab('history')} className={`rounded-md px-4 py-1.5 text-sm ${tab === 'history' ? 'bg-white shadow' : ''}`}>Stock history</button>
      </div>

      {tab === 'stock' ? (
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search book title or ISBN" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-72" />
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">All stock levels</option>
              <option value="IN_STOCK">In stock</option>
              <option value="LOW_STOCK">Low stock</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
            </select>
          </div>
          <DataTable columns={stockColumns} rows={items} loading={loading} rowKey={(i) => i._id} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <select value={moveType} onChange={(e) => { setMoveType(e.target.value); setMovePage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">All movement types</option>
              {['INITIAL', 'SUPPLIER_DELIVERY', 'MANUAL_ADD', 'MANUAL_REMOVE', 'SALE', 'ORDER_CANCELLED'].map((t) => <option key={t} value={t}>{formatStatus(t)}</option>)}
            </select>
            {historyBook && (
              <span className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-900">
                {historyBook.title}
                <button onClick={() => setHistoryBook(null)} className="font-bold">×</button>
              </span>
            )}
          </div>
          <DataTable columns={movementColumns} rows={movements} loading={loading} rowKey={(m) => m._id} emptyTitle="No stock movements" />
          <Pagination pagination={movePagination} onPageChange={setMovePage} />
        </>
      )}

      <Modal open={!!adjusting} title={`Adjust stock - ${adjusting?.book?.title || ''}`} onClose={() => setAdjusting(null)}>
        <form onSubmit={submitAdjust} className="space-y-4">
          <p className="text-sm text-slate-600">Current stock: <b>{adjusting?.quantity}</b></p>
          <Select label="Action" name="type" value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value as 'ADD' | 'REMOVE' })}>
            <option value="ADD">Add copies</option>
            <option value="REMOVE">Remove copies (damaged / lost)</option>
          </Select>
          <Input label="Quantity" name="quantity" type="number" min={1} required value={adjustForm.quantity} onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })} />
          <Input label="Reason (saved in stock history)" name="reason" required value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAdjusting(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Update stock</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!levelItem} title="Low-stock warning level" onClose={() => setLevelItem(null)} size="sm">
        <form onSubmit={submitLevel} className="space-y-4">
          <Input label="Warn when stock is at or below" name="level" type="number" min={0} required value={level} onChange={(e) => setLevel(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setLevelItem(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;