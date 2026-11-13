// API calls for complaints.
import api from './api';
import { ApiResponse, Complaint, ComplaintType, Paginated } from '../types';

const complaintService = {
  create: async (data: { orderId: string; type: ComplaintType; subject: string; description: string }) =>
    (await api.post<ApiResponse<Complaint>>('/complaints', data)).data.data,

  getMy: async (page = 1): Promise<Paginated<Complaint[]>> => {
    const res = await api.get<ApiResponse<Complaint[]>>('/complaints/my', { params: { page } });
    return { items: res.data.data, pagination: res.data.pagination! };
  },

  get: async (id: string) => (await api.get<ApiResponse<Complaint>>(`/complaints/${id}`)).data.data,

  getAll: async (params: { page?: number; status?: string; type?: string; search?: string }): Promise<Paginated<Complaint[]>> => {
    const res = await api.get<ApiResponse<Complaint[]>>('/complaints', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },

  updateStatus: async (id: string, status: string, note?: string) =>
    (await api.patch<ApiResponse<Complaint>>(`/complaints/${id}/status`, { status, note })).data.data,

  addResponse: async (id: string, message: string) =>
    (await api.post<ApiResponse<Complaint>>(`/complaints/${id}/responses`, { message })).data.data,
};

export default complaintService;