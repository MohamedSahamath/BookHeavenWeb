import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchCart } from '../redux/slices/cartSlice';

const CustomerLayout = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  // Load the customer's cart once they are logged in (for the navbar badge)
  useEffect(() => {
    if (user?.role === 'CUSTOMER') dispatch(fetchCart());
  }, [user, dispatch]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;