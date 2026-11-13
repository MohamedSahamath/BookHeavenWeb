// Unread notification count for the bell icon.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';
import { logout } from './authSlice';

interface NotificationState {
  unreadCount: number;
}

const initialState: NotificationState = { unreadCount: 0 };

export const fetchUnreadCount = createAsyncThunk('notifications/unread', async () =>
  notificationService.getUnreadCount()
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    unreadCountSet(state, action: { payload: number }) {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const { unreadCountSet } = notificationSlice.actions;
export default notificationSlice.reducer;