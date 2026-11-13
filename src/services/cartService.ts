// API calls for the shopping cart (customer only).
import api from './api';
import { ApiResponse, Cart } from '../types';

const cartService = {
  getCart: async () => (await api.get<ApiResponse<Cart>>('/cart')).data.data,
  addItem: async (bookId: string, quantity: number) =>
    (await api.post<ApiResponse<Cart>>('/cart/items', { bookId, quantity })).data.data,
  updateItem: async (bookId: string, quantity: number) =>
    (await api.patch<ApiResponse<Cart>>(`/cart/items/${bookId}`, { quantity })).data.data,
  removeItem: async (bookId: string) => (await api.delete<ApiResponse<Cart>>(`/cart/items/${bookId}`)).data.data,
  clearCart: async () => (await api.delete<ApiResponse<Cart>>('/cart')).data.data,
};

export default cartService;