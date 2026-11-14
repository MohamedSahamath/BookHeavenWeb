import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCard from './AuthCard';
import { Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import { getErrorMessage } from '../../services/api';

const ResetPassword = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    try {
      const message = await authService.resetPassword(token, password, confirmPassword);
      toast.success(message);
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Input label="New password" type="password" name="password" required hint="At least 8 characters with a letter and a number" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Confirm new password" type="password" name="confirmPassword" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <Button type="submit" fullWidth loading={loading}>
          Reset password
        </Button>
        <p className="text-center text-sm">
          <Link to="/login" className="text-blue-800 hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;