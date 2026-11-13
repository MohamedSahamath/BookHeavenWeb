// Auth state: the logged-in user and the access token.
// "initialized" becomes true after we try to restore the session on page load.
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import authService, { RegisterData } from '../../services/authService';
import { getErrorMessage, setAccessToken } from '../../services/api';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  initialized: false,
};

// createAsyncThunk = an async action. It dispatches pending / fulfilled / rejected automatically.
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.login(email, password);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const register = createAsyncThunk('auth/register', async (data: RegisterData, { rejectWithValue }) => {
  try {
    return await authService.register(data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// On page refresh the access token (memory) is lost - the refresh cookie gives us a new one
export const restoreSession = createAsyncThunk('auth/restore', async (_, { rejectWithValue }) => {
  try {
    return await authService.refresh();
  } catch {
    return rejectWithValue('No active session');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } finally {
    setAccessToken(null);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    tokenRefreshed(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    sessionExpired(state) {
      state.user = null;
      state.accessToken = null;
    },
    userUpdated(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    const onAuthSuccess = (state: AuthState, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.loading = false;
      state.initialized = true;
      setAccessToken(action.payload.accessToken);
    };

    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, onAuthSuccess)
      .addCase(login.rejected, (state) => {
        state.loading = false;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, onAuthSuccess)
      .addCase(register.rejected, (state) => {
        state.loading = false;
      })
      .addCase(restoreSession.fulfilled, onAuthSuccess)
      .addCase(restoreSession.rejected, (state) => {
        state.initialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
      });
  },
});

export const { tokenRefreshed, sessionExpired, userUpdated } = authSlice.actions;
export default authSlice.reducer;