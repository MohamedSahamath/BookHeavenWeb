import { FormEvent, useState } from 'react';
import { Address } from '../../types';
import { AddressInput } from '../../services/authService';
import { SRI_LANKA_DISTRICTS } from '../../utils/constants';
import { Input, Select } from './Input';
import Button from './Button';

interface AddressFormProps {
  initial?: Address;
  defaultName?: string;
  defaultPhone?: string;
  loading?: boolean;
  onSubmit: (data: AddressInput) => void;
  onCancel?: () => void;
}

const AddressForm = ({ initial, defaultName = '', defaultPhone = '', loading, onSubmit, onCancel }: AddressFormProps) => {
  const [form, setForm] = useState<AddressInput>({
    label: initial?.label || 'Home',
    recipientName: initial?.recipientName || defaultName,
    phone: initial?.phone || defaultPhone,
    addressLine1: initial?.addressLine1 || '',
    addressLine2: initial?.addressLine2 || '',
    city: initial?.city || '',
    district: initial?.district || 'Colombo',
    postalCode: initial?.postalCode || '',
    isDefault: initial?.isDefault || false,
  });
  const [error, setError] = useState('');

  const set = (field: keyof AddressInput, value: string | boolean) => setForm({ ...form, [field]: value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^0\d{9}$/.test(form.phone)) return setError('Phone must be 10 digits starting with 0');
    if (!/^\d{5}$/.test(form.postalCode)) return setError('Postal code must be 5 digits');
    setError('');
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
      <Input label="Label" name="label" placeholder="Home / Office" value={form.label} onChange={(e) => set('label', e.target.value)} />
      <Input label="Recipient name" name="recipientName" required value={form.recipientName} onChange={(e) => set('recipientName', e.target.value)} />
      <Input label="Contact number" name="phone" required placeholder="0771234567" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
      <Input label="Address line 1" name="addressLine1" required value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
      <Input label="Address line 2 (optional)" name="addressLine2" value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} />
      <Input label="City" name="city" required value={form.city} onChange={(e) => set('city', e.target.value)} />
      <Select label="District" name="district" value={form.district} onChange={(e) => set('district', e.target.value)}>
        {SRI_LANKA_DISTRICTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </Select>
      <Input label="Postal code" name="postalCode" required placeholder="10100" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
        <input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} /> Set as default address
      </label>
      <div className="flex justify-end gap-2 sm:col-span-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={loading}>Save address</Button>
      </div>
    </form>
  );
};

export default AddressForm;