import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Power } from 'lucide-react';
import adminService, { ManagerInput } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { Pagination as PaginationInfo, User } from '../../types';
import { formatDate, formatDateTime } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { Column } from '../../components/dashboard/DataTable';
import { Input } from '../../components/common/Input';

const Managers = () => {
  const [managers, setManagers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<ManagerInput>({ fullName: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<User | null>(null);

  const load = () => {
    setLoading(true);
    adminService
      .getManagers({ page })
      .then((res) => {
        setManagers(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]);

  const openForm = (m?: User) => {
    setEditing(m || null);
    setForm({ fullName: m?.fullName || '', email: m?.email || '', phone: m?.phone || '', password: '' });
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form };
      if (editing && !data.password) delete data.password; // keep the old password
      if (editing) await adminService.updateManager(editing._id, data);
      else await adminService.createManager(data);
      toast.success(editing ? 'Manager updated' : 'Manager account created');
      setOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async () => {
    if (!toggling) return;
    try {
      toast.success(await adminService.setManagerStatus(toggling._id, !toggling.isActive));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(null);
    }
  };

  const columns: Column<User>[] = [
    { header: 'Name', render: (m) => <span className="font-medium text-slate-900">{m.fullName}</span> },
    { header: 'Email', render: (m) => m.email },
    { header: 'Mobile', render: (m) => m.phone },
    { header: 'Created', render: (m) => formatDate(m.createdAt) },
    { header: 'Last login', render: (m) => formatDateTime(m.lastLogin) },
    { header: 'Status', render: (m) => <StatusBadge status={m.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      header: 'Actions',
      render: (m) => (
        <div className="flex gap-2">
          <button onClick={() => openForm(m)} className="text-slate-500 hover:text-blue-800" aria-label="Edit"><Pencil size={17} /></button>
          <button onClick={() => setToggling(m)} className="text-slate-500 hover:text-amber-600" aria-label="Toggle"><Power size={17} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Managers" description="Only the Admin can create and manage manager accounts" actions={<Button onClick={() => openForm()}><Plus size={16} /> Add manager</Button>} />
      <DataTable columns={columns} rows={managers} loading={loading} rowKey={(m) => m._id} emptyTitle="No managers yet" />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal open={open} title={editing ? 'Edit manager' : 'Add manager'} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Full name" name="fullName" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Email" name="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Mobile number" name="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input
            label={editing ? 'New password (leave empty to keep)' : 'Password'}
            name="password"
            type="password"
            required={!editing}
            hint="At least 8 characters with a letter and a number"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!toggling}
        title={toggling?.isActive ? 'Deactivate manager?' : 'Activate manager?'}
        message={toggling?.isActive ? 'This manager will be logged out and cannot log in until reactivated.' : 'This manager will be able to log in again.'}
        confirmText={toggling?.isActive ? 'Deactivate' : 'Activate'}
        danger={!!toggling?.isActive}
        onConfirm={toggle}
        onCancel={() => setToggling(null)}
      />
    </div>
  );
};

export default Managers;