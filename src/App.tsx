import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { useAppDispatch } from './hooks/useRedux';
import { restoreSession } from './redux/slices/authSlice';

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </>
  );
};

export default App;