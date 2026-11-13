// API calls for checkout/payment, orders, invoices and deliveries.
import api from './api';
import { ApiResponse, Delivery, Order, OrderDetails, Paginated } from '../types';
import { saveBlob } from '../utils/format';

export interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  delayed?: string;
  district?: string;
  from?: string;
  to?: string;
}

const orderService = {
  // Payment
  checkout: async (addressId: string) =>
    (await api.post<ApiResponse<{ checkoutUrl: string; orderId: string }>>('/payments/checkout', { addressId })).data.data,
  verifyPayment: async (sessionId: string) =>
    (await api.post<ApiResponse<{ status: string; order: Order | null }>>('/payments/verify', { sessionId })).data.data,
  cancelPayment: async (orderId: string) =>
    (await api.post<ApiResponse<{ status: string }>>('/payments/cancel', { orderId })).data.data,

  // Customer orders
  getMyOrders: async (params: ListParams): Promise<Paginated<Order[]>> => {
    const res = await api.get<ApiResponse<Order[]>>('/orders/my', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },
  getOrder: async (id: string) => (await api.get<ApiResponse<OrderDetails>>(`/orders/${id}`)).data.data,
  cancelOrder: async (id: string) => (await api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`)).data.data,
  downloadInvoice: async (id: string, fileName: string) => {
    const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
    saveBlob(res.data as Blob, `${fileName}.pdf`);
  },

  // Staff orders
  getAllOrders: async (params: ListParams): Promise<Paginated<Order[]>> => {
    const res = await api.get<ApiResponse<Order[]>>('/orders', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },
  updateOrderStatus: async (id: string, status: 'PROCESSING' | 'CANCELLED', note?: string) =>
    (await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status, note })).data.data,

  // Deliveries
  getDeliveries: async (params: ListParams): Promise<Paginated<Delivery[]>> => {
    const res = await api.get<ApiResponse<Delivery[]>>('/deliveries', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },
  updateDelivery: async (
    orderId: string,
    data: { status: string; courierName?: string; trackingNumber?: string; notes?: string }
  ) => (await api.patch<ApiResponse<unknown>>(`/deliveries/${orderId}`, data)).data.message,
  runDelayCheck: async () => (await api.post<ApiResponse<{ notified: number }>>('/deliveries/check-delays')).data.message,
};

export default orderService;