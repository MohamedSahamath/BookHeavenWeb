// API calls for books, authors and categories.
import api from './api';
import { ApiResponse, Author, Book, Category, HomeData, Paginated } from '../types';

export interface BookQuery {
  search?: string;
  category?: string;
  author?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
  page?: number;
  limit?: number;
  includeInactive?: string;
}

const bookService = {
  getHome: async () => (await api.get<ApiResponse<HomeData>>('/books/home')).data.data,

  getBooks: async (params: BookQuery): Promise<Paginated<Book[]>> => {
    const res = await api.get<ApiResponse<Book[]>>('/books', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },

  getBook: async (id: string) => (await api.get<ApiResponse<Book>>(`/books/${id}`)).data.data,

  getRecommendations: async (limit = 8) =>
    (await api.get<ApiResponse<{ reason: string; books: Book[] }>>('/books/recommendations', { params: { limit } })).data.data,

  // FormData is used because the form can include a cover image file
  createBook: async (form: FormData) => (await api.post<ApiResponse<Book>>('/books', form)).data.data,
  updateBook: async (id: string, form: FormData) => (await api.put<ApiResponse<Book>>(`/books/${id}`, form)).data.data,
  deleteBook: async (id: string) => (await api.delete<ApiResponse<{ message: string }>>(`/books/${id}`)).data.message,

  // Categories
  getCategories: async (all = false) =>
    (await api.get<ApiResponse<Category[]>>('/categories', { params: all ? { all: 'true' } : {} })).data.data,
  createCategory: async (data: Partial<Category>) => (await api.post<ApiResponse<Category>>('/categories', data)).data.data,
  updateCategory: async (id: string, data: Partial<Category>) =>
    (await api.put<ApiResponse<Category>>(`/categories/${id}`, data)).data.data,
  deleteCategory: async (id: string) => (await api.delete<ApiResponse<null>>(`/categories/${id}`)).data.message,

  // Authors
  getAuthors: async (params: { search?: string; page?: number; limit?: number } = {}): Promise<Paginated<Author[]>> => {
    const res = await api.get<ApiResponse<Author[]>>('/authors', { params });
    return { items: res.data.data, pagination: res.data.pagination! };
  },
  getAuthor: async (id: string, params: { page?: number; sort?: string } = {}) => {
    const res = await api.get<ApiResponse<{ author: Author; books: Book[] }>>(`/authors/${id}`, { params });
    return { ...res.data.data, pagination: res.data.pagination! };
  },
  createAuthor: async (data: Partial<Author>) => (await api.post<ApiResponse<Author>>('/authors', data)).data.data,
  updateAuthor: async (id: string, data: Partial<Author>) =>
    (await api.put<ApiResponse<Author>>(`/authors/${id}`, data)).data.data,
  deleteAuthor: async (id: string) => (await api.delete<ApiResponse<null>>(`/authors/${id}`)).data.message,
};

export default bookService;