import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCard from './AuthCard';
import { Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { register } from '../../redux/slices/authSlice';

type Errors = Partial<Record<'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword', string>>;

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector((s) => s.auth.loading);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!/^0\d{9}$/.test(form.phone)) e.phone = 'Mobile number must be 10 digits starting with 0 (e.g. 0771234567)';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      e.password = 'At least 8 characters with a letter and a number';
    }
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      toast.success('Account created! Welcome to BookHaven.');
      navigate('/');
    } else {
      setServerError(result.payload as string);
    }
  };

  const set = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });

  return (
    <AuthCard title="Create your account" subtitle="Buy books online and get them delivered in 5 days">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {serverError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
        <Input label="Full name" name="fullName" value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
        <Input label="Email" name="email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="Mobile number" name="phone" placeholder="0771234567" value={form.phone} onChange={set('phone')} error={errors.phone} />
        <Input label="Password" name="password" type="password" value={form.password} onChange={set('password')} error={errors.password} />
        <Input label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-800 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
};

export default Register;