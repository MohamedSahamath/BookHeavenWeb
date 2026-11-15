import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import complaintService from '../../services/complaintService';
import { getErrorMessage } from '../../services/api';
import { Complaint, Pagination as PaginationInfo, User } from '../../types';
import { COMPLAINT_TYPES } from '../../utils/constants';
import { formatDate, formatStatus } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintThread from '../../components/common/ComplaintThread';
import DataTable, { Column } from '../../components/dashboard/DataTable';

const ComplaintsManage = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    complaintService
      .getAll({ page, status: status || undefined, type: type || undefined })
      .then((res) => {
        setComplaints(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, status, type]);

  const open = async (id: string) => {
    try {
      setSelected(await complaintService.get(id));
      setNote('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const reply = async (message: string) => {
    if (!selected) return;
    try {
      setSelected(await complaintService.addResponse(selected._id, message));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const changeStatus = async (newStatus: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED') => {
    if (!selected) return;
    setSaving(true);
    try {
      await complaintService.updateStatus(selected._id, newStatus, note || undefined);
      toast.success(`Complaint ${formatStatus(newStatus)}`);
      await open(selected._id);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Complaint>[] = [
    { header: 'Complaint', render: (c) => <div><p className="font-medium text-slate-900">{c.subject}</p><p className="text-xs text-slate-500">{c.complaintNumber}</p></div> },
    { header: 'Customer', render: (c) => (typeof c.customer === 'string' ? '-' : (c.customer as Pick<User, 'fullName'>).fullName) },
    { header: 'Order', render: (c) => c.order?.orderNumber },
    { header: 'Type', render: (c) => formatStatus(c.type) },
    { header: 'Date', render: (c) => formatDate(c.createdAt) },
    { header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { header: '', render: (c) => <Button size="sm" variant="secondary" onClick={() => open(c._id)}>Open</Button> },
  ];

  const closed = selected && (selected.status === 'RESOLVED' || selected.status === 'REJECTED');

  return (
    <div>
      <PageHeader title="Customer complaints" description="Review, respond and resolve customer complaints" />
      <div className="mb-4 flex flex-wrap gap-2">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {['SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">All types</option>
          {COMPLAINT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <DataTable columns={columns} rows={complaints} loading={loading} rowKey={(c) => c._id} emptyTitle="No complaints" />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal open={!!selected} title={selected ? `Complaint ${selected.complaintNumber}` : ''} onClose={() => setSelected(null)} size="lg">
        {selected && (
          <div className="space-y-5">
            {typeof selected.customer !== 'string' && (
              <p className="text-sm text-slate-600">
                Customer: <b>{(selected.customer as Pick<User, 'fullName' | 'email' | 'phone'>).fullName}</b> · {(selected.customer as Pick<User, 'email'>).email} · {(selected.customer as Pick<User, 'phone'>).phone}
                <br />Order status: {formatStatus(selected.order?.status)} · Expected delivery {formatDate(selected.order?.expectedDeliveryDate)}
              </p>
            )}
            <ComplaintThread complaint={selected} onReply={reply} />
            {!closed && (
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="mb-2 text-sm font-semibold">Change status</p>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Resolution note to the customer (optional)" className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <div className="flex flex-wrap gap-2">
                  {selected.status === 'SUBMITTED' && <Button variant="secondary" loading={saving} onClick={() => changeStatus('UNDER_REVIEW')}>Mark under review</Button>}
                  <Button variant="success" loading={saving} onClick={() => changeStatus('RESOLVED')}>Resolve</Button>
                  <Button variant="danger" loading={saving} onClick={() => changeStatus('REJECTED')}>Reject</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComplaintsManage;