// Cart state. The cart is stored in MongoDB; Redux keeps a copy so the navbar badge
// and the cart page always show the same numbers.
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';
import { getErrorMessage } from '../../services/api';
import { Cart } from '../../types';
import { logout, sessionExpired } from './authSlice';

interface CartState {
  cart: Cart | null;
  loading: boolean;
}

const initialState: CartState = { cart: null, loading: false };

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    return await cartService.getCart();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ bookId, quantity }: { bookId: string; quantity: number }, { rejectWithValue }) => {
    try {
      return await cartService.addItem(bookId, quantity);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ bookId, quantity }: { bookId: string; quantity: number }, { rejectWithValue }) => {
    try {
      return await cartService.updateItem(bookId, quantity);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeCartItem = createAsyncThunk('cart/remove', async (bookId: string, { rejectWithValue }) => {
  try {
    return await cartService.removeItem(bookId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartCleared(state) {
      state.cart = null;
    },
  },
  extraReducers: (builder) => {
    const setCart = (state: CartState, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
      state.loading = false;
    };
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, setCart)
      // Empty the cart copy when the user logs out
      .addCase(logout.fulfilled, () => initialState)
      .addCase(sessionExpired, () => initialState);
  },
});

export const { cartCleared } = cartSlice.actions;
export default cartSlice.reducer;