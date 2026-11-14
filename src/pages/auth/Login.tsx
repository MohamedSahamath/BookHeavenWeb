import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCard from './AuthCard';
import { Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { login } from '../../redux/slices/authSlice';
import { homeForRole } from '../../routes/ProtectedRoute';

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useAppSelector((s) => s.auth.loading);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const from = (location.state as { from?: string } | null)?.from;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await dispatch(login(form));

    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.fullName.split(' ')[0]}!`);
      const role = result.payload.user.role;
      // Customers return to the page they came from; staff go to their dashboard
      navigate(role === 'CUSTOMER' && from ? from : homeForRole(role), { replace: true });
    } else {
      setError(result.payload as string);
    }
  };

  return (
    <AuthCard title="Sign in to your account" subtitle="Customers, managers and admins log in here">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Input label="Email" name="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" name="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-blue-800 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        New to BookHaven?{' '}
        <Link to="/register" className="font-medium text-blue-800 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
};

export default Login;