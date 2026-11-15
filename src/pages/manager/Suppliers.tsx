import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Power, Trash2 } from 'lucide-react';
import managerService, { SupplierInput } from '../../services/managerService';
import { getErrorMessage } from '../../services/api';
import { Pagination as PaginationInfo, Supplier } from '../../types';
import { SRI_LANKA_DISTRICTS } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { Column } from '../../components/dashboard/DataTable';
import { Input, Select, TextArea } from '../../components/common/Input';

const emptyForm: SupplierInput = {
  name: '', contactPerson: '', email: '', phone: '', address: { street: '', city: '', district: 'Colombo', postalCode: '' }, notes: '',
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const load = () => {
    setLoading(true);
    managerService
      .getSuppliers({ page, search: debounced || undefined })
      .then((res) => {
        setSuppliers(res.items);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, debounced]);

  const openForm = (s?: Supplier) => {
    setEditing(s || null);
    setForm(s ? { name: s.name, contactPerson: s.contactPerson, email: s.email, phone: s.phone, address: { ...s.address }, notes: s.notes || '' } : emptyForm);
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await managerService.updateSupplier(editing._id, form);
      else await managerService.createSupplier(form);
      toast.success('Supplier saved');
      setOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (s: Supplier) => {
    try {
      toast.success(await managerService.toggleSupplier(s._id));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      toast.success(await managerService.deleteSupplier(deleting._id));
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const setAddress = (field: keyof SupplierInput['address'], value: string) => setForm({ ...form, address: { ...form.address, [field]: value } });

  const columns: Column<Supplier>[] = [
    { header: 'Supplier', render: (s) => <div><p className="font-medium text-slate-900">{s.name}</p><p className="text-xs text-slate-500">{s.contactPerson}</p></div> },
    { header: 'Contact', render: (s) => <div className="text-xs"><p>{s.phone}</p><p>{s.email}</p></div> },
    { header: 'Address', render: (s) => <span className="text-xs">{s.address.street}, {s.address.city}, {s.address.district}</span> },
    { header: 'Books supplied', render: (s) => <span className="text-xs">{s.suppliedBooks.length ? s.suppliedBooks.map((b) => b.title).join(', ') : '-'}</span> },
    { header: 'Status', render: (s) => <StatusBadge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      header: 'Actions',
      render: (s) => (
        <div className="flex gap-2">
          <button onClick={() => openForm(s)} className="text-slate-500 hover:text-blue-800" aria-label="Edit"><Pencil size={17} /></button>
          <button onClick={() => toggle(s)} className="text-slate-500 hover:text-amber-600" aria-label="Toggle"><Power size={17} /></button>
          <button onClick={() => setDeleting(s)} className="text-slate-500 hover:text-red-600" aria-label="Delete"><Trash2 size={17} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Suppliers" description="Companies that supply books to BookHaven" actions={<Button onClick={() => openForm()}><Plus size={16} /> Add supplier</Button>} />
      <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search suppliers..." className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-72" />
      <DataTable columns={columns} rows={suppliers} loading={loading} rowKey={(s) => s._id} />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal open={open} title={editing ? 'Edit supplier' : 'Add supplier'} onClose={() => setOpen(false)} size="lg">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Input label="Supplier name" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Contact person" name="contactPerson" required value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          <Input label="Email" name="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" name="phone" required placeholder="0112345678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Street" name="street" required value={form.address.street} onChange={(e) => setAddress('street', e.target.value)} />
          <Input label="City" name="city" required value={form.address.city} onChange={(e) => setAddress('city', e.target.value)} />
          <Select label="District" name="district" value={form.address.district} onChange={(e) => setAddress('district', e.target.value)}>
            {SRI_LANKA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Input label="Postal code" name="postalCode" value={form.address.postalCode} onChange={(e) => setAddress('postalCode', e.target.value)} />
          <div className="sm:col-span-2">
            <TextArea label="Notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save supplier</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleting} title="Delete supplier?" message="Suppliers with order history are deactivated instead of deleted." confirmText="Delete" onConfirm={remove} onCancel={() => setDeleting(null)} />
    </div>
  );
};

export default Suppliers;