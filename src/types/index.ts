// Shared TypeScript interfaces for the frontend. They match the JSON returned by the backend.

export type Role = 'ADMIN' | 'MANAGER' | 'CUSTOMER';

export type OrderStatus =
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DISPATCHED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED';
export type SupplierOrderStatus = 'PENDING' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'NOT_RECEIVED';
export type ComplaintStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
export type ComplaintType = 'DELIVERY_DELAY' | 'DAMAGED_BOOK' | 'WRONG_BOOK' | 'PAYMENT_ISSUE' | 'OTHER';
export type Availability = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

// Standard API response shape
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface Paginated<T> {
  items: T;
  pagination: Pagination;
}

// ---------- Users ----------
export interface Address {
  _id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  addresses?: Address[];
  lastLogin?: string;
  createdAt: string;
  orderCount?: number;
}

// ---------- Catalog ----------
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  bookCount?: number;
}

export interface Author {
  _id: string;
  name: string;
  biography?: string;
  nationality?: string;
  photoUrl?: string;
  isActive: boolean;
  bookCount?: number;
}

export interface Book {
  _id: string;
  title: string;
  isbn: string;
  description: string;
  authors: Author[];
  category: Category;
  price: number;
  sellingPrice: number;
  discountPercent: number;
  purchaseCost: number;
  coverImage: string;
  publisher?: string;
  publicationYear?: number;
  language: string;
  pages?: number;
  isFeatured: boolean;
  isActive: boolean;
  soldCount: number;
  viewCount: number;
  stock: number;
  lowStockLevel: number;
  availability: Availability;
  createdAt: string;
}

export interface HomeData {
  featured: Book[];
  latest: Book[];
  bestSellers: Book[];
  popular: Book[];
  offers: Book[];
  categories: Category[];
  authors: Author[];
  recommended: { reason: string; books: Book[] };
}

// ---------- Cart ----------
export interface CartItem {
  bookId: string;
  title: string;
  isbn: string;
  coverImage: string;
  authorNames: string[];
  price: number;
  unitPrice: number;
  quantity: number;
  stock: number;
  lineTotal: number;
  isAvailable: boolean;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  hasStockProblems: boolean;
}

// ---------- Orders ----------
export interface OrderItem {
  book: string;
  title: string;
  isbn: string;
  authorNames: string[];
  coverImage?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface StatusHistory {
  status: OrderStatus;
  changedAt: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string | Pick<User, '_id' | 'fullName' | 'email' | 'phone'>;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  invoiceNumber?: string;
  confirmedAt?: string;
  expectedDeliveryDate?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  statusHistory: StatusHistory[];
  isDelayed?: boolean;
  createdAt: string;
}

export interface Payment {
  _id: string;
  order: string | Pick<Order, '_id' | 'orderNumber' | 'invoiceNumber' | 'status'>;
  customer: string | Pick<User, '_id' | 'fullName' | 'email'>;
  provider: string;
  method: string;
  sessionId: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  cardBrand?: string;
  cardLast4?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Delivery {
  _id: string;
  order: string | Pick<Order, '_id' | 'orderNumber' | 'totalAmount' | 'status'>;
  customerName: string;
  contactNumber: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  orderDate: string;
  expectedDeliveryDate: string;
  dispatchDate?: string;
  deliveredDate?: string;
  status: string;
  courierName?: string;
  trackingNumber?: string;
  notes?: string;
  isDelayed?: boolean;
}

export interface OrderDetails {
  order: Order;
  payment: Payment | null;
  delivery: Delivery | null;
}

// ---------- Suppliers & inventory ----------
export interface Supplier {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: { street: string; city: string; district: string; postalCode?: string };
  suppliedBooks: Pick<Book, '_id' | 'title' | 'isbn'>[];
  notes?: string;
  isActive: boolean;
}

export interface SupplierOrder {
  _id: string;
  referenceNumber: string;
  supplier: Pick<Supplier, '_id' | 'name' | 'contactPerson' | 'phone'>;
  book: Pick<Book, '_id' | 'title' | 'isbn' | 'coverImage'>;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  orderDate: string;
  expectedDeliveryDate: string;
  actualReceivedDate?: string;
  status: SupplierOrderStatus;
  notes?: string;
  createdBy?: { fullName: string };
}

export interface InventoryItem {
  _id: string;
  book: Pick<Book, '_id' | 'title' | 'isbn' | 'coverImage' | 'price' | 'isActive'>;
  quantity: number;
  lowStockLevel: number;
  updatedAt: string;
}

export interface StockMovement {
  _id: string;
  book: Pick<Book, '_id' | 'title' | 'isbn'>;
  type: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  performedBy?: { fullName: string; role: Role };
  order?: { orderNumber: string };
  supplierOrder?: { referenceNumber: string };
  createdAt: string;
}

// ---------- Complaints & notifications ----------
export interface ComplaintResponse {
  responder: { _id: string; fullName: string; role: Role } | string;
  responderRole: Role;
  message: string;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  complaintNumber: string;
  customer: string | Pick<User, '_id' | 'fullName' | 'email' | 'phone'>;
  order: Pick<Order, '_id' | 'orderNumber' | 'status' | 'totalAmount' | 'expectedDeliveryDate' | 'deliveredAt'>;
  type: ComplaintType;
  subject: string;
  description: string;
  status: ComplaintStatus;
  responses: ComplaintResponse[];
  statusHistory: { status: ComplaintStatus; changedAt: string; note?: string }[];
  resolvedAt?: string;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// ---------- Admin ----------
export interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  description?: string;
  recordedBy?: { fullName: string };
}

export interface MonthlyRow {
  month?: number;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
  booksSold?: number;
}

export interface AdminDashboard {
  totalCustomers: number;
  totalManagers: number;
  totalBooks: number;
  totalBooksSold: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  pendingComplaints: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  totalSupplierPayments: number;
  yearRevenue: number;
  yearExpenses: number;
  yearProfit: number;
  monthly: MonthlyRow[];
  recentOrders: Order[];
}

export interface ManagerDashboard {
  totalBooks: number;
  availableStock: number;
  lowStockBooks: number;
  outOfStockBooks: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  dispatchedOrders: number;
  deliveredOrders: number;
  delayedDeliveries: number;
  pendingSupplierDeliveries: number;
  receivedSupplierDeliveries: number;
  overdueSupplierDeliveries: number;
  openComplaints: number;
  lowStockList: InventoryItem[];
}

export interface Analytics {
  year: number;
  monthly: MonthlyRow[];
  bestSellers: { _id: string; title: string; quantity: number; revenue: number }[];
  salesByCategory: { _id: string; category: string; quantity: number; revenue: number }[];
  inventory: { totalStock: number; outOfStock: number; lowStock: number; inStock: number };
  expenseBreakdown: { _id: string; total: number; count: number }[];
}