// The Redux store - one global place for shared state (auth, cart, notifications).
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { sessionExpired, tokenRefreshed } from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import notificationReducer from './slices/notificationSlice';
import { registerAuthHandlers } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    notifications: notificationReducer,
  },
});

// Let the Axios interceptor update Redux when a token is refreshed or the session ends
registerAuthHandlers(
  (token) => store.dispatch(tokenRefreshed(token)),
  () => store.dispatch(sessionExpired())
);

// Types used by the typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;