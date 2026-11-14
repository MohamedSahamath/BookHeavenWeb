import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import authService, { AddressInput } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { Address } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { userUpdated } from '../../redux/slices/authSlice';
import { Input, Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AddressForm from '../../components/common/AddressForm';

type Tab = 'profile' | 'contact' | 'password' | 'addresses';

const Profile = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user)!;
  const [tab, setTab] = useState<Tab>('profile');

  // Profile
  const [fullName, setFullName] = useState(user.fullName);
  const [savingProfile, setSavingProfile] = useState(false);

  // Contact change
  const [contactType, setContactType] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [contactValue, setContactValue] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Password
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deleting, setDeleting] = useState<Address | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    authService.getAddresses().then(setAddresses).catch(() => undefined);
  }, []);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      dispatch(userUpdated(await authService.updateMe(fullName)));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      toast.success(await authService.requestContactChange(contactType, contactValue));
      setOtpSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setContactLoading(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      dispatch(userUpdated(await authService.verifyContactChange(otp)));
      toast.success(`${contactType === 'EMAIL' ? 'Email' : 'Mobile number'} updated`);
      setOtpSent(false);
      setOtp('');
      setContactValue('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setContactLoading(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('New passwords do not match');
    setSavingPassword(true);
    try {
      toast.success(await authService.changePassword(passwords.currentPassword, passwords.newPassword));
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  const saveAddress = async (data: AddressInput) => {
    setSavingAddress(true);
    try {
      setAddresses(editing ? await authService.updateAddress(editing._id, data) : await authService.addAddress(data));
      toast.success('Address saved');
      setShowAddressForm(false);
      setEditing(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async () => {
    if (!deleting) return;
    try {
      setAddresses(await authService.deleteAddress(deleting._id));
      toast.success('Address deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'contact', label: 'Email & mobile' },
    { key: 'password', label: 'Password' },
    { key: 'addresses', label: 'Addresses' },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My profile</h1>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-slate-200 p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${tab === t.key ? 'bg-white shadow' : 'text-slate-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="space-y-4">
            <Input label="Full name" name="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Email" name="email" value={user.email} disabled />
            <Input label="Mobile number" name="phone" value={user.phone} disabled />
            <Button type="submit" loading={savingProfile}>Save changes</Button>
          </form>
        )}

        {tab === 'contact' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">To change your email or mobile number we send a 6-digit code to the NEW contact to verify it belongs to you.</p>
            {!otpSent ? (
              <form onSubmit={sendOtp} className="space-y-4">
                <Select label="What do you want to change?" name="contactType" value={contactType} onChange={(e) => setContactType(e.target.value as 'EMAIL' | 'PHONE')}>
                  <option value="EMAIL">Email (current: {user.email})</option>
                  <option value="PHONE">Mobile number (current: {user.phone})</option>
                </Select>
                <Input
                  label={contactType === 'EMAIL' ? 'New email' : 'New mobile number'}
                  name="contactValue"
                  required
                  type={contactType === 'EMAIL' ? 'email' : 'tel'}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                />
                <Button type="submit" loading={contactLoading}>Send verification code</Button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4">
                <Input label={`Code sent to ${contactValue}`} name="otp" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setOtpSent(false)}>Back</Button>
                  <Button type="submit" loading={contactLoading}>Verify & update</Button>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === 'password' && (
          <form onSubmit={changePassword} className="space-y-4">
            <Input label="Current password" type="password" name="currentPassword" required value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
            <Input label="New password" type="password" name="newPassword" required hint="At least 8 characters with a letter and a number" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
            <Input label="Confirm new password" type="password" name="confirm" required value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
            <Button type="submit" loading={savingPassword}>Change password</Button>
          </form>
        )}

        {tab === 'addresses' && (
          <div>
            <div className="mb-4 flex justify-end">
              <Button size="sm" onClick={() => { setEditing(null); setShowAddressForm(true); }}><Plus size={14} /> Add address</Button>
            </div>
            {addresses.length === 0 && <p className="text-sm text-slate-500">No saved addresses.</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((a) => (
                <div key={a._id} className="rounded-lg border border-slate-200 p-4 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold">{a.label} {a.isDefault && <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800">Default</span>}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(a); setShowAddressForm(true); }} className="text-slate-500 hover:text-blue-800" aria-label="Edit"><Pencil size={16} /></button>
                      <button onClick={() => setDeleting(a)} className="text-slate-500 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p>{a.recipientName} · {a.phone}</p>
                  <p className="text-slate-600">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</p>
                  <p className="text-slate-600">{a.city}, {a.district} {a.postalCode}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal open={showAddressForm} title={editing ? 'Edit address' : 'Add address'} onClose={() => setShowAddressForm(false)} size="lg">
        <AddressForm
          key={editing?._id || 'new'}
          initial={editing || undefined}
          defaultName={user.fullName}
          defaultPhone={user.phone}
          loading={savingAddress}
          onSubmit={saveAddress}
          onCancel={() => setShowAddressForm(false)}
        />
      </Modal>
      <ConfirmDialog open={!!deleting} title="Delete address?" message="This address will be removed from your account." confirmText="Delete" onConfirm={deleteAddress} onCancel={() => setDeleting(null)} />
    </div>
  );
};

export default Profile;