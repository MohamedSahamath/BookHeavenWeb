import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { Role } from '../types';
import Loader from '../components/common/Loader';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Role[];
}

export const homeForRole = (role?: Role) => (role === 'ADMIN' ? '/admin' : role === 'MANAGER' ? '/manager' : '/');

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, initialized } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!initialized) return <Loader text="Checking your session..." />;

  if (!user) {
    // Remember where the user wanted to go, so we can send them back after login
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return <>{children}</>;
};

// GuestRoute: login/register pages - logged-in users are sent to their home page
export const GuestRoute = ({ children }: { children: ReactNode }) => {
  const { user, initialized } = useAppSelector((s) => s.auth);
  if (!initialized) return <Loader />;
  if (user) return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
};

export default ProtectedRoute;