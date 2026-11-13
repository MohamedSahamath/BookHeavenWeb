// API calls for the Admin: dashboard, managers, customers, transactions, expenses and finance.
import api from './api';
import { AdminDashboard, Analytics, ApiResponse, Expense, MonthlyRow, Paginated, Payment, User } from '../types';
import { saveBlob } from '../utils/format';

export interface ManagerInput {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface ExpenseInput {
  title: string;
  category: string;
  amount: number;
  expenseDate?: string;
  description?: string;
}

const adminService = {
  getDashboard: async () => (await api.get<ApiResponse<AdminDashboard>>('/admin/dashboard')).data.data,

  // Managers
  getManagers: async (params: { page?: number; search?: string; status?: string }): Promise<Paginated<User[]>> => {
    const res = await api.get<ApiResponse<User[]>>('/admin/managers', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },
  createManager: async (data: ManagerInput) => (await api.post<ApiResponse<User>>('/admin/managers', data)).data.data,
  updateManager: async (id: string, data: ManagerInput) =>
    (await api.put<ApiResponse<User>>(`/admin/managers/${id}`, data)).data.data,
  setManagerStatus: async (id: string, isActive: boolean) =>
    (await api.patch<ApiResponse<User>>(`/admin/managers/${id}/status`, { isActive })).data.message,

  // Customers
  getCustomers: async (params: { page?: number; search?: string; status?: string }): Promise<Paginated<User[]>> => {
    const res = await api.get<ApiResponse<User[]>>('/admin/customers', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },
  setCustomerStatus: async (id: string, isActive: boolean) =>
    (await api.patch<ApiResponse<User>>(`/admin/customers/${id}/status`, { isActive })).data.message,

  // Transactions
  getTransactions: async (params: { page?: number; status?: string; from?: string; to?: string }): Promise<Paginated<Payment[]>> => {
    const res = await api.get<ApiResponse<Payment[]>>('/admin/transactions', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },

  // Expenses
  getExpenses: async (params: { page?: number; category?: string; from?: string; to?: string }) => {
    const res = await api.get<ApiResponse<{ expenses: Expense[]; totalAmount: number }>>('/admin/expenses', { params });
    return { ...res.data.data, pagination: res.data.pagination! };
  },
  createExpense: async (data: ExpenseInput) => (await api.post<ApiResponse<Expense>>('/admin/expenses', data)).data.data,
  updateExpense: async (id: string, data: ExpenseInput) =>
    (await api.put<ApiResponse<Expense>>(`/admin/expenses/${id}`, data)).data.data,
  deleteExpense: async (id: string) => (await api.delete<ApiResponse<null>>(`/admin/expenses/${id}`)).data.message,

  // Finance & analytics (ADMIN only on the backend)
  getAnalytics: async (year: number) => (await api.get<ApiResponse<Analytics>>('/reports/analytics', { params: { year } })).data.data,
  getProfitReport: async (period: 'monthly' | 'quarterly' | 'yearly', year: number) =>
    (await api.get<ApiResponse<MonthlyRow[]>>('/reports/profit', { params: { period, year } })).data.data,

  downloadReport: async (path: string, params: Record<string, string | number>, fileName: string) => {
    const res = await api.get(`/reports/pdf/${path}`, { params, responseType: 'blob' });
    saveBlob(res.data as Blob, fileName);
  },
};

export default adminService;