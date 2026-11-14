import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from './AuthCard';
import { Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import { getErrorMessage } from '../../services/api';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      setMessage(await authService.forgotPassword(identifier));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Forgot your password?" subtitle="Enter your registered email or mobile number">
      {message ? (
        <div className="space-y-4 text-center">
          <p className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-800">{message}</p>
          <Link to="/login" className="text-sm font-medium text-blue-800 hover:underline">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Input label="Email or mobile number" name="identifier" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          <Button type="submit" fullWidth loading={loading}>
            Send reset link
          </Button>
          <p className="text-center text-sm">
            <Link to="/login" className="text-blue-800 hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;