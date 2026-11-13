// UI constants (must match the backend values).

export const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

export const DELIVERY_CHARGE = 400;
export const FREE_DELIVERY_THRESHOLD = 5000;

export const ORDER_STATUSES = [
  'PAYMENT_PENDING', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
];

// The normal order journey (used for the tracking timeline)
export const ORDER_TIMELINE = ['CONFIRMED', 'PROCESSING', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export const COMPLAINT_TYPES = [
  { value: 'DELIVERY_DELAY', label: 'Delivery delay (over 5 days)' },
  { value: 'DAMAGED_BOOK', label: 'Damaged book' },
  { value: 'WRONG_BOOK', label: 'Wrong book received' },
  { value: 'PAYMENT_ISSUE', label: 'Payment issue' },
  { value: 'OTHER', label: 'Other' },
];

export const EXPENSE_CATEGORIES = ['DELIVERY', 'SALARY', 'RENT', 'UTILITIES', 'MARKETING', 'OTHER'];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'popular', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'title', label: 'Title A-Z' },
];

// Tailwind colour classes for status badges
export const STATUS_COLORS: Record<string, string> = {
  PAYMENT_PENDING: 'bg-amber-100 text-amber-800',
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  DISPATCHED: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-fuchsia-100 text-fuchsia-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUND_PENDING: 'bg-orange-100 text-orange-800',
  REFUNDED: 'bg-slate-200 text-slate-800',
  PARTIALLY_RECEIVED: 'bg-sky-100 text-sky-800',
  RECEIVED: 'bg-green-100 text-green-800',
  NOT_RECEIVED: 'bg-red-100 text-red-800',
  SUBMITTED: 'bg-amber-100 text-amber-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  IN_STOCK: 'bg-green-100 text-green-800',
  LOW_STOCK: 'bg-amber-100 text-amber-800',
  OUT_OF_STOCK: 'bg-red-100 text-red-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-slate-200 text-slate-700',
  DELAYED: 'bg-red-100 text-red-800',
};