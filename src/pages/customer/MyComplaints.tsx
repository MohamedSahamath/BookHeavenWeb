import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageSquarePlus } from 'lucide-react';
import complaintService from '../../services/complaintService';
import orderService from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { Complaint, ComplaintType, Order, Pagination as PaginationInfo } from '../../types';
import { COMPLAINT_TYPES } from '../../utils/constants';
import { formatDate, formatStatus } from '../../utils/format';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Input, Select, TextArea } from '../../components/common/Input';

const MyComplaints = () => {
  const [params, setParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ orderId: '', type: 'OTHER' as ComplaintType, subject: '', description: '' });

  const load = () => {
    setLoading(true);
    complaintService
      .getMy(page)
      .then((res) => {
        setComplaints(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  // Load the customer's paid orders for the dropdown, and open the form if an orderId is in the URL
  useEffect(() => {
    orderService.getMyOrders({ limit: 50 }).then((res) => setOrders(res.items.filter((o) => o.paymentStatus !== 'PENDING' && o.paymentStatus !== 'FAILED')));
    const orderId = params.get('orderId');
    if (orderId) {
      const type = (params.get('type') as ComplaintType) || 'OTHER';
      setForm((f) => ({ ...f, orderId, type, subject: type === 'DELIVERY_DELAY' ? 'My order has not arrived within 5 days' : '' }));
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await complaintService.create(form);
      toast.success('Complaint submitted. Our team will respond soon.');
      setOpen(false);
      setForm({ orderId: '', type: 'OTHER', subject: '', description: '' });
      setParams(new URLSearchParams());
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My complaints</h1>
        <Button onClick={() => setOpen(true)}><MessageSquarePlus size={16} /> New complaint</Button>
      </div>

      {loading ? (
        <Loader />
      ) : complaints.length === 0 ? (
        <EmptyState title="No complaints" message="If something goes wrong with an order, let us know here." />
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <Link key={c._id} to={`/complaints/${c._id}`} className="block rounded-xl border border-slate-200 bg-white p-4 hover:shadow">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{c.subject}</p>
                  <p className="text-xs text-slate-500">{c.complaintNumber} · Order {c.order?.orderNumber} · {formatStatus(c.type)} · {formatDate(c.createdAt)}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            </Link>
          ))}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      <Modal open={open} title="Submit a complaint" onClose={() => setOpen(false)} size="lg">
        <form onSubmit={submit} className="space-y-4">
          <Select label="Order" name="orderId" required value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}>
            <option value="">Select an order</option>
            {orders.map((o) => (
              <option key={o._id} value={o._id}>{o.orderNumber} - {formatDate(o.createdAt)} - {formatStatus(o.status)}{o.isDelayed ? ' (DELAYED)' : ''}</option>
            ))}
          </Select>
          <Select label="Complaint type" name="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ComplaintType })} hint="Delivery delay complaints are allowed only after the 5-day delivery date has passed.">
            {COMPLAINT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Input label="Subject" name="subject" required maxLength={150} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <TextArea label="Description" name="description" required maxLength={3000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Submit complaint</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyComplaints;