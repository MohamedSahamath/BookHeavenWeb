// API calls for manager operations: dashboard, suppliers, supplier orders and inventory.
import api from './api';
import {
  ApiResponse,
  InventoryItem,
  ManagerDashboard,
  Paginated,
  StockMovement,
  Supplier,
  SupplierOrder,
} from '../types';
import { saveBlob } from '../utils/format';

export interface SupplierInput {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: { street: string; city: string; district: string; postalCode?: string };
  notes?: string;
}

export interface SupplierOrderInput {
  supplier: string;
  book: string;
  orderedQuantity: number;
  unitCost: number;
  orderDate?: string;
  expectedDeliveryDate: string;
  notes?: string;
}

const managerService = {
  getDashboard: async () => (await api.get<ApiResponse<ManagerDashboard>>('/manager/dashboard')).data.data,

  // Suppliers
  getSuppliers: async (params: { page?: number; search?: string; status?: string; limit?: number }): Promise<Paginated<Supplier[]>> => {
    const res = await api.get<ApiResponse<Supplier[]>>('/suppliers', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },
  createSupplier: async (data: SupplierInput) => (await api.post<ApiResponse<Supplier>>('/suppliers', data)).data.data,
  updateSupplier: async (id: string, data: SupplierInput) =>
    (await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data)).data.data,
  toggleSupplier: async (id: string) => (await api.patch<ApiResponse<Supplier>>(`/suppliers/${id}/status`)).data.message,
  deleteSupplier: async (id: string) => (await api.delete<ApiResponse<unknown>>(`/suppliers/${id}`)).data.message,

  // Supplier orders (deliveries)
  getSupplierOrders: async (params: { page?: number; status?: string; supplier?: string }): Promise<Paginated<SupplierOrder[]>> => {
    const res = await api.get<ApiResponse<SupplierOrder[]>>('/suppliers/orders', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },
  createSupplierOrder: async (data: SupplierOrderInput) =>
    (await api.post<ApiResponse<SupplierOrder>>('/suppliers/orders', data)).data.message,
  receiveSupplierOrder: async (id: string, receivedQuantity: number, receivedDate?: string) =>
    (await api.patch<ApiResponse<SupplierOrder>>(`/suppliers/orders/${id}/receive`, { receivedQuantity, receivedDate })).data.message,
  markNotReceived: async (id: string, notes?: string) =>
    (await api.patch<ApiResponse<SupplierOrder>>(`/suppliers/orders/${id}/not-received`, { notes })).data.message,
  deleteSupplierOrder: async (id: string) => (await api.delete<ApiResponse<null>>(`/suppliers/orders/${id}`)).data.message,

  // Inventory
  getInventory: async (params: { page?: number; search?: string; status?: string }): Promise<Paginated<InventoryItem[]>> => {
    const res = await api.get<ApiResponse<InventoryItem[]>>('/inventory', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },
  adjustStock: async (bookId: string, type: 'ADD' | 'REMOVE', quantity: number, reason: string) =>
    (await api.patch<ApiResponse<InventoryItem>>(`/inventory/${bookId}/adjust`, { type, quantity, reason })).data.message,
  updateLowStockLevel: async (bookId: string, lowStockLevel: number) =>
    (await api.patch<ApiResponse<InventoryItem>>(`/inventory/${bookId}/low-stock-level`, { lowStockLevel })).data.message,
  getMovements: async (params: { page?: number; book?: string; type?: string }): Promise<Paginated<StockMovement[]>> => {
    const res = await api.get<ApiResponse<StockMovement[]>>('/inventory/movements', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },

  // Operational PDF reports (inventory, supplier deliveries, orders)
  downloadReport: async (path: string, params: Record<string, string | number>, fileName: string) => {
    const res = await api.get(`/reports/pdf/${path}`, { params, responseType: 'blob' });
    saveBlob(res.data as Blob, fileName);
  },
};

export default managerService;